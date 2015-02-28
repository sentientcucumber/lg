// utils.js
// Contains functions used to validate input

(function() {
  'use-strict';

  // Dependencies
  var fs = require('fs');

  // Validates the file is JSON and has required fields
  var validateFile = function (file) {
    try {
      var parsedFile = JSON.parse(fs.readFileSync(file));

      // TODO Check for required fields before returning
      return parsedFile;
    } catch (e) {
      console.error("The input file was not properly formatted JSON.");
      console.error(e.message);

      return null;
    }
  };

  // Checks to see if a file was provided, and if so, does the file contain
  // the required information. If so, a JSON object is returned to be used
  // in subsequent calls.
  exports.validateFile = function (param) {
    var file = process.argv[param];

    if (file) {
      return validateFile(file);
    } else {
      console.error("Usage: npm run project <chess file> <grammar file> <maps file>");

      return null;
    }
  };

  // Writes the output to a file
  exports.writeOutput = function (data) {
    var inputPath = process.argv[2].split(/\./)[0];
    var inputFilename = inputPath.replace('input', 'output');
    var filename = inputFilename + '-output.json';

    fs.writeFile(filename, JSON.stringify(data, null, 2), function (err) {
      if (err) {
        console.log('An error occurred while writing to file ' + filename);
        console.log(err);
      } else {
        console.log(filename + ' written successfully!');
      }
    });
  };
})();
