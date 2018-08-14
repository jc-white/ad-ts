'use strict';
module.exports = function wrapAsync(fn) {
  return new Promise(function(resolve) {
    fn
      .then(function(res) {
        resolve([undefined, res]);
      })
      .catch(function(err) {
        resolve([err]);
      });
  });
};
//# sourceMappingURL=wrapAsync.ts.map
