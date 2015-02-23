(function() {
  'use-strict';

  var parser = require('./parser.js'),
      utils = require('./utils.js'),
      board = require('./board.js');

  var game = utils.validateParameter(2),
      grammar = utils.validateParameter(3),
      maps = utils.validateParameter(4);

  if (game && grammar && maps) {
    var pieces = game.pieces,
        len = 7,
        productions = grammar.productions;

    pieces.forEach(function (piece) {
      parser.applyGrammar(piece, len, productions, game.board, maps);
    });
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
