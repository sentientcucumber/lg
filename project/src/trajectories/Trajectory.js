(function () {
  'use strict';

  /* Trajectory.js
   * 
   * Creates a search tree to track all possible trajectories
   */

  // Dependencies
  var Parser = require('../objects/Parser.js').Parser
  ,   Symbols = require('./Symbols.js')
  ,   Location = require('../objects/Location.js').Location
  ,   ReachBoard = require('../maps/ReachabilityBoard.js').ReachabilityBoard
  ,   Start = Symbols.Start
  ,   A = Symbols.NonTerminal
  ,   a = Symbols.Terminal
  ,   _ = require('lodash')
  ,   Node = require('tree-node');

  // Trajectory constructor, adds the piece and board to global scope
  var Trajectory = function (piece, board) {
    this.piece = piece;
    this.board = board;
    this.overlay = overlayBoard(board, piece);

    var parser = new Parser();

    var start = new Location(piece.startX, piece.startY)
    ,   end = new Location(piece.endX, piece.endY)
    ,   length = piece.length
    ,   size = board.xMax * board.yMax;

    var subset = this.overlay.subset(board, start);

    if (withinReach(end, subset) <= length &&
        length < 2 * withinReach(end, subset) &&
        length < 2 * size) {

      parser.addTerminal(new A(start, end, length));

      // The search tree for possible trajectories
      var node = new Node().data(_.omit(start, 'toString'));

      findDockLocation(this, parser, node);
    } else {
      console.error('Conditions for the first production were not met.');
      process.exit(1);
    }
  };
  
  module.exports = {
    Trajectory: Trajectory
  };

  // Helper functions ////////////////////////////////////////////////////////

  // Analogous to the MAP function in the Trajectory Grammar
  var withinReach = function (end, board) {
    return board.atLocation(end);
  };

  // Analogous to the med function in the Trajectory Grammar
  var midwayPoint = function (start, end, length) {
    
  };

  // Generate a set of locations from the board that are within the
  // trajectory's length
  var dockSet = function (board) {
    
  };

  // Analogous to the next function. Although the function only returns one of
  // the possible next locations, it goes through all leaves in the tree to
  // determine if the end point has been reached, and if it hasn't then adds
  // a possible location
  var nextLocation = function (board, overlay, piece, length, location, node) {
    var start = new Location(piece.startX, piece.startY)
    ,   end = new Location(piece.endX, piece.endY)
    ,   originalLength = piece.length;

    var sum = sumSet(board, overlay, piece)
    ,   currentReachable = reachableLocations(board, overlay, location, 1)
    ,   originalReachable = reachableLocations(board, overlay, start,
                                               originalLength - length + 1);

    var moves = intersection(sum, currentReachable, originalReachable);

    // TODO must get binary tree working!
    // moves.forEach(function (move) {
    //   node.createChild(new Node().data(_.omit(move, 'toString')));
    // });

    return _.sample(moves);
  };

  // Generates a set of locations that can be reached from the starting location
  // to the ending location and vice versa
  var sumSet = function (board, overlay, piece) {
    var start = new Location(piece.startX, piece.startY)
    ,   end = new Location(piece.endX, piece.endY)
    ,   locations = [ ];
    
    var startBoard = overlay.subset(board, start).board.reverse()
    ,   endBoard = overlay.subset(board, end).board.reverse();

    startBoard.forEach(function (row, i) {
      row.forEach(function (col, j) {
        var value = Number(startBoard[i][j]) + Number(endBoard[i][j]);

        if (value === piece.length) {
          locations.push(new Location(j + 1, i + 1));
        }
      });
    });

    return locations;
  };

  // Generates a set of locations that can be reached within a given number of
  // moves from a given location
  var reachableLocations = function (board, overlay, location, moves) {
    var reachable = overlay.subset(board, location).board.reverse()
    ,   locations = [ ];

    reachable.forEach(function (row, i) {
      row.forEach(function (col, j) {
        if (reachable[i][j] === moves) {
          locations.push(new Location(j + 1, i + 1));
        }
      });
    });

    return locations;
  };

  // Generate a board to "overlay" onto the existing game board to determine
  // reachable locations quickly. Should be used with ReachabilityBoard's subset
  var overlayBoard = function (board, piece) {
    var overlayBoard = {
      "xMax": board.xMax * 2 - 1,
      "yMax": board.yMax * 2 - 1
    };

    var overlayPiece = {
      "name": piece.name,
      "startX": Math.ceil(overlayBoard.xMax / 2),
      "startY": Math.ceil(overlayBoard.yMax / 2),
      "reachability": piece.reachability
    };

    var reachBoard = new ReachBoard(overlayBoard);
    reachBoard.generateReachability(overlayPiece);

    var i = _.findIndex(reachBoard.pieces, function (entry) {
      return entry.startX === overlayPiece.startX &&
             entry.startY === overlayPiece.startY;
    });

    reachBoard.pieces.splice(i, 1, piece);

    return reachBoard;
  };

  // Compare two objects
  function compareObjects (a, b, comparison) {
    var result = [ ];

    for (var i = 0; i < a.length; i++) {
      var aElement = a[i]
      ,   existsInB = _.any(b, function (bElement) {
        return comparison(bElement, aElement);
      });

      if(existsInB) {
        result.push(aElement);
      }
    }

    return result;
  }

  // Used to compare arrays of objects.
  function intersection () {
    var results = arguments[0];
    var lastArg = arguments[arguments.length - 1];

    for (var i = 1; i < arguments.length ; i++) {
      var array = arguments[i];
      results = compareObjects(results, array, _.isEqual);

      if (results.length === 0) break;
    }
    return results;
  }

  // Productions //////////////////////////////////////////////////////////

  // Analogous to the second production in the Trajectory grammar this splits
  // the trajectory based on the dock point
  var findDockLocation = function (trajectory, parser, node) {
    var board = trajectory.board
    ,   piece = trajectory.piece
    ,   overlay = trajectory.overlay;

    var start = new Location(piece.startX, piece.startY)
    ,   end = new Location(piece.endX, piece.endY)
    ,   length = piece.length;

    var subset = overlay.subset(board, start);

    if (withinReach(end, subset) !== length) {
      console.error('Haven\'t implemented admissable trajectories yet.');
      process.exit();
    } else {
      findTrajectory(trajectory, parser, node);
    }
  };

  // Analogous to the third production that does the majority of work in
  // finding trajectories
  var findTrajectory = function (trajectory, parser, node) {
    var board = trajectory.board
    ,   piece = trajectory.piece
    ,   overlay = trajectory.overlay
    ,   current = parser.findSymbol('A');

    if (current) {
      var start = new Location(current.start.x, current.start.y)
      ,   end = new Location(current.end.x, current.end.y)
      ,   length = current.length;

      var subset = overlay.subset(board, start);

      if (withinReach(end, subset) === length && length >= 1) {
        parser.replaceSymbol('A', new a(current.start));

        var next = nextLocation(board, overlay, piece, length, current.start, node);

        parser.addNonTerminal(new A(next, end, --length));
        
        findTrajectory(trajectory, parser, node);
      } else {
        finalLocation(trajectory, parser, node);
      }
    }
  };

  // Analogous to the fourth and fifth productions
  var finalLocation = function (trajectory, parser, node) {
    var current = parser.findSymbol('A')
    ,   piece = trajectory.piece;
 
    var currentDest = new Location(current.end.x, current.end.y)
    ,   finalDest = new Location(piece.endX, piece.endY);

    if (_.isEqual(currentDest, finalDest)) {
      parser.replaceSymbol('A', new a(current.end));

      console.log(parser.toString());

      findTrajectory(trajectory, parser, node);
    } else {
      parser.removeSymbol('A');

      console.log(parser.toString());
    }
  };
})();
