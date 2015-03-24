(function () {
  'use strict';

  var Location = function (x, y) {
    this.x = x;
    this.y = y;
  };

  Location.prototype.toString = function () {
    return '(' + this.x + ',' + this.y + ')';
  };

  module.exports = {
    Location: Location
  };
})();
