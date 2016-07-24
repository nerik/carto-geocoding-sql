var country = require('./country');

module.exports = function(fragments) {
  switch (fragments.length) {
  case 1 :
    if (country(fragments[0])) {
      return 'cdb_geocode_admin0_polygon';
    } else if (isIP(fragments[0])) {
      return 'cdb_geocode_ipaddress_point';
    } else {
      return 'cdb_geocode_namedplace_point';
    }
  case 2 :
    if (isPostalCode(fragments[0])) {
      return 'cdb_geocode_postalcode_point';
    } else {
      return 'cdb_geocode_namedplace_point';
    }
  case 3 :
  case 4 :
    return 'cdb_geocode_street_point';

  default :
    break;
  }
  return null;
};

var isIP = function(ip) {
  return ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/i) !== null;
};

var isPostalCode = function(postalCode) {
  postalCode = postalCode.replace(/\s/g, '');
  var numInts = postalCode.split('').reduce(function(prev, current) {
    return (isNaN(parseInt(current))) ? prev : prev+1;
  }, 0);
  return numInts >= postalCode.length/2;
};
