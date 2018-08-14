'use strict';
module.exports = function encodePassword(password) {
  var newPassword = '';
  password = '"' + password + '"';
  for (var i = 0; i < password.length; i++) {
    newPassword += String.fromCharCode(
      password.charCodeAt(i) & 0xff,
      (password.charCodeAt(i) >>> 8) & 0xff
    );
  }
  return newPassword;
};
//# sourceMappingURL=encodePassword.ts.map
