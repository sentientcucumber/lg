(function () {
  'use strict';

  var Location = function (x, y) {
    this.x = x;
    this.y = y;
  };

  Location.prototype.toString = function () {
    return this.x + ',' + this.y;
  };

  Location.prototype.incX = function () {
    this.x = this.x + 1;
  };

  Location.prototype.incY = function () {
    this.y = this.y + 1;
  };

  module.exports = {
    Location: Location
  };
})();
