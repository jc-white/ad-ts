import { Opts } from "../node_modules/@types/activedirectory2/interfaces";
import ADMain from "./main";
import { Dictionary, IAddUserProps, IProcessResultsConfig, IUpdateUserProps } from "./interfaces";

const ssha           = require("node-ssha256");
const api            = require("./util/api");
const encodePassword = require("./util/encodePassword");
const parseLocation  = require("./util/parseLocation");

/**
 *  Public user functions
 *  --------------------------
 *  findUser(userName, opts)
 *  addUser(opts)
 *  userExists(userName)
 *  userIsMemberOf(userName, groupName)
 *  authenticateUser(userName, pass)
 *  setUserPassword(userName, pass)
 *  setUserPasswordNeverExpires(userName)
 *  enableUser(userName)
 *  disableUser(userName)
 *  moveUser(userName, location)
 *  getUserLocation(userName)
 *  unlockUser(userName)
 *  removeUser(userName)
 */

export class ADUserHandler {
    private _AD: ADMain;

    constructor(ADInstance: ADMain) {
        this._AD = ADInstance;
    }

    getAllUsers(config: IProcessResultsConfig) {
        return this._AD._findByType(config, ["user"]);
    }

    async addUser(props: IAddUserProps) {
        return new Promise(async (resolve, reject) => {
            let {
                    firstName,
                    lastName,
                    commonName,
                    userName,
                    pass,
                    email,
                    title,
                    phone,
                    location
                } = props;

            let { passwordExpires, enabled } = props;

            if (commonName) {
                let cnParts = String(commonName).split(" ");
                firstName   = firstName ? firstName : cnParts[0];
                if (cnParts.length > 1) {
                    lastName = lastName ? lastName : cnParts[cnParts.length - 1];
                }
            } else {
                if (firstName && lastName) {
                    commonName = `${firstName} ${lastName}`;
                }
            }

            location = parseLocation(location);

            let valid =
                  email && String(email).indexOf("@") === -1
                    ? "Invalid email address."
                    : !commonName
                    ? "A commonName is required."
                    : !userName ? "A userName is required." : true;

            if (valid !== true) {
                /* istanbul ignore next */
                return reject({ error: true, message: valid, httpStatus: 400 });
            }

            const userObject = {
                cn:                commonName,
                givenName:         firstName,
                sn:                lastName,
                mail:              email,
                uid:               userName,
                title:             title,
                telephone:         phone,
                userPrincipalName: `${userName}@${this._AD.config.domain}`,
                sAMAccountName:    userName,
                objectClass:       "inetOrgPerson",
                userPassword:      ssha.create(pass)
            };

            this._AD._addObject(`CN=${commonName}`, location, userObject)
              .then(res => {
                  delete this._AD._cachedItems.users[userName];
                  this._AD._cachedItems.all = {};
                  return this.setUserPassword(userName, pass);
              })
              .then(data => {
                  let expirationMethod =
                        passwordExpires === false
                          ? this.setUserPasswordNeverExpires
                          : this.enableUser;

                  return expirationMethod.call(this, userName);
              })
              .then(data => {
                  let enableMethod = enabled === false ? this.disableUser : this.enableUser;

                  return enableMethod.call(this, userName);
              })
              .then(data => {
                  delete userObject.userPassword;
                  return resolve(userObject);
              })
              .catch(err => {
                  /* istanbul ignore next */
                  const ENTRY_EXISTS = String(err.message).indexOf("ENTRY_EXISTS") > -1;
                  /* istanbul ignore next */
                  if (ENTRY_EXISTS) {
                      /* istanbul ignore next */
                      return reject({
                          message:    `User ${userName} already exists.`,
                          httpStatus: 400
                      });
                  }
                  /* istanbul ignore next */
                  return reject({
                      message:    `Error creating user: ${err.message}`,
                      httpStatus: 503
                  });
              });
        });
    }

