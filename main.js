const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Find user's home directory (this is where Angular lives)
const home =
	process.env.APPDATA ||
	(process.platform == 'darwin'
		? process.env.HOME + 'Library/Preferences'
		: '/var/local');

// Angular schematic location
const schematicDirectory = '/@angular/cli/node_modules/@schematics/angular';

// Check if the user passed an Angular directory as a cli argument
const installPath =
	process.argv.length > 2
		? process.argv[2]
		: home + '/npm/node_modules' + schematicDirectory;

/**
 * Convert the file in-place
 */
function convertFile(filename) {
	// Load the file
	fs.readFile(filename, 'utf8', (error, data) => {
		if (error) {
			console.log(chalk.red('ERROR\t\t'), filename);
			console.log(chalk.red('Cannot read file.'));

			return;
		}

		if (!data) {
			console.log(chalk.yellow('EMPTY\t\t'), filename);

			return;
		}

		if (filename.includes('ng-package.json')) {
			console.log(chalk.yellow('SKIPPING\t'), filename);

			return;
		}

		// Format the file
		data = data.replace(/[ ]{2}/g, '\t');

		// tslint.json
		if (filename.toLowerCase().includes('tslint.json')) {
			data = data.replace(/"spaces"/g, '"tabs", 2');
		}

		// .editorconfig
		if (filename.toLowerCase().includes('__dot__editorconfig')) {
			data = data.replace(/=[\w\W]space/g, '= tab');
		}

		// Save the file
		fs.writeFile(filename, data, (error) => {
			if (error) {
				console.log(chalk.red('ERROR\t\t'), filename);
				console.log(chalk.red('Cannot save file.'));
			}
			else {
				console.log(chalk.green('SUCCESS\t\t'), filename);
			}
		});
	});
}

/**
 * Traverse the folder, searching for files to convert
 */
function traverse(installPath) {
	fs.readdir(installPath, (error, files) => {
		if (error) {
			console.log(chalk.red('ERROR\t\t'), installPath);
			console.log(chalk.red('Cannot traverse installPath.'));
			console.log(chalk.red(error));

			return;
		}

		files.forEach((file) => {
			const filename = path.basename(file);

			if (
				filename.includes('node_modules') ||
				filename.indexOf('.') == 0
			) {
				console.log(chalk.yellow('SKIPPING\t'), file);

				return;
			}

			file = installPath + '/' + file;

			if (fs.lstatSync(file).isDirectory()) {
				traverse(file);
			}
			else {
				convertFile(file);
			}
		});
	});
}

// Start the conversion
traverse(installPath);
