'use strict';
module.exports = function parseLocation(location) {
  if (location) {
    location = String(location)
      .replace(/\\/g, '/')
      .split('/')
      .reverse()
      .map(function(loc) {
        return loc.slice(0, 1) === '!' ? loc.replace('!', 'CN=') : 'OU=' + loc;
      })
      .join(',');
    location += ',';
  }
  location = location || '';
  return location;
};
//# sourceMappingURL=parseLocation.ts.map
