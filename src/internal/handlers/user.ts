import { Opts } from "../../../node_modules/@types/activedirectory2/interfaces";
import { InvalidCredentialError, UserNotExistError } from "../errors";
import ADMain from "../../main";
import { Dictionary, IAddUserProps, IProcessResultsConfig, IUpdateUserProps, IUserResult } from "../../interfaces";
import { encodePassword } from "../../util/encodePassword";
import processResults = require("../../util/processResults");

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

    getAllUsers(config?: IProcessResultsConfig): Promise<IUserResult[]> {
        return this._AD._findByType(['user'], config);
    }

    addUser(props: IAddUserProps) {
        return new Promise(async (resolve, reject) => {
            if (props.commonName) {
                let cnParts     = props.commonName.split(" ");
                props.firstName = props.firstName ? props.firstName : cnParts[0];

                if (cnParts.length > 1) {
                    props.lastName = props.lastName ? props.lastName : cnParts[cnParts.length - 1];
                }
            } else {
                if (props.firstName && props.lastName) {
                    props.commonName = `${props.firstName} ${props.lastName}`;
                }
            }

            let valid =
                  props.email && props.email.indexOf("@") === -1
                    ? "Invalid email address."
                    : !props.commonName
                    ? "A commonName is required."
                    : !props.userName ? "A userName is required." : true;

            if (valid !== true) {
                /* istanbul ignore next */
                return reject({ error: true, message: valid, httpStatus: 400 });
            }

            const userObject = {
                cn:                props.commonName,
                givenName:         props.firstName,
                sn:                props.lastName,
                uid:               props.userName,
                title:             props.title,
                telephone:         props.phone,
                userPrincipalName: `${props.userName}@${this._AD.config.domain}`,
                sAMAccountName:    props.userName,
                objectClass:       this._AD.config.options!.userObjectClass
            };

            this._AD._addObject(`CN=${props.commonName}`, props.location as string, userObject)
              .then(res => {
                  delete this._AD._cachedItems.users[props.userName];
                  this._AD._cachedItems.all = {};
                  return this.setUserPassword(props.userName, props.pass as string);
              })
              .then(data => {
                  let expirationMethod =
                        props.passwordExpires === false
                          ? this.setUserPasswordNeverExpires
                          : this.enableUser;

                  return expirationMethod.call(this, props.userName);
              })
              .then(data => {
                  let enableMethod = props.enabled === false ? this.disableUser : this.enableUser;

                  return enableMethod.call(this, props.userName);
              })
              .then(data => {
                  return resolve(userObject);
              })
              .catch(err => {
                  /* istanbul ignore next */
                  const ENTRY_EXISTS = err.message.indexOf("ENTRY_EXISTS") > -1;
                  /* istanbul ignore next */
                  if (ENTRY_EXISTS) {
                      /* istanbul ignore next */
                      return reject({
                          message:    `User ${props.userName} already exists.`,
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

    updateUser(userName: string, props: IUpdateUserProps) {
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
                    let value = name === "password" ? encodePassword(props[name] as string) : props[name];
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

    findUser(userName: string, config?: IProcessResultsConfig): Promise<IUserResult> {
        userName = userName || "";

        return new Promise((resolve, reject) => {
            let cached = this._AD._cache.get("users", userName);

            if (cached) {
                return resolve(processResults<IUserResult>(config, [cached])[0]);
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
                    return reject(new UserNotExistError(userName));
                }

                this._AD._cache.set("users", userName, results.users[0]);

                const users = processResults<IUserResult>(config, results.users);

                return resolve(users[0]);
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

    authenticateUser(userName: string, pass: string): Promise<boolean> {
        const domain = this._AD.config.domain;
        let fullUser = `${userName}@${domain}`;

        return new Promise(async (resolve, reject) => {
            this._AD.ad.authenticate(fullUser, pass, (error: any, authenticated) => {
                if (error) {
                    return reject(new InvalidCredentialError(fullUser, error.message, error.lde_message));
                }

                return resolve(authenticated);
            });
        });
    }

    setUserPassword(userName: string, pass: string) {
        return new Promise((resolve, reject) => {
            if (!pass || pass === "") {
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
                  let oldDN = userObject.dn as string;
                  let parts = oldDN.split(",");
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

    moveUser(userName: string, location: string): Promise<{ success: boolean, error?: Error }> {
        return new Promise(async (resolve, reject) => {
            //location = parseLocation(location);
            this.findUser(userName)
              .then((userObject: any) => {
                  let oldDN  = userObject.dn;
                  let baseDN = this._AD.config.baseDN!.replace(/dc=/g, "DC=");
                  let newDN  = [`CN=${userObject.cn}`, location, baseDN].filter(s => !!s && s != "").join(",");
                  return this._AD._modifyDN(oldDN, newDN);
              })
              .then(result => {
                  delete this._AD._cachedItems.users[userName];
                  resolve({ success: true });
              })
              .catch(err => {
                  /* istanbul ignore next */
                  reject(err);
              });
        });
    }

    getUserLocation(userName: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            this.findUser(userName)
              .then((userObject: any) => {
                  if (Object.keys(userObject).length < 1) {
                      /* istanbul ignore next */
                      return reject(new UserNotExistError(userName));
                  }
                  let dn       = userObject.dn;
/*                  let left     = String(dn)
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
                    .replace(/ou=/g, "");*/
                  return resolve(dn);
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
                      return reject(new UserNotExistError(userName));
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

    getUserGroupMembership(userName: string) {
        return new Promise(async (resolve, reject) => {
            this.findUser(userName)
              .then((userObject: any) => {
                  if (Object.keys(userObject).length < 1) {
                      return reject(new UserNotExistError(userName));
                  }

                  this._AD._getUserGroups(userObject.dn)
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
