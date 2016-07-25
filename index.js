/*eslint no-undef: "error"*/

var prepareFragments = require('./src/prepareFragments');
var transformFragments = require('./src/transformFragments');
var SQLFunction = require('./src/SQLFunction');
var SQL = require('./src/SQL');

module.exports = function() {
  if (arguments.length === 0) {
    throw new Error('no arguments');
  }

  var locations = (arguments.length > 1) ? Array.prototype.slice.call(arguments) : [arguments[0]];
  var fragmentFunctionList = locations.map(function(location) {
    return geocode(location);
  })

  var sql = SQL(fragmentFunctionList);
  return sql;
}

var geocode = function(location) {
  if (typeof location !== 'string') {
    throw new Error('not a string');
  }
  var fragments = prepareFragments(location);
  var sqlFunction = SQLFunction(fragments);
  fragments = transformFragments(fragments, sqlFunction);
  return {
    fragments: fragments,
    sqlFunction: sqlFunction
  }
}
