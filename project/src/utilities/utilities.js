(function() {
  // Various helper functions used throughout the project
  'use strict';

  // Dependencies
  var fs = require('fs');

  // Validates the file is JSON and has required fields
  var validateFile = function (file) {
    try {
      var parsedFile = JSON.parse(fs.readFileSync(file));

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
  exports.validateFile = function (file) {
    if (file) {
      return validateFile(file);
    } else {
      console.error("Your run command was improperly formatted.\n" +  
                    "Please consult the README.pdf located in the doc folder\n" +
                    "for instructions on running the project.\n");

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

  // Changes human readable coordinates to linear locations
  exports.toLinear = function (point, length) {
    return point.y * length - (length - point.x);
  };
})();
