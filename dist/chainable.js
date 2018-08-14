'use strict';
module.exports = {
  user: function(userName) {
    var _this = this;
    if (userName === undefined) {
      return {
        get: function(filter) {
          return _this.getAllUsers(filter);
        },
        add: function(opts) {
          return _this.addUser(opts);
        }
      };
    }
    return {
      get: function(opts) {
        return _this.findUser(userName, opts);
      },
      update: function(opts) {
        return _this.updateUser(userName, opts);
      },
      exists: function() {
        return _this.userExists(userName);
      },
      addToGroup: function(groupName) {
        return _this.addUserToGroup(userName, groupName);
      },
      removeFromGroup: function(groupName) {
        return _this.removeUserFromGroup(userName, groupName);
      },
      isMemberOf: function(groupName) {
        return _this.userIsMemberOf(userName, groupName);
      },
      authenticate: function(pass) {
        return _this.authenticateUser(userName, pass);
      },
      password: function(pass) {
        return _this.setUserPassword(userName, pass);
      },
      passwordNeverExpires: function() {
        return _this.setUserPasswordNeverExpires(userName);
      },
      passwordExpires: function() {
        return _this.enableUser(userName);
      },
      enable: function() {
        return _this.enableUser(userName);
      },
      disable: function() {
        return _this.disableUser(userName);
      },
      move: function(location) {
        return _this.moveUser(userName, location);
      },
      location: function() {
        return _this.getUserLocation(userName);
      },
      unlock: function() {
        return _this.unlockUser(userName);
      },
      remove: function() {
        return _this.removeUser(userName);
      },
      getGroupMembership: function(opts) {
        return _this.getUserGroupMembership(userName, opts);
      }
    };
  },
  group: function(groupName) {
    var _this = this;
    if (groupName === undefined) {
      return {
        get: function(opts) {
          return _this.getAllGroups(opts);
        },
        add: function(opts) {
          return _this.addGroup(opts);
        }
      };
    }
    return {
      get: function(opts) {
        return _this.findGroup(groupName, opts);
      },
      exists: function() {
        return _this.groupExists(groupName);
      },
      members: function() {
        return _this.getGroupMembers(groupName);
      },
      addUser: function(userName) {
        return _this.addUserToGroup(userName, groupName);
      },
      removeUser: function(userName) {
        return _this.removeUserFromGroup(userName, groupName);
      },
      remove: function() {
        return _this.removeGroup(groupName);
      }
    };
  },
  ou: function(ouName) {
    var _this = this;
    if (ouName === undefined) {
      return {
        get: function(filter) {
          return _this.getAllOUs(filter);
        },
        add: function(opts) {
          return _this.addOU(opts);
        }
      };
    }
    return {
      get: function() {
        return _this.findOU(ouName);
      },
      exists: function() {
        return _this.ouExists(ouName);
      },
      remove: function() {
        return _this.removeOU(ouName);
      }
    };
  },
  other: function() {
    var _this = this;
    return {
      get: function(opts) {
        return _this.getAllOthers(opts);
      }
    };
  },
  all: function() {
    var _this = this;
    return {
      get: function(opts) {
        return _this.getAll(opts);
      }
    };
  },
  find: function(searchString, opts) {
    return this._search(searchString, opts);
  }
};
//# sourceMappingURL=index.ts.map
