const fs = require('fs');

// Find user's home directory (this is where Angular lives)
const home =
	process.env.APPDATA ||
	(process.platform == 'darwin'
		? process.env.HOME + 'Library/Preferences'
		: '/var/local');

// Angular schematic location
const schematicDirectory = '/@angular/cli/node_modules/@schematics/angular';

// Check if the user passed an Angular directory as a cli argument
const path =
	process.argv.length > 2
		? process.argv[2] + schematicDirectory
		: home + '/npm/node_modules' + schematicDirectory;

/**
 * Convert the file in-place
 */
function convertFile(filename) {
	// Load the file
	fs.readFile(filename, 'utf8', (error, data) => {
		if (error) {
			console.log('Cannot read file', filename);
		}

		// Format the file
		data = data.replace(/[ ]{2}/g, '\t');

		// tslint.json
		if (filename.toLowerCase().includes('tslint.json')) {
			data = data.replace(/"spaces"/g, '"tabs"');
		}

		// Save the file
		fs.writeFile(filename, data, (error) => {
			if (error) {
				console.log('Cannot save file', filename);
			}
		});
	});
}

/**
 * Traverse the folder, searching for files to convert
 */
function traverse(path) {
	fs.readdir(path, (error, files) => {
		if (error) {
			console.log('Cannot traverse path', path);
			console.log('Error', error);

			return;
		}

		files.forEach((file) => {
			if (file === '.' || file === '..') {
				return;
			}

			file = path + '/' + file;

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
traverse(path);
