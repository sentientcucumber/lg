(function () {
  'use strict';

  // Dependencies
  var utils = require('../utilities/utilities.js')
  ,   Zone = require('./Zone.js').Zone;

  var input = utils.validateFile(process.argv[2]);

  if (input) {
    var zone = new Zone(input);
    zone.generateZone();
  } else {
    console.log("Invalid file, exiting program.");
    process.exit(1);
  }
})();
