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
var api = require('./util/api');
var parseLocation = require('./util/parseLocation');
module.exports = {
  getAllGroups: function(opts) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4, this._findByType(opts, ['group'])];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  },
  findGroup: function(groupName, opts) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        groupName = String(groupName || '');
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var filter, config;
              var _this = this;
              return __generator(this, function(_a) {
                groupName =
                  groupName.indexOf('@') > -1
                    ? groupName.split('@')[0]
                    : groupName;
                if (groupName.trim() === '') {
                  return [2, reject(groupName + ' is not a valid Group name.')];
                }
                filter = '(|(cn=' + groupName + '))';
                config = {
                  filter: filter,
                  includeDeleted: false
                };
                try {
                  this.ad.find(config, function(err, results) {
                    return __awaiter(_this, void 0, void 0, function() {
                      return __generator(this, function(_a) {
                        if (err) {
                          return [2, reject(err)];
                        }
                        if (
                          !results ||
                          !results.groups ||
                          results.groups.length < 1
                        ) {
                          return [2, resolve({})];
                        }
                        results.groups = api.processResults(
                          opts,
                          results.groups
                        );
                        return [2, resolve(results.groups[0])];
                      });
                    });
                  });
                } catch (e) {
                  reject(e);
                }
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  groupExists: function(groupName) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              return __generator(this, function(_a) {
                this.findGroup(groupName)
                  .then(function(groupObject) {
                    var exists = !groupObject || !groupObject.dn ? false : true;
                    resolve(exists);
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
  addGroup: function(opts) {
    return __awaiter(this, void 0, void 0, function() {
      var name, location, description;
      return __generator(this, function(_a) {
        if (typeof opts === 'string') {
          opts = { name: opts };
        }
        (name = opts.name),
          (location = opts.location),
          (description = opts.description);
        location = parseLocation(location);
        return [
          2,
          this._addObject('CN=' + name, location, {
            cn: name,
            description: description,
            objectClass: 'group',
            sAmAccountName: name
          })
        ];
      });
    });
  },
  addUserToGroup: function(userName, groupName) {
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
                      message: 'User ' + userName + ' does not exist.'
                    });
                  }
                  _this
                    ._groupAddOperation(groupName, {
                      member: [userObject.dn]
                    })
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
  removeUserFromGroup: function(userName, groupName) {
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
                    ._groupDeleteOperation(groupName, {
                      member: [userObject.dn]
                    })
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
  removeGroup: function(groupName) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                this.findGroup(groupName)
                  .then(function(groupObject) {
                    if (Object.keys(groupObject).length < 1) {
                      return reject({
                        error: true,
                        message: 'Group ' + groupName + ' does not exist.'
                      });
                    }
                    return _this._deleteObjectByDN(groupObject.dn);
                  })
                  .then(function(resp) {
                    return resolve(resp);
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
  getGroupMembers: function(groupName) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                this.findGroup(groupName)
                  .then(function(groupObject) {
                    if (Object.keys(groupObject).length < 1) {
                      return reject({
                        error: true,
                        message: 'Group ' + groupName + ' does not exist.'
                      });
                    }
                    return _this._getGroupUsers(groupName);
                  })
                  .then(function(resp) {
                    return resolve(resp);
                  })
                  .catch(reject);
                return [2];
              });
            });
          })
        ];
      });
    });
  }
};
//# sourceMappingURL=group.ts.map
