// validation.js
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
  exports.validateRun = function () {
    var file = process.argv[2];

    if (file) {
      return validateFile(file);
    } else {
      console.error("Usage: npm run <input file>\n");

      return null;
    }
  };
})();
