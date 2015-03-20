(function () {
  // Geneterates the all attack zones for a given board

  'use strict';

  // Dependencies
  var zone = require('./zoneGenerator.js')
  ,   utils = require('./utils.js');

  // Input file
  var input = utils.validateFile(2);

  if (input) {
    var boardZone = new zone.zoneGenerator(input);
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
