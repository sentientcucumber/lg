(function() {
  'use-strict';

  var parser = require('./parser.js'),
      utils = require('./utils.js');

  var input = utils.validateFile();

  if (input) {
    parser.readGrammar(input);
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
