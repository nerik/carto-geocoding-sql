module.exports = function(location) {
  var fragments = location.split(',');
  return fragments.map(function(fragment) {
    return fragment.trim();
  });
};
