(function () {
  'use strict';

  // Dependencies
  var boardUtils = require('./board.js'),
      _ = require('underscore');

  // Grammar objects //////////////////////////////////////////////////////////

  // Symbol object, superclass of NonTerminal and Terminal
  var Symbol = function (type, name) {
    this.type = type;
    this.name = name;
  };

  Symbol.prototype.toString = function () {
    return this.name + '(' + this.x + ')';
  };

  // Nonterminal object, subclass of Symbol
  var NonTerminal = function (name, x, y, len) {
    this.x = x;
    this.y = y;
    this.len = len;

    Symbol.call(this, 'NONTEMINAL', name, x, y, len);
  };

  NonTerminal.prototype = Object.create(Symbol.prototype);

  NonTerminal.prototype.toString = function () {
    return this.name + '(' + this.x + ', ' + this.y + ', ' + this.len + ')';
  };

  // Terminal object, subclass of Symbol
  var Terminal = function (name, x) {
    this.x = x;

    Symbol.call(this, 'TERMINAL', name, x);
  };

  Terminal.prototype = Object.create(Symbol.prototype);

  // Grammar functions ////////////////////////////////////////////////////////
  var mapping = function (start, end, moves) {
    var startDist = moves[(7 - (start.y - 1))][start.x - 1],
        endDist = moves[(7 - (end.y - 1))][end.x - 1];

    return Math.abs(endDist - startDist);
  };

  var medFn = function (parser, x, y, len) {
    var dock = generateDockSet(parser, len);

    if (dock.length < 1) {
      return x;
    } else {
      return _.sample(dock);
    }
  };

  var lmedFn = function (x, y, moves) {
    return mapping(x, y, moves);
  };

  var nextFn = function (parser, x, y, len) {
    var sum = generateDockSet(parser, parser.len);

    var start = {
      "xMax": parser.rowLen,
      "yMax": parser.colLen,
      "obstacles": [ ],
      "start": translateLinearCoordinate(x, parser.rowLen)
    };

    start.start.x--;
    start.start.y--;

    var tmp = boardUtils.generateBoard(start, start.start);
    var st1 = boardUtils.populateBoard(tmp, parser.piece);

    var results = [ ];

    st1.forEach(function (row, i) {
      var tmp = row.split(' ');

      tmp.forEach(function (cell, j) {
        if (cell == 1)
          results.push(64 - ((8 * i + (7 - j))));
      });
    });

    var end = {
      "xMax": parser.rowLen,
      "yMax": parser.colLen,
      "obstacles": [ ],
      "start": translateLinearCoordinate(y, parser.rowLen)
    };

    end.start.x--;
    end.start.y--;

    var tmp2 = boardUtils.generateBoard(end, end.start);
    var st2 = boardUtils.populateBoard(tmp2, parser.piece);
    var results2 = [ ];

    st2.forEach(function (row, i) {
      var tmp = row.split(' ');

      tmp.forEach(function (cell, j) {
        if (cell == len - 1)
          results2.push(64 - ((8 * i + (7 - j))));
      });
    });

    var next = _.sample(_.intersection(sum, results, results2));

    return (next) ? next : x;
  };

  // Helper functions /////////////////////////////////////////////////////////
  var generateDockSet = function (parser, len) {
    var results = [ ];

    parser.startBoard.forEach(function (row, i) {
      row.forEach(function (col, j) {
        var val = Number(parser.startBoard[i][j]) + Number(parser.endBoard[i][j]);

        if (val === (len))
          results.push(64 - ((8 * i + (7 - j))));
      });
    });

    return results;
  };

  // Translates linear coordinates to graph notation
  var translateLinearCoordinate = function (point, rowLen) {
    return {
      "x": (point % rowLen === 0) ? rowLen : point % rowLen,
      "y": Number(Math.ceil(point / rowLen))
    };
  };

  // Translates graph notation to linear coordinates
  var translateChessCoordinate = function (point, rowLen) {
    return point.y * rowLen - (rowLen - point.x);
  };

  // Returns the first index that matches the name
  var findNonTerminal = function (stack, name) {
    return stack.map(function (entry) {
      return entry.name;
    }).indexOf(name);
  };

  // Productions //////////////////////////////////////////////////////////////
  var one = function (parser) {
    var start = {
      "x": parser.piece.startX,
      "y": parser.piece.startY
    };

    var end = {
      "x": parser.piece.endX,
      "y": parser.piece.endY
    };

    var x = translateChessCoordinate(start, parser.rowLen),
        y = translateChessCoordinate(end, parser.rowLen);

    // Push the starting symbol onto the stack
    parser.state.push(new NonTerminal('S', x, y, parser.len));

    // Check to see if the predicates have been met
    if (mapping(start, end, parser.startBoard) <= parser.len &&
        parser.len < (2 * parser.spaces)) {

      var index = findNonTerminal(parser.state, 'S');

      if (index > -1) {
        parser.state[index] = new NonTerminal('A', x, y, parser.len);
        two(parser);
      } else {
        console.error('Expected to find S symbol, but none was found');
      }
    } else {
      console.error('Production one failed. No productions to apply');
    }
  };

  var two = function (parser) {
    var index = findNonTerminal(parser.state, 'A');

    // First check to see if a symbol exists
    if (index > -1) {
      var current = parser.state[index],
          x = translateLinearCoordinate(current.x, parser.rowLen),
          y = translateLinearCoordinate(current.y, parser.rowLen);

      if (mapping(x, y, parser.startBoard) !== current.len) {
        var med = medFn(parser, current.x, current.y, current.len),
            lmed = parser.startBoard[x.x][x.y]; // lmedFn(x, y, parser.startBoard);

        var first = new NonTerminal('A', current.x, med, lmed);
        var second = new NonTerminal('A', med, current.y, current.len - lmed);

        parser.state.splice(index - 1, 1, first, second);
        three(parser);
      } else {
        three(parser);
      }
    } else {
      console.error(parser.state.join(' '));
    }
  };

  // Production three
  var three = function (parser) {
    var index = findNonTerminal(parser.state, 'A');

    if (index > -1) {
      var current = parser.state[index],
          x = translateLinearCoordinate(current.x, parser.rowLen),
          y = translateLinearCoordinate(current.y, parser.rowLen);

      if (x &&
          mapping(x, y, parser.startBoard) === current.len &&
          current.len >= 1) {

        var terminal = new Terminal('a', current.x),
            next = nextFn(parser, current.x, current.y, current.len),
            nonterminal = new NonTerminal('A', next, current.y, --current.len);

        parser.state.splice(index, 1, terminal, nonterminal);
        three(parser);
      } else {
        four(parser);
      }
    } else {
      console.log(parser.state.join(' '));
    }
  };

  // Production four
  var four = function (parser) {
    var index = findNonTerminal(parser.state, 'A');

    var current = parser.state[index],
        x = translateLinearCoordinate(current.x, parser.rowLen),
        y = translateLinearCoordinate(current.y, parser.rowLen);
    
    if (parser.piece.endX === y.x && parser.piece.endY === y.y) {
      parser.state.splice(index, 1, new Terminal('a', current.x));
      three(parser);
    } else {
      five(parser);
    }
  };

  // Production five
  var five = function (parser) {
    var index = findNonTerminal(parser.state, 'A');

    var current = parser.state[index],
        x = translateLinearCoordinate(current.x, parser.rowLen),
        y = translateLinearCoordinate(current.y, parser.rowLen);

    if (parser.piece.endX !== y.x && parser.piece.endY !== y.y) {
      parser.state.splice(index, 1);
      three(parser);
    } else {
      console.log(parser.state.join(' '));
    }
  };

  // Generates a starting board based on the starting position
  var generateStartBoard = function (piece, board) {
    var start = {
      "x": piece.startX - 1,
      "y": piece.startY- 1
    };

    var startBoard = boardUtils.generateBoard(board, start);
    return boardUtils.populateBoard(startBoard, piece);
  };

  // Generates an ending board based on the ending postion
  var generateEndBoard = function (piece, board) {
    var end =  {
      "x": piece.endX - 1,
      "y": piece.endY - 1
    };

    var endBoard = boardUtils.generateBoard(board, end);
    return boardUtils.populateBoard(endBoard, piece);
  };

  // Creates a Parser object
  exports.Parser = function (piece, board, len) {
    // Holds the state for the parser
    this.state = [ ];

    this.board = board;
    this.piece = piece;
    this.len = len;

    var startBoard = generateStartBoard(piece, board);
    this.startBoard = boardUtils.transformMoves(startBoard);

    var endBoard = generateEndBoard(piece, board);
    this.endBoard = boardUtils.transformMoves(endBoard);

    this.spaces = board.xMax * board.yMax - board.obstacles.length;
    this.rowLen = board.xMax;
    this.colLen = board.yMax;

    one(this);
  };
})();
