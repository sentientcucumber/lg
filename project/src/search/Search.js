(function () {
  'use strict';

  // Module dependencies
  var treeModel = require('tree-model')
  ,   fs = require('fs')
  ,   _ = require('lodash');

  // Local dependencies
  var Zone = require('../zones/Zone.js').Zone
  ,   Parser = require('../objects/Parser.js').Parser
  ,   Step = require('./Step.js').Step
  ,   Symbols = require('./Symbols.js')
  ,   A = Symbols.NonTerminal
  ,   pi = Symbols.Terminal
  ,   S = Symbols.Start;

  // Initialization
  var Tree = new treeModel();

  // Constructor
  function Search (board, moveTree) {
    this.sign = new Sign();
    this.end = new Step(1, 0, 0 ,0);
    this.depth = 0;
    this.value = boardValue(board);

    var zone = new Zone(board);
    this.zone = zone.generateZone();

    this.moveTree = Tree.parse(moveTree); // fs.readFileSync('./src/search/tree.json'))[0]);
    this.parser = new Parser();

    var move = this.moveTree.first(function (node) {
      return node.isRoot();
    });

    this.parser.addSymbol(new S(new Step(0,
                                         0,
                                         0,
                                         0,
                                         move.model.id.move,
                                         this.sign.enum)));
  }

  module.exports = {
    Search: Search
  };

  // Functions

  // Returns the value of the board at a given point
  function boardValue (board) {
    var keys = _.keys(board.pieces)
    ,   value = 0;

    _.forEach(keys, function (team) {
      var pieces = board.pieces[team];

      _.forEach(pieces, function (piece) {
        value += piece.value ? piece.value : 0;
      });
    });

    return value;
  }

  // Determine whether or not to cut the branch
  function cutBranch (zone) {
    // If there are any moves in the parser, then don't cut branch
    if (zone.parser && zone.parser.state.length) {
      return false;
    } else {
      return true;
    }
  };

  // Move based on the move tree
  function transition (search) {
    var zone = _.cloneDeep(search.zone)
    ,   pieces = zone.board.pieces
    ,   move = parseMove(search.currentMove);

    var piece = _.findWhere(pieces, {
      'startX': move.startX,
      'startY': move.startY
    });

    piece.startX = move.endX;
    piece.startY = move.endY;
    if (_.has(piece, 'length')) { piece.length--; }

    var newPieces = _.partition(zone.board.pieces, { 'team': 'white' })
    ,   white = newPieces[0]
    ,   black = newPieces[1];

    var input = {
      'board': {
        'xMax': zone.board.xMax,
        'yMax': zone.board.yMax
      },
      'pieces': {
        'white': white,
        'black': black
      }
    };

    var newZone = new Zone(input);
    search.zone = newZone.generateZone();
  }

  // Move based on the move tree
  function transitionBack (search) {
    // var option = search.moveTree.first(function (node) {
    //   return node.model.id.move === search.currentMove;
    // });

    // for ( ; option.parent.children.length === 1; ) {
    //   option = option.parent;
    // }

    // option = option.parent;

    // var otherRoute = _.filter(option.children, function (child) {
    //   if (child.model.id.visited) {
    //     return false;
    //   } else {
    //     return true;
    //   }
    // });

    var zone = _.cloneDeep(search.zone)
    ,   pieces = zone.board.pieces
    ,   move = parseMove(search.currentMove);

    var piece = _.findWhere(pieces, {
      'startX': move.endX,
      'startY': move.endY
    });

    piece.startX = move.startX;
    piece.startY = move.startY;
    if (_.has(piece, 'endX')) { piece.endX = move.endX; }
    if (_.has(piece, 'endY')) { piece.endY = move.endY; }
    if (_.has(piece, 'length')) { piece.length++; }

    var newPieces = _.partition(zone.board.pieces, { 'team': 'white' })
    ,   white = newPieces[0]
    ,   black = newPieces[1];

    var input = {
      'board': {
        'xMax': zone.board.xMax,
        'yMax': zone.board.yMax
      },
      'pieces': {
        'white': white,
        'black': black
      }
    };

    search.currentMove = search.moveTree.first(function (node) {
      return node.model.id.move === search.currentMove;
    }).parent.model.id.move;

    var newZone = new Zone(input);
    search.zone = newZone.generateZone();
  }

  // Parse the move from the move tree
  function parseMove (move) {
    var str = move.split(/ -|: /);

    var coordinates = _.map(str, function (i) {
      return i.split(/,/);
    });

    return {
      'startX': parseInt(coordinates[0][0]),
      'startY': parseInt(coordinates[0][1]),
      'endX': parseInt(coordinates[1][0]),
      'endY': parseInt(coordinates[1][1])
    };
  }

  // Productions

  // Analogous to the first production of the grammar
  Search.prototype.beginSearch = function () {
    var i = this.parser.findIndex('S');

    this.parser.replaceSymbol('S', new A(this.parser.state[i].step));
    this.generateTree();
  };

  // Analogous to the second production of the grammar
  Search.prototype.generateTree = function () {
    var i = this.parser.findIndex('A')
    ,   current = _.cloneDeep(this.parser.state[i].step)
    ,   end = _.cloneDeep(this.end);

    var nextMove = this.moveTree.all(function (node) {
      if (node.parent && node.parent.model.id.move === current.move) {
        return true;
      } else {
        return false;
      }
    });

    // If no next move is found, then cut the branch
    if (nextMove.length === 0) {
      this.leafFound();
    } else {
      this.parser.replaceSymbol('A', new A(end));
      this.parser.state.splice(i + 1,
                               0,
                               new pi(end),
                               new A(current));

      this.currentMove = current.move;
      this.end.id++;
      this.depth++;
      this.sign.switch();

      end.move = _.sample(nextMove).model.id.move;
      end.parent = current;
      end.team = this.sign.enum;

      if (_.isObject(current.child)) {
        current.child.sibling = this.end;
      } else {
        current.sibling = 0;
        current.child = end;
      }

      transition(this);

      this.generateTree();
    }
  };

  Search.prototype.leafFound = function () {
    var self = this;

    function productionFunctions () {
      if (self.depth !== 0) {
        self.sign.switch();
        self.depth--;
      }
    }

    self.parser.removeSymbol('A');
    productionFunctions();

    transitionBack(this);
    // this.generateTree();
  };

  // Helper objects

  // Used to decide which team's turn it is
  function Sign () {
    this.state = true;          // true is white's turn, otherwise black
    this.num = 1;
    this.enum = 'white';
    this.switch = function () {
      this.state = !this.state;
      this.num *= -1;
      this.enum = this.enum === 'white' ? 'black' : 'white';
    };
  }
})();
