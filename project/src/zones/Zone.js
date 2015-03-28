(function () {
  'use strict';

  /* Zone.js
   *
   */

  // Dependencies
  var Board = require('../objects/Board.js').Board
  ,   ReachBoard = require('../maps/ReachabilityBoard.js').ReachabilityBoard
  ,   Parser = require('../objects/Parser.js').Parser
  ,   Trajectory = require('../trajectories/Trajectory.js').Trajectory
  ,   Location = require('../objects/Location.js').Location
  ,   Marker = require('./Marker.js').Marker
  ,   Piece = require('../objects/Piece.js').Piece
  ,   helpers = require('../helpers/helpers.js')
  ,   Symbols = require('./Symbols.js')
  ,   A = Symbols.NonTerminal
  ,   t = Symbols.Terminal
  ,   _ = require('lodash');

  // Zone constructor. 
  var Zone = function (zone) {
    var that = this;

    this.board = new Board(zone.board);

    _.keys(zone.pieces).forEach(function (team) {
      var pieces = zone.pieces[team];

      pieces.forEach(function (piece) {
        that.board.addPiece(piece);

        if (piece.hasOwnProperty('endX') &&
            piece.hasOwnProperty('endY') &&
            piece.hasOwnProperty('length')) {
          var start = new Location(piece.startX, piece.startY)
          ,   end = new Location(piece.endX, piece.endY)
          ,   length = piece.length;

          that.marker = new Marker(start, end, length, that.board);
          that.main = piece;
        }
      });
    });

    this.mainOverlay = helpers.overlayBoard(this.board, this.main);

    var size = this.board.xMax * this.board.yMax;
    this.size = size;

    this.current = new Board(this.board);
    initializeBoard(this.current, 0);
    
    this.next = new Board(this.board);
    initializeBoard(this.next, 0);

    this.time = new Board(this.board);
    initializeBoard(this.time, 2 * size);

    this.nextTime = new Board(this.board);
    initializeBoard(this.nextTime, 2 * size);
  };

  Zone.prototype.generateZone = function () {
    var board = this.board
    ,   startBoard = this.mainOverlay.subset(board, this.marker.start)
    ,   parser = new Parser();

    this.startPiece = board.atLocation(this.marker.start);
    this.endPiece = board.atLocation(this.marker.end);

    if (board.pieceOn(this.marker.start) &&
        helpers.withinReach(this.marker.end, startBoard) &&
        this.startPiece.team !== this.endPiece.team) {

      parser.addSymbol(new A(this.marker, this.current.asSet(), this.next.asSet()));

      mainTrajectory(this, parser);
    }
  };

  module.exports = {
    Zone: Zone
  };

  // Helper functions /////////////////////////////////////////////////////////

  // Initialize a board to a given value
  function initializeBoard (board, value) {
    board.board.forEach(function (row) {
      _.fill(row, value);
    });
  };

  // Add a trajectory to a board
  function addTrajectory (board, trajectory, step, inc) {
    var symbols = _.rest(trajectory.parser.state);

    symbols.forEach(function (symbol, i) {
      var location = symbol.location
      ,   initial = (step || step === 0) ? step : i;
      
      function value (initial, inc) {
        return initial + inc;
      };

      board.board[location.y - 1][location.x - 1] = value(initial, inc);
    });
  };

  // Analogous to the f(u,v) in the grammar
  function increment (marker, time, current, board) {
    var limit = new Location(board.xMax, board.yMax);
    
    if ((!_.isEqual(marker.start, limit) &&
         marker.length > 0) ||
        (_.isEqual(marker.end, limit) &&
         marker.length <= 0)) {
      marker.incrementStart();
    } else if (_.isEqual(marker.start, limit) ||
               (marker.length <= 0 &&
                !_.isEqual(marker.end, limit))) {
      marker.setStart(new Location(1, 1));
      marker.incrementEnd();
      marker.setLength(time.atLocation(marker.end) * current.atLocation(marker.end));
    }
  }
  
  // Returns true if the two pieces are on opposing teams, otherwise false
  function opposing (one, two) {
    return (one.team !== two.team);
  }

  // Productions //////////////////////////////////////////////////////////////
  
  // Analogous to the second production of the grammar where the main trajectory
  // is added the board
  function mainTrajectory (zone, parser) {
    var startBoard = new Board(zone.board)
    ,   main = new Trajectory(zone.startPiece, startBoard);

    parser.replaceSymbol('A', new t(zone.startPiece, main));

    zone.marker.reset(); //set(new Location(1, 1), new Location(1, 1), 0);

    addTrajectory(zone.current, main, 0, 1);
    addTrajectory(zone.time, main, null, 2);

    parser.addSymbol(new A(zone.marker, zone.current.asSet(), zone.next.asSet()));

    boardIteration(zone, parser);
  };

  // Analogous to the third production of the grammar
  function boardIteration (zone, parser) {
    var marker = parser.findSymbol('A').marker;

    if (marker) {
      var start = new Location(marker.start.x, marker.start.y)
      ,   end = new Location(marker.end.x, marker.end.y)
      ,   length = marker.length
      ,   limit = new Location(zone.board.xMax, zone.board.yMax);

      if (!_.isEqual(start, limit) && !_.isEqual(end, limit)) {
        increment(marker, zone.time, zone.current, zone.board);
        addNegation(zone, parser);
      } else {
        incrementTime(zone, parser);
      }
    }
  };

  // Analogous to the fourth production
  function addNegation (zone, parser) {
    var marker = parser.findSymbol('A').marker
    ,   originalStart = new Location(zone.main.startX, zone.main.startY)
    ,   originalEnd = new Location(zone.main.endX, zone.main.endY)
    ,   currentPiece = zone.board.atLocation(marker.start)
    ,   reachBoard;

    if (currentPiece instanceof Piece) {
      reachBoard = new ReachBoard(zone.board);
      reachBoard.generateReachability(currentPiece);
    }

    if ((zone.board.pieceOn(marker.start) &&
         marker.length > 0 &&
         !_.isEqual(marker.start, originalStart) &&
         !_.isEqual(marker.end, originalEnd)) &&
        ((!opposing(currentPiece, zone.main) &&
          helpers.withinReach(marker.end, reachBoard) === 1) ||
         (opposing(currentPiece, zone.main) &&
          helpers.withinReach(marker.end, reachBoard) <= zone.main.length))) {

      // The piece didn't have these fields before but are required to create a
      // trajectory
      currentPiece.endX = marker.end.x;
      currentPiece.endY = marker.end.y;
      currentPiece.length = marker.length;

      var negation = new Trajectory(currentPiece, zone.board);

      addTrajectory(zone.next, negation, 0, 1);
      addTrajectory(zone.nextTime, negation, null, 2);

      parser.replaceSymbol('A', new t(currentPiece, negation));  
      parser.addSymbol(new A(zone.marker, zone.current.asSet(), zone.next.asSet()));

      boardIteration(zone, parser);
    } else {
      boardIteration(zone, parser);
    }
  };

  // Analogous to the fifth production
  function incrementTime (zone, parser) {
    var flatBoard = _.flattenDeep(zone.next.board);

    if (_.every(flatBoard, 0)) {
      var marker = parser.findSymbol('A').marker;
      
      parser.replaceSymbol('A', new A(marker.reset, zone.next, new Board(zone.board)));
    } else {
      parser.removeSymbol('A');
      console.log(parser.toString());
    }
  };
})();
