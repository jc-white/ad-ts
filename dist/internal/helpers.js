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
var api = require('../util/api');
var ldap = require('ldapjs');
module.exports = {
  _getBoundClient: function() {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var client;
              return __generator(this, function(_a) {
                client = ldap.createClient({
                  url: this.config.url,
                  tlsOptions: {
                    rejectUnauthorized: false
                  }
                });
                client.bind(this.config.user, this.config.pass, function(
                  err,
                  data
                ) {
                  resolve([err, client]);
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  _findByType: function(opts, membership) {
    return __awaiter(this, void 0, void 0, function() {
      var cacheKey;
      var _this = this;
      return __generator(this, function(_a) {
        opts = opts || {};
        cacheKey = JSON.stringify(membership);
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var cached, domain, config;
              var _this = this;
              return __generator(this, function(_a) {
                cached = this._cache.get('all', cacheKey);
                if (cached) {
                  return [2, resolve(api.processResults(opts, cached))];
                }
                domain = this.config.domain;
                config = {
                  query: 'CN=*',
                  includeMembership: membership,
                  includeDeleted: false
                };
                this.ad.find(config, function(err, results) {
                  if (err) {
                    return reject(err);
                  }
                  if (!results || results.length < 1) {
                    return resolve([]);
                  }
                  if (membership.indexOf('all') > -1) {
                    _this._cache.set('all', cacheKey, results);
                    return resolve(api.processResults(opts, results));
                  }
                  var compiled = [];
                  if (membership.indexOf('user') > -1) {
                    compiled = compiled.concat(results.users);
                  }
                  if (membership.indexOf('group') > -1) {
                    compiled = compiled.concat(results.groups);
                  }
                  if (membership.indexOf('other') > -1) {
                    compiled = compiled.concat(results.other);
                  }
                  _this._cache.set('all', cacheKey, compiled);
                  resolve(api.processResults(opts, compiled));
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  _search: function(filter, config) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var opts;
              return __generator(this, function(_a) {
                opts = {
                  filter: filter,
                  includeDeleted: false
                };
                try {
                  this.ad.find(opts, function(err, results) {
                    if (err) {
                      return reject(err);
                    }
                    if (!results) {
                      return resolve([]);
                    }
                    if (config) {
                      var combined = [];
                      for (var key in results) {
                        if (Array.isArray(results[key])) {
                          combined = combined.concat(results[key]);
                        }
                      }
                      combined = api.processResults(config, combined);
                      results = combined;
                    }
                    return resolve(results);
                  });
                } catch (e) {
                  return [
                    2,
                    reject({ message: e.message, type: e.type, stack: e.stack })
                  ];
                }
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  _getGroupUsers: function(groupName) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              return __generator(this, function(_a) {
                this.ad.getUsersForGroup(groupName, function(err, users) {
                  if (err) {
                    return reject({ message: err.message });
                  }
                  if (!users) {
                    return reject({
                      message: 'Group ' + groupName + ' does not exist.'
                    });
                  }
                  return resolve(users);
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  _getUserGroups: function(userName, opts) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              return __generator(this, function(_a) {
                this.ad.getGroupMembershipForUser(opts, userName, function(
                  err,
                  groups
                ) {
                  if (err) {
                    return reject({ message: err.message });
                  }
                  return resolve(groups);
                });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  _addObject: function(name, location, object) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var baseDN, fullDN, _a, error, client, key;
              var _this = this;
              return __generator(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    baseDN = String(this.config.baseDN).replace(/dc=/g, 'DC=');
                    fullDN = String(name + ',' + location + baseDN);
                    return [4, this._getBoundClient()];
                  case 1:
                    (_a = _b.sent()), (error = _a[0]), (client = _a[1]);
                    if (error) {
                      return [2, reject(error)];
                    }
                    for (key in object) {
                      if (object[key] === undefined) {
                        delete object[key];
                      }
                    }
                    client.add(fullDN, object, function(err, data) {
                      return __awaiter(_this, void 0, void 0, function() {
                        return __generator(this, function(_a) {
                          if (error) {
                            return [2, reject(error)];
                          }
                          delete object.userPassword;
                          resolve(object);
                          return [2];
                        });
                      });
                    });
                    return [2];
                }
              });
            });
          })
        ];
      });
    });
  },
  _deleteObjectBySearch: function(searchString) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                this._search(searchString, { fields: ['dn'] })
                  .then(function(results) {
                    if (results.length < 1) {
                      return reject({
                        message: 'Object ' + searchString + ' does not exist.'
                      });
                    }
                    if (results.length > 1) {
                      return reject({
                        message: 'More than 1 Object was returned.'
                      });
                    }
                    _this
                      ._deleteObjectByDN(results[0].dn)
                      .then(function(result) {
                        resolve(result);
                      })
                      .catch(reject);
                  })
                  .catch(reject);
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  _deleteObjectByDN: function(dn) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _a, error, client;
              var _this = this;
              return __generator(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    return [4, this._getBoundClient()];
                  case 1:
                    (_a = _b.sent()), (error = _a[0]), (client = _a[1]);
                    if (error) {
                      return [2, reject(error)];
                    }
                    client.del(dn, function(err, data) {
                      return __awaiter(_this, void 0, void 0, function() {
                        return __generator(this, function(_a) {
                          if (error) {
                            return [2, reject(error)];
                          }
                          resolve({ success: true });
                          return [2];
                        });
                      });
                    });
                    return [2];
                }
              });
            });
          })
        ];
      });
    });
  },
  _modifyDN: function(oldDN, newDN) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _a, error, client;
              return __generator(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    return [4, this._getBoundClient()];
                  case 1:
                    (_a = _b.sent()), (error = _a[0]), (client = _a[1]);
                    if (error) {
                      return [2, reject(error)];
                    }
                    try {
                      client.modifyDN(oldDN, newDN, function(err) {
                        if (err) {
                          return reject({ message: err.message });
                        }
                        return resolve({ success: true });
                      });
                    } catch (e) {
                      return [2, reject({ message: e.message })];
                    }
                    return [2];
                }
              });
            });
          })
        ];
      });
    });
  }
};
//# sourceMappingURL=helpers.ts.map
