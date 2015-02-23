(function() {
  'use-strict';

  // Dependencies
  var utils = require('./utils.js'),
      _ = require('underscore');

  // Symbol object, superclass of nonterminal and terminal
  function Symbol (type, name) {
    this.type = type;
    this.name = name;
    this.args = new Array();

    for (var a = 2; a < arguments.length; a++) {
      if (arguments.hasOwnProperty(a)) {
        this.args.push(arguments[a]);
      }
    }
  };

  Symbol.prototype.display = function () {
    return this.name + '(' + this.args.join(', ') + ')';
  };

  // Nonterminal object, subclass of Symbol
  var NonTerminal = function (name) {
    this.args = new Array();

    for (var a = 1; a < arguments.length; a++) {
      if (arguments.hasOwnProperty(a)) {
        this.args.push(arguments[a]);
      }
    }

    Symbol.call(this, "NONTERMINAL", name, this.args);
  };

  NonTerminal.prototype = Object.create(Symbol.prototype);

  // Terminal object, subclass of Symbol
  function Terminal (name) {
    this.args = new Array();

    for (var a = 1; a < arguments.length; a++) {
      if (arguments.hasOwnProperty(a)) {
        this.args.push(arguments[a]);
      }
    }

    Symbol.call(this, "TERMINAL", name, this.args);    
  }

  var printState = function () {
    parser.state.forEach(function (entry) {
      console.log(entry.display());
    });
  };

  // Determine the linear coordinates for a given point
  var linearCoordinate = function (point, board) {
    var xMax = board.xMax;

    return point.y * xMax - (xMax - point.x);
  };

  // Resolves any MAP functions
  var MapResult = function (start, end, piece) {
    var map = _.find(moveMaps, function (entry) {
      return entry.piece === piece;
    }).moveBoard;
    
    
  };

  // Checks to see if a condition is met
  var checkConditions = function (conditions, start, end, piece, len) {
    return conditions.every(function (cond) {
      var map;

      if (cond.indexOf('MAP') != -1) {
        map = MapResult(start, end, piece.piece);
      }
    });
  };

  // Applies a given production
  var applyProduction = function (number, piece, productions, board, len) {
    var start = linearCoordinate({ "x": piece.startX, "y": piece.startY }, board),
        end = linearCoordinate({ "x": piece.endX, "y": piece.endY }, board);

    var production = productions[number],
        validProduction = checkConditions(production.conditions, start, end, piece, len);

    // parser.state.push(new NonTerminal('S', start, end, len));
    // printState();
  };

  // Initializes the starting point and then begins to apply the grammar
  exports.applyGrammar = function (piece, len, productions, board, maps) {
    // Setup the state of the parser
    parser = new Object();
    parser.state = new Array();

    // Read in the chess maps
    moveMaps = maps;

    applyProduction(1, piece, productions, board, len);
  };
})();
