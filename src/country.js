var countries = require('world-countries/dist/countries-unescaped.json');

module.exports = function(countryName) {
  return countries.some(function(country) {
    return country.name.common === countryName || country.name.official === countryName || nativeMatch(countryName, country.name.native);
  });
};

var nativeMatch = function(countryName, native) {
  return Object.keys(native).some(function(lang) {
    return native[lang].common === countryName || native[lang].official === countryName;
  });
};
