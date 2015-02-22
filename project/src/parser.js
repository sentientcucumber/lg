(function() {
  'use-strict';

  function Symbol () {
    this.one = new String();
    this.two = new String();
    this.three = new String();
  }

  Symbol.prototype = {
    display: function () {
      return 'A(' + this.one + ', ' + this.two + ', ' + this.three + ')';
    }
  };

  exports.readGrammar = function (input) {

  };
})();
