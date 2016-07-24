module.exports = function (fragments, sqlFunction) {
  if (fragments.length === 3 && sqlFunction === 'cdb_geocode_street_point') {
    fragments.splice(2,0,null);
  }
  return fragments;
};
