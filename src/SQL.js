module.exports = function (fragments, sqlFunction) {
  var centroid = needsCentroid(sqlFunction);
  var sql = fragments.join('\',\'');
  sql = `'${sql}'`;
  sql = `${sqlFunction}(${sql})`;
  if (centroid) {
    sql = `ST_Centroid(${sql})`;
  }
  sql = `SELECT ${sql};`;
  return sql;
};

var needsCentroid = function(sqlFunction) {
  //later, this should be made optional
  return sqlFunction.match('polygon') !== null;
};
