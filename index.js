/*eslint no-undef: "error"*/

var prepareFragments = require('./src/prepareFragments');
var SQLFunction = require('./src/SQLFunction');
var SQL = require('./src/SQL');

module.exports = function(location) {
  if (!location) {
    throw new Error('no arguments');
  }
  if (typeof location !== 'string') {
    throw new Error('not a string')
  }

  var fragments = prepareFragments(location);
  var sqlFun = SQLFunction(fragments);
  var sql = SQL(fragments, sqlFun);
  return sql;
}