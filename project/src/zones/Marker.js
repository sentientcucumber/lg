(function () {
  'use strict';

  var Location = require('../objects/Location.js').Location;

  var Marker = function (start, end, length, board) {
    this.start = new Location(start.x, start.y);
    this.end = new Location(end.x, end.y);
    this.length = length;
    this.xLimit = board.xMax;
    this.yLimit = board.yMax;
  };

  Marker.prototype.toString = function () {
    return '((' + this.start + '), (' + this.end + '), ' + this.length + ')';
  };
  
  Marker.prototype.setStart = function (location) {
    this.start = location;
  };

  Marker.prototype.setEnd = function (location) {
    this.end = location;
  };

  Marker.prototype.setLength = function (length) {
    this.length = length;
  };

  Marker.prototype.set = function (start, end, length) {
    this.setStart(start);
    this.setEnd(end);
    this.setLength(length);
  };

  Marker.prototype.reset = function () {
    this.setStart(new Location(1, 1));
    this.setEnd(new Location(1, 1));
    this.setLength(0);
  };

  Marker.prototype.incrementStart = function () {
    if (this.start.x === this.xLimit && this.start.y === this.yLimit) {
      throw new Error('Maximum reached!');
    } else if (this.start.x === this.xLimit) {
      this.start.x = 1;
      this.start.y += 1;
    } else {
      this.start.x += 1;
    }
  };

  Marker.prototype.incrementEnd = function () {
    if (this.end.x === this.xLimit && this.end.y === this.yLimit) {
      throw new Error('Maximum reached!');
    } else if (this.end.x === this.xLimit) {
      this.end.x = 1;
      this.end.y += 1;
    } else {
      this.end.x += 1;
    }
  };

  module.exports = {
    Marker: Marker
  };
})();