    async updateUser(userName: string, props: IUpdateUserProps) {
        return new Promise((resolve, reject) => {
            const domain = this._AD.config.domain;

            const map: Dictionary<string> = {
                firstName:   "givenName",
                lastName:    "sn",
                password:    "unicodePwd",
                commonName:  "cn",
                email:       "mail",
                title:       "title",
                objectClass: "objectClass",
                userName:    "sAMAccountName"
            };

            let later: Array<any>      = [];
            let operations: Array<any> = [];

            for (const name in props) {
                if (map[name] !== undefined) {
                    let key   = map[name];
                    let value =
                          name === "password" ? encodePassword(props[name]) : props[name];
                    if (key !== "cn") {
                        if (key === "sAMAccountName") {
                            later.push({
                                sAMAccountName: value
                            });
                            later.push({
                                uid: value
                            });
                            later.push({
                                userPrincipalName: `${value}@${domain}`
                            });
                        } else {
                            operations.push({
                                [key]: value
                            });
                        }
                    }
                }
            }

            operations       = operations.concat(later);
            let currUserName = userName;
            const go         = () => {
                if (operations.length < 1) {
                    delete this._AD._cachedItems.users[currUserName];
                    delete this._AD._cachedItems.users[userName];
                    resolve();
                    return;
                }
                let next = operations.pop();
                this.setUserProperty(currUserName, next)
                  .then((res: any) => {
                      if (next.userPrincipalName !== undefined) {
                          currUserName = next.userPrincipalName;
                      }
                      delete this._AD._cachedItems.users[currUserName];
                      go();
                  })
                  .catch((err: any) => {
                      return reject(err);
                  });
            };

            this.findUser(currUserName)
              .then(async (userObject: any) => {
                  if (props.commonName !== undefined) {
                      await this.setUserCN(currUserName, props.commonName);
                  }
              })
              .then(async (data: any) => {
                  let expirationMethod = props.passwordExpires === false
                    ? this.setUserPasswordNeverExpires
                    : this.enableUser;

                  if (props.passwordExpires !== undefined) {
                     await expirationMethod.call(this, userName);
                  }
              })
              .then(async (data: any) => {
                  let enableMethod = props.enabled === false ? this.disableUser : this.enableUser;

                  if (props.enabled !== undefined) {
                      await enableMethod.call(this, userName);
                  }
              })
              .then(res => {
                  go();
              })
              .catch(err => {
                  return reject(err);
              });
        });
    }

    findUser(userName: string, config?: IProcessResultsConfig) {
        userName = String(userName || "");

        return new Promise((resolve, reject) => {
            let cached = this._AD._cache.get("users", userName);

            if (cached) {
                return resolve(api.processResults(config, [cached])[0]);
            }

            const domain = this._AD.config.domain;

            userName = userName.indexOf("@") > -1 ? userName.split("@")[0] : userName;

            const filter     = `(|(userPrincipalName=${userName}@${domain})(sAMAccountName=${userName}))`,
                  opts: Opts = {
                      filter:            filter,
                      includeMembership: ["all"],
                      includeDeleted:    false
                  };

            this._AD.ad.find(opts, (err, results) => {
                if (err) {
                    /* istanbul ignore next */
                    return reject(err);
                }

                if (!results || !results.users || results.users.length < 1) {
                    this._AD._cache.set("users", userName, {});
                    return resolve({});
                }

                this._AD._cache.set("users", userName, results.users[0]);
                results.users = api.processResults(config, results.users);

                return resolve(results.users[0]);
            });
        });
    }

