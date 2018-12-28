const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Find user's home directory (this is where Angular lives)
let home = '';

switch (process.platform) {
	case 'darwin':
		home = process.env.HOME + 'Library/Preferences/npm';
		break;

	case 'linux':
		home = '/usr/lib';
		break;

	case 'win32':
		home = process.env.APPDATA + '/npm';
		break;
}

// Angular schematic location
const schematicDirectory = '/@angular/cli/node_modules/@schematics/angular';

// Check if the user passed an Angular directory as a cli argument
const installPath =
	process.argv.length > 2
		? process.argv[2]
		: home + '/node_modules' + schematicDirectory;

/**
 * Convert the file in-place
 */
function convertFile(filename) {
	// Load the file
	fs.readFile(filename, 'utf8', (error, data) => {
		if (
			filename.includes('.json') || // Whitelist JSON
			filename.includes('.ts') || // Whitelist Typescript
			filename.includes('.html') || // Whitelist HTML
			filename.includes('.css') || // Whitelist CSS
			filename.includes('.scss') || // Whitelist SCSS
			filename.includes('__dot__editorconfig') || // Whitelist .editorconfig schematic
			filename.includes('.editorconfig') || // Whitelist project .editorconfig
			filename.includes('protractor.conf.js') || // Whitelist protractor config
			filename.includes('karma.conf.js') // Whitelist karma config
		) {
			if (error) {
				console.log(chalk.red('ERROR\t\t'), filename);
				console.log(chalk.red('Cannot read file.'));

				return;
			}

			if (!data) {
				console.log(chalk.yellow('EMPTY\t\t'), filename);

				return;
			}

			if (
				filename.includes('ng-package.json') || // Blacklist ng-package.json
				filename.includes('schema.json') // Blacklist schema.json
			) {
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
			if (
				filename.toLowerCase().includes('__dot__editorconfig') ||
				filename.toLowerCase().includes('.editorconfig')
			) {
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
		}
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
