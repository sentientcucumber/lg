(function() {
  'use strict';

  var parser = require('./parser.js'),
      utils = require('./utils.js');

  var input = utils.validateFile(2);

  if (input) {
    var len = 8;
    var pieces = input.pieces;

    pieces.forEach(function (piece) {
      var trajectory = parser.Parser(piece, input.board, len);
    });
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