    userExists(userName: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const domain   = this._AD.config.domain,
                  fullUser = userName.indexOf("@") > -1 ? userName : `${userName}@${domain}`;

            this._AD.ad.userExists({}, fullUser, (error, exists) => {
                if (error) {
                    /* istanbul ignore next */
                    return reject(error);
                }

                return resolve(exists);
            });
        });
    }

    userIsMemberOf(userName: string, groupName: string) {
        return new Promise(async (resolve, reject) => {
            let userDN: string;

            this.findUser(userName)
              .then((userObject: any) => {
                  userDN = userObject.dn;
                  return this._AD._getGroupUsers(groupName, {});
              })
              .then(users => {
                  users      = users.filter(u => u.dn === userDN);
                  let exists = users.length > 0;
                  resolve(exists);
              })
              .catch(err => {
                  /* istanbul ignore next */
                  reject(err);
              });
        });
    }

    authenticateUser(userName: string, pass: string) {
        const domain = this._AD.config.domain;
        let fullUser = `${userName}@${domain}`;

        return new Promise(async (resolve, reject) => {
            this._AD.ad.authenticate(fullUser, pass, (error: any, authorized) => {
                if (error && error.lde_message) {
                    return resolve({
                        detail:  error.lde_message,
                        message: String(error.stack).split(":")[0]
                    });
                }

                if (error) {
                    /* istanbul ignore next */
                    return reject(error);
                }

                return resolve(authorized);
            });
        });
    }

    setUserPassword(userName: string, pass: string) {
        return new Promise((resolve, reject) => {
            if (!pass) {
                return reject({ message: "No password provided." });
            }

            this._AD.operations._userReplaceOperation(userName, {
                  unicodePwd: encodePassword(pass)
              })
              .then(resolve)
              .catch(reject);
        });
    }

    setUserCN(userName: string, cn: string) {
        return new Promise((resolve, reject) => {
            this.findUser(userName)
              .then((userObject: any) => {
                  let oldDN = userObject.dn;
                  let parts = String(oldDN).split(",");
                  parts.shift();
                  parts.unshift(`CN=${cn}`);

                  return this._AD._modifyDN(oldDN, parts.join(","));
              })
              .then((result: any) => {
                  delete this._AD._cachedItems.users[userName];
                  return resolve(result);
              })
              .catch((err: Error) => {
                  /* istanbul ignore next */
                  return reject(err);
              });
        });
    }

    setUserProperty(userName: string, obj: object) {
        return this._AD.operations._userReplaceOperation(userName, obj);
    }

    setUserPasswordNeverExpires(userName: string) {
        const NEVER_EXPIRES = 66048;
        return this._AD.operations._userReplaceOperation(userName, {
            userAccountControl: NEVER_EXPIRES
        });
    }

    enableUser(userName: string) {
        const ENABLED = 512;
        return this._AD.operations._userReplaceOperation(userName, {
            userAccountControl: ENABLED
        });
    }

    disableUser(userName: string) {
        const DISABLED = 514;
        return this._AD.operations._userReplaceOperation(userName, {
            userAccountControl: DISABLED
        });
    }

    moveUser(userName: string, location: string) {
        return new Promise(async (resolve, reject) => {
            location = parseLocation(location);
            this.findUser(userName)
              .then((userObject: any) => {
                  let oldDN  = userObject.dn;
                  let baseDN = String(this._AD.config.baseDN).replace(/dc=/g, "DC=");
                  let newDN  = `CN=${userObject.cn},${location}${baseDN}`;
                  return this._AD._modifyDN(oldDN, newDN);
              })
              .then(result => {
                  delete this._AD._cachedItems.users[userName];
                  resolve(result);
              })
              .catch(err => {
                  /* istanbul ignore next */
                  reject(err);
              });
        });
    }

    getUserLocation(userName: string) {
        return new Promise(async (resolve, reject) => {
            this.findUser(userName)
              .then((userObject: any) => {
                  if (Object.keys(userObject).length < 1) {
                      /* istanbul ignore next */
                      return reject({ error: true, message: "User does not exist." });
                  }
                  let dn       = userObject.dn;
                  let left     = String(dn)
                    .replace(/DC=/g, "dc=")
                    .replace(/CN=/g, "cn=")
                    .replace(/OU=/g, "ou=")
                    .split(",dc=")[0];
                  let location = String(left)
                    .split(",")
                    .slice(1)
                    .reverse()
                    .join("/")
                    .replace(/cn=/g, "!")
                    .replace(/ou=/g, "");
                  return resolve(location);
              })
              .catch(err => {
                  /* istanbul ignore next */
                  return reject(err);
              });
        });
    }

    async unlockUser(userName: string) {
        return this._AD.operations._userReplaceOperation(userName, {
            lockoutTime: 0
        });
    }

    removeUser(userName: string) {
        return new Promise(async (resolve, reject) => {
            this.findUser(userName)
              .then((userObject: any) => {
                  if (Object.keys(userObject).length < 1) {
                      return reject({ error: true, message: "User does not exist." });
                  }
                  this._AD._deleteObjectByDN(userObject.dn)
                    .then(resp => {
                        resolve(resp);
                    })
                    .catch(err => {
                        /* istanbul ignore next */
                        reject(Object.assign(err, { error: true }));
                    });
              });
        });
    }

    getUserGroupMembership(userName: string, opts: Opts) {
        return new Promise(async (resolve, reject) => {
            this.findUser(userName)
              .then((userObject: any) => {
                  if (Object.keys(userObject).length < 1) {
                      return reject({ error: true, message: "User does not exist." });
                  }

                  this._AD._getUserGroups(userObject.dn, opts)
                    .then(resp => {
                        resolve(resp);
                    })
                    .catch(err => {
                        /* istanbul ignore next */
                        reject(Object.assign(err, { error: true }));
                    });
              });
        });
    }
}
