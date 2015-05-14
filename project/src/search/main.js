(function () {
  /* main.js
   *
   * The driver file for grammar of reduced searches
   */

  'use strict';

  // Dependencies
  var utils = require('../utilities/utilities.js')
  ,   Search = require('./Search.js').Search
  ,   _ = require('lodash')
  ,   fs = require('fs');

  var input = utils.validateFile(process.argv[2]);
  if (input) {
    var moveTrees = JSON.parse(fs.readFileSync('./src/search/tree.json'));

    _.forEach(moveTrees, function (tree) {
      var search = new Search(input, tree);
      search.beginSearch();
      
      _.forEach(search.parser.state, function (symbol) {
        if (symbol.name === 'pi')
          console.log(symbol);
      });
    });
  } else {
    console.log("Invalid file, exiting program.");
    process.exit(1);
  }
})();
