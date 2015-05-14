(function () {
  /*  Search.js
   *
   *  Creates a search tree of possible moves for a given zone.
   */

  'use strict';

  // Dependencies
  var Step = require('./Step.js').Step
  ,   Zone = require('../zones/Zone.js').Zone
  ,   Parser = require('../objects/Parser.js').Parser
  ,   Symbols = require('./Symbols.js')
  ,   A = Symbols.NonTerminal
  ,   pi = Symbols.Terminal
  ,   _ = require('lodash')
  ,   TreeModel = require('tree-model')
  ,   Tree = new TreeModel()
  ,   util = require('util');

  // Constructor for a Search
  function Search (board) {
    this.current = new Step(0); // Analogous to i in the grammar
    this.end = new Step(1);
    this.depth = 0;             // Analogous to d in the grammar

    this.sign = {
      state: true,
      num: 1,
      enum: 'white',
      switch: function () {
        this.state = !this.state;
        this.enum = this.enum === 'white' ? 'black' : 'white';
        this.num *= -1;
      }
    };

    this.state = undefined;
    this.value = 0;

    // Current zone for a given board
    var zone = new Zone(board);
    this.zone = zone.generateZone();

    // Search tree
    this.root = Tree.parse({ 'root': 'root' });

    var keys = _.keys(board.pieces)
    ,   self = this;

    _.forEach(keys, function (team) {
      var pieces = board.pieces[team];

      _.forEach(pieces, function (piece) {
        self.value += piece.value ? piece.value : 0;
      });
    });
  };

  // Analogous to the first production of the grammar
  Search.prototype.beginSearch = function () {
    var parser = new Parser();
    parser.addSymbol(new A(this.step));
    generateTree(this, parser);
  };

  module.exports = {
    Search: Search
  };

  // Helpers

  // Determine's if a branch should be cut or not, makes this decision based on
  // the following factors:
  //   - Reached goal AND is safe
  //   - No longer part of a zone
  function cutBranch (zone) {
    if (!zone.parser) {
      return true;
    } else {
      return false;
    }
  };

  // Add a node to the tree
  function addNode (root, piece, x, y) {
    var move = {
      'move': util.format('%s(%d, %d) - (%d, %d)',
                          piece.piece[0], x, y, piece.startX, piece.startY)
    };
    
    root.addChild(Tree.parse(move));
  }

  // Moves a piece from one location to another
  function transition (search, generate, parser) {
    var team = search.sign.enum
    ,   zone = search.zone
    ,   root = search.root;

    var current = _.first(_.map(_.partition(zone.parser.state, { 'team' : team })))
    ,   x, y, newX, newY, boardPiece;

    _.forEach(current, function (piece) {
      if (generate) {
        var zoneInput = _.cloneDeep(zone)
        ,   x = _.first(piece.trajectory.state).location.x
        ,   y = _.first(piece.trajectory.state).location.y;

        piece.trajectory.state = _.drop(piece.trajectory.state);

        boardPiece = _.first(_.where(zoneInput.board.pieces,
                                         { 'startX': x, 'startY': y, 'team': team }));

        boardPiece.startX = _.first(piece.trajectory.state).location.x;
        boardPiece.startY = _.first(piece.trajectory.state).location.y;
        boardPiece.length ? boardPiece.length-- : null;

        var move = util.format('%d,%d - %s', x, y, team);
        parser.addSymbol(new pi(move), new A(search.current));

        addNode(search.root, piece, x, y, boardPiece.startX, boardPiece.startY);

        var input = {
          'board': {
            'xMax': search.zone.board.xMax,
            'yMax': search.zone.board.yMax
          },
          'pieces': {
            'white': _.map(_.partition(zoneInput.board.pieces, { 'team': 'white' })[0]),
            'black': _.map(_.partition(zoneInput.board.pieces, { 'team': 'black' })[0])
          }
        };

        var newZone = new Zone(input);
        search.zone = newZone.generateZone();
      } else {
        x = _.first(piece.trajectory.state).location.x;
        y = _.first(piece.trajectory.state).location.y;

        piece.trajectory.state = _.drop(piece.trajectory.state);

        boardPiece = _.first(_.where(search.zone.board.pieces,
                                         { 'startX': x, 'startY': y, 'team': team }));

        boardPiece.startX = _.first(piece.trajectory.state).location.x;
        boardPiece.startY = _.first(piece.trajectory.state).location.y;
        boardPiece.length ? boardPiece.length-- : null;

        addNode(search.root, piece, x, y, boardPiece.startX, boardPiece.startY);

        var move = util.format('%d,%d - %s', x, y, team);
        parser.addSymbol(new pi(move), new A(search.current));
      }
    });
  }

  // Productions

  // Analogous to the second production of the grammar
  function generateTree (search, parser) {
    function productionFunctions (generate) {
      var currChild = search.current.child ? search.current.child : new Step();

      if (!currChild) {
        currChild.setSibling(search.end);
      } else {
        currChild.setSibling(new Step());
        currChild.setChild(search.end);
      }

      transition(search, generate, parser);

      search.end.setParent(search.current);
      search.end.value = search.value * search.sign.num;
      search.sign.switch();

      // Must increment at the end to simulate concurrent process
      search.end = new Step(search.end.self + 1);
      search.depth++;
    }

    if (!cutBranch(search.zone)) {
      // Resolve the nonterminal
      parser.replaceSymbol('A', new A(search.end));
      parser.addSymbol(new pi(search.end), new A(search.current));

      productionFunctions(false);
      productionFunctions(true);

      generateTree(search, parser);
    } else {
      leafFound(search, parser);
    }
  };

  // Analogous to the third production of the grammar
  function leafFound (search, parser) {
    function productionFunctions () {
      if (search.depth !== 0) {
        search.sign.switch();
        search.depth--;
      }
    }

    parser.removeSymbol('A');
    productionFunctions();
  };
})();
