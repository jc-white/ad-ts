'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function() {
          return this;
        }),
      g
    );
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var ssha = require('node-ssha256');
var api = require('./util/api');
var encodePassword = require('./util/encodePassword');
var wrapAsync = require('./util/wrapAsync');
var parseLocation = require('./util/parseLocation');
module.exports = {
  getAllUsers: function(opts) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4, this._findByType(opts, ['user'])];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  },
  addUser: function(opts) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var firstName,
                lastName,
                commonName,
                userName,
                pass,
                email,
                title,
                phone,
                location,
                passwordExpires,
                enabled,
                cnParts,
                valid,
                userObject;
              var _this = this;
              return __generator(this, function(_a) {
                (firstName = opts.firstName),
                  (lastName = opts.lastName),
                  (commonName = opts.commonName),
                  (userName = opts.userName),
                  (pass = opts.pass),
                  (email = opts.email),
                  (title = opts.title),
                  (phone = opts.phone),
                  (location = opts.location);
                (passwordExpires = opts.passwordExpires),
                  (enabled = opts.enabled);
                if (commonName) {
                  cnParts = String(commonName).split(' ');
                  firstName = firstName ? firstName : cnParts[0];
                  if (cnParts.length > 1) {
                    lastName = lastName
                      ? lastName
                      : cnParts[cnParts.length - 1];
                  }
                } else {
                  if (firstName && lastName) {
                    commonName = firstName + ' ' + lastName;
                  }
                }
                location = parseLocation(location);
                valid =
                  email && String(email).indexOf('@') === -1
                    ? 'Invalid email address.'
                    : !commonName
                      ? 'A commonName is required.'
                      : !userName ? 'A userName is required.' : true;
                if (valid !== true) {
                  return [
                    2,
                    reject({ error: true, message: valid, httpStatus: 400 })
                  ];
                }
                userObject = {
                  cn: commonName,
                  givenName: firstName,
                  sn: lastName,
                  mail: email,
                  uid: userName,
                  title: title,
                  telephone: phone,
                  userPrincipalName: userName + '@' + this.config.domain,
                  sAMAccountName: userName,
                  objectClass: this.config.defaults.userObjectClass,
                  userPassword: ssha.create(pass)
                };
                this._addObject('CN=' + commonName, location, userObject)
                  .then(function(res) {
                    delete _this._cache.users[userName];
                    _this._cache.all = {};
                    return _this.setUserPassword(userName, pass);
                  })
                  .then(function(data) {
                    var expirationMethod =
                      passwordExpires === false
                        ? 'setUserPasswordNeverExpires'
                        : 'enableUser';
                    return _this[expirationMethod](userName);
                  })
                  .then(function(data) {
                    var enableMethod =
                      enabled === false ? 'disableUser' : 'enableUser';
                    return _this[enableMethod](userName);
                  })
                  .then(function(data) {
                    delete userObject.userPassword;
                    return resolve(userObject);
                  })
                  .catch(function(err) {
                    var ENTRY_EXISTS =
                      String(err.message).indexOf('ENTRY_EXISTS') > -1;
                    if (ENTRY_EXISTS) {
                      return reject({
                        message: 'User ' + userName + ' already exists.',
                        httpStatus: 400
                      });
                    }
                    return reject({
                      message: 'Error creating user: ' + err.message,
                      httpStatus: 503
                    });
                  });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  updateUser: function(userName, opts) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            var _a;
            var domain = _this.config.domain;
            var map = {
              firstName: 'givenName',
              lastName: 'sn',
              password: 'unicodePwd',
              commonName: 'cn',
              email: 'mail',
              title: 'title',
              objectClass: 'objectClass',
              userName: 'sAMAccountName'
            };
            var later = [];
            var operations = [];
            for (var name_1 in opts) {
              if (map[name_1] !== undefined) {
                var key = map[name_1];
                var value =
                  name_1 === 'password'
                    ? encodePassword(opts[name_1])
                    : opts[name_1];
                if (key !== 'cn') {
                  if (key === 'sAMAccountName') {
                    later.push({
                      sAMAccountName: value
                    });
                    later.push({
                      uid: value
                    });
                    later.push({
                      userPrincipalName: value + '@' + domain
                    });
                  } else {
                    operations.push(((_a = {}), (_a[key] = value), _a));
                  }
                }
              }
            }
            operations = operations.concat(later);
            var currUserName = userName;
            var go = function() {
              if (operations.length < 1) {
                delete _this._cache.users[currUserName];
                delete _this._cache.users[userName];
                resolve();
                return;
              }
              var next = operations.pop();
              _this
                .setUserProperty(currUserName, next)
                .then(function(res) {
                  if (next.userPrincipalName !== undefined) {
                    currUserName = next.userPrincipalName;
                  }
                  delete _this._cache.users[currUserName];
                  go();
                })
                .catch(function(err) {
                  return reject(err);
                });
            };
            _this
              .findUser(currUserName)
              .then(function(data) {
                if (opts.commonName !== undefined) {
                  return _this.setUserCN(currUserName, opts.commonName);
                }
              })
              .then(function(data) {
                var expirationMethod =
                  opts.passwordExpires === false
                    ? 'setUserPasswordNeverExpires'
                    : 'enableUser';
                if (opts.passwordExpires !== undefined) {
                  return _this[expirationMethod](userName);
                }
              })
              .then(function(data) {
                var enableMethod =
                  opts.enabled === false ? 'disableUser' : 'enableUser';
                if (opts.enabled !== undefined) {
                  return _this[enableMethod](userName);
                }
              })
              .then(function(res) {
                go();
              })
              .catch(function(err) {
                return reject(err);
              });
          })
        ];
      });
    });
  },
  findUser: function(userName, opts) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        userName = String(userName || '');
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var cached, domain, filter, params;
              var _this = this;
              return __generator(this, function(_a) {
                cached = this._cache.get('users', userName);
                if (cached) {
                  return [2, resolve(api.processResults(opts, [cached])[0])];
                }
                domain = this.config.domain;
                userName =
                  userName.indexOf('@') > -1
                    ? userName.split('@')[0]
                    : userName;
                filter =
                  '(|(userPrincipalName=' +
                  userName +
                  '@' +
                  domain +
                  ')(sAMAccountName=' +
                  userName +
                  '))';
                params = {
                  filter: filter,
                  includeMembership: ['all'],
                  includeDeleted: false
                };
                this.ad.find(params, function(err, results) {
                  if (err) {
                    return reject(err);
                  }
                  if (!results || !results.users || results.users.length < 1) {
                    _this._cache.set('users', userName, {});
                    return resolve({});
                  }
                  _this._cache.set('users', userName, results.users[0]);
                  results.users = api.processResults(opts, results.users);
                  return resolve(results.users[0]);
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  userExists: function(userName) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var domain, fullUser;
              return __generator(this, function(_a) {
                (domain = this.config.domain),
                  (fullUser =
                    userName.indexOf('@') > -1
                      ? userName
                      : userName + '@' + domain);
                this.ad.userExists(fullUser, function(error, exists) {
                  if (error) {
                    return reject(error);
                  }
                  return resolve(exists);
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  userIsMemberOf: function(userName, groupName) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var userDN;
              var _this = this;
              return __generator(this, function(_a) {
                this.findUser(userName)
                  .then(function(userObject) {
                    userDN = userObject.dn;
                    return _this._getGroupUsers(groupName);
                  })
                  .then(function(users) {
                    users = users.filter(function(u) {
                      return u.dn === userDN;
                    });
                    var exists = users.length > 0;
                    resolve(exists);
                  })
                  .catch(function(err) {
                    reject(err);
                  });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  authenticateUser: function(userName, pass) {
    return __awaiter(this, void 0, void 0, function() {
      var domain, fullUser;
      var _this = this;
      return __generator(this, function(_a) {
        domain = this.config.domain;
        fullUser = userName + '@' + domain;
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              return __generator(this, function(_a) {
                this.ad.authenticate(fullUser, pass, function(
                  error,
                  authorized
                ) {
                  var code;
                  var out = authorized;
                  if (error && error.lde_message) {
                    out.detail = error.lde_message;
                    out.message = String(error.stack).split(':')[0];
                    error = undefined;
                  }
                  if (error) {
                    return reject(error);
                  }
                  return resolve(out);
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  setUserPassword: function(userName, pass) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            if (!pass) {
              return reject({ message: 'No password provided.' });
            }
            _this
              ._userReplaceOperation(userName, {
                unicodePwd: encodePassword(pass)
              })
              .then(resolve)
              .catch(reject);
          })
        ];
      });
    });
  },
  setUserCN: function(userName, cn) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                this.findUser(userName)
                  .then(function(userObject) {
                    var oldDN = userObject.dn;
                    var parts = String(oldDN).split(',');
                    parts.shift();
                    parts.unshift('CN=' + cn);
                    return _this._modifyDN(oldDN, parts.join(','));
                  })
                  .then(function(result) {
                    delete _this._cache.users[userName];
                    resolve(result);
                  })
                  .catch(function(err) {
                    reject(err);
                  });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  setUserProperty: function(userName, obj) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [2, this._userReplaceOperation(userName, obj)];
      });
    });
  },
  setUserPasswordNeverExpires: function(userName) {
    return __awaiter(this, void 0, void 0, function() {
      var NEVER_EXPIRES;
      return __generator(this, function(_a) {
        NEVER_EXPIRES = 66048;
        return [
          2,
          this._userReplaceOperation(userName, {
            userAccountControl: NEVER_EXPIRES
          })
        ];
      });
    });
  },
  enableUser: function(userName) {
    return __awaiter(this, void 0, void 0, function() {
      var ENABLED;
      return __generator(this, function(_a) {
        ENABLED = 512;
        return [
          2,
          this._userReplaceOperation(userName, {
            userAccountControl: ENABLED
          })
        ];
      });
    });
  },
  disableUser: function(userName) {
    return __awaiter(this, void 0, void 0, function() {
      var DISABLED;
      return __generator(this, function(_a) {
        DISABLED = 514;
        return [
          2,
          this._userReplaceOperation(userName, {
            userAccountControl: DISABLED
          })
        ];
      });
    });
  },
  moveUser: function(userName, location) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                location = parseLocation(location);
                this.findUser(userName)
                  .then(function(userObject) {
                    var oldDN = userObject.dn;
                    var baseDN = String(_this.config.baseDN).replace(
                      /dc=/g,
                      'DC='
                    );
                    var newDN = 'CN=' + userObject.cn + ',' + location + baseDN;
                    return _this._modifyDN(oldDN, newDN);
                  })
                  .then(function(result) {
                    delete _this._cache.users[userName];
                    resolve(result);
                  })
                  .catch(function(err) {
                    reject(err);
                  });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  getUserLocation: function(userName) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              return __generator(this, function(_a) {
                this.findUser(userName)
                  .then(function(userObject) {
                    if (Object.keys(userObject).length < 1) {
                      return reject({
                        error: true,
                        message: 'User does not exist.'
                      });
                    }
                    var dn = userObject.dn;
                    var left = String(dn)
                      .replace(/DC=/g, 'dc=')
                      .replace(/CN=/g, 'cn=')
                      .replace(/OU=/g, 'ou=')
                      .split(',dc=')[0];
                    var location = String(left)
                      .split(',')
                      .slice(1)
                      .reverse()
                      .join('/')
                      .replace(/cn=/g, '!')
                      .replace(/ou=/g, '');
                    return resolve(location);
                  })
                  .catch(function(err) {
                    return reject(err);
                  });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  unlockUser: function(userName) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [
          2,
          this._userReplaceOperation(userName, {
            lockoutTime: 0
          })
        ];
      });
    });
  },
  removeUser: function(userName) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                this.findUser(userName).then(function(userObject) {
                  if (Object.keys(userObject).length < 1) {
                    return reject({
                      error: true,
                      message: 'User does not exist.'
                    });
                  }
                  _this
                    ._deleteObjectByDN(userObject.dn)
                    .then(function(resp) {
                      resolve(resp);
                    })
                    .catch(function(err) {
                      reject(Object.assign(err, { error: true }));
                    });
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  getUserGroupMembership: function(userName, opts) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                this.findUser(userName).then(function(userObject) {
                  if (Object.keys(userObject).length < 1) {
                    return reject({
                      error: true,
                      message: 'User does not exist.'
                    });
                  }
                  _this
                    ._getUserGroups(userObject.dn, opts)
                    .then(function(resp) {
                      resolve(resp);
                    })
                    .catch(function(err) {
                      reject(Object.assign(err, { error: true }));
                    });
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  }
};
//# sourceMappingURL=user.ts.map
