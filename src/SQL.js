module.exports = function () {
  var fragmentFunctionList = (arguments[0] instanceof Array) ? arguments[0] : [arguments[0]];
  var sqlStatements = fragmentFunctionList.map(function(fragmentFunction) {
    return SQL(fragmentFunction.fragments, fragmentFunction.sqlFunction);
  });
  var sql = `${sqlStatements.join(' UNION ')};`;
  return sql;
};

var SQL = function (fragments, sqlFunction) {
  var centroid = needsCentroid(sqlFunction);
  var sql = fragments.join('\',\'');
  sql = `'${sql}'`;
  sql = `${sqlFunction}(${sql})`;
  if (centroid) {
    sql = `ST_Centroid(${sql})`;
  }
  sql = `SELECT ${sql} the_geom`;
  return sql;
};

var needsCentroid = function(sqlFunction) {
  //later, this should be made optional
  return sqlFunction.match('polygon') !== null;
};
