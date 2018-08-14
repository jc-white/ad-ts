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
var ldap = require('ldapjs');
module.exports = {
  _operation: function(objectString, operation) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var _a, error, client, operations;
              return __generator(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    return [4, this._getBoundClient()];
                  case 1:
                    (_a = _b.sent()), (error = _a[0]), (client = _a[1]);
                    if (error) {
                      return [2, reject(error)];
                    }
                    operation = Array.isArray(operation)
                      ? operation
                      : [operation];
                    operations = operation.map(function(op) {
                      return new ldap.Change(op);
                    });
                    client.modify(objectString, operations, function(
                      error3,
                      data
                    ) {
                      if (error3) {
                        return reject(error3);
                      }
                      return resolve({ success: true });
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
  _operationByUser: function(userName, operation) {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [
          2,
          new Promise(function(resolve, reject) {
            return __awaiter(_this, void 0, void 0, function() {
              var domain;
              var _this = this;
              return __generator(this, function(_a) {
                domain = this.config.domain;
                userName = userName + '@' + domain;
                this.findUser(userName)
                  .then(function(userObject) {
                    return __awaiter(_this, void 0, void 0, function() {
                      return __generator(this, function(_a) {
                        if (!userObject || !userObject.dn) {
                          return [
                            2,
                            reject({
                              message: 'User ' + userName + ' does not exist.'
                            })
                          ];
                        }
                        return [2, this._operation(userObject.dn, operation)];
                      });
                    });
                  })
                  .then(function(data) {
                    delete _this._cache.users[userName];
                    resolve({ success: true });
                  })
                  .catch(function(error) {
                    reject(error);
                  });
                return [2];
              });
            });
          })
        ];
      });
    });
  },
  _operationByGroup: function(groupName, operation) {
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
                    return __awaiter(_this, void 0, void 0, function() {
                      return __generator(this, function(_a) {
                        if (
                          !groupObject ||
                          Object.keys(groupObject).length < 1
                        ) {
                          return [
                            2,
                            reject({
                              message: 'Group ' + groupName + ' does not exist.'
                            })
                          ];
                        }
                        return [2, this._operation(groupObject.dn, operation)];
                      });
                    });
                  })
                  .then(function(data) {
                    resolve(data);
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
  _groupAddOperation: function(groupName, modification) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [
          2,
          this._operationByGroup(groupName, {
            operation: 'add',
            modification: modification
          })
        ];
      });
    });
  },
  _groupDeleteOperation: function(groupName, modification) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [
          2,
          this._operationByGroup(groupName, {
            operation: 'delete',
            modification: modification
          })
        ];
      });
    });
  },
  _userReplaceOperation: function(userName, modification) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [
          2,
          this._operationByUser(userName, {
            operation: 'replace',
            modification: modification
          })
        ];
      });
    });
  }
};
//# sourceMappingURL=operations.ts.map
