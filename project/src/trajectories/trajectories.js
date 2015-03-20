(function() {
  'use strict';

  var parser = require('./parser.js'),
      utils = require('./utils.js');

  var input = utils.validateFile(2);

  if (input) {
    var pieces = input.pieces;

    pieces.forEach(function (piece) {
      parser.Parser(piece, input.board, piece.length);
    });
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
