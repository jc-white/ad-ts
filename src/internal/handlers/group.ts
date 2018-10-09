import { FindResult, Opts } from "../../../node_modules/@types/activedirectory2/interfaces";
import { IAddGroupProps, IGroupResult, IProcessResultsConfig } from "../../interfaces";
import ADMain from "../../main";
import processResults = require("../../util/processResults");

/**
 *  Public group functions
 *  --------------------------
 *  getAllGroups(opts)
 *  findGroup(groupName, opts)
 *  addGroup(opts)
 *  addUserToGroup(userName, groupName)
 *  removeUserFromGroup(userName, groupName)
 *  removeGroup(groupName)
 */

export class ADGroupHandler {
    private _AD: ADMain;

    constructor(ADInstance: ADMain) {
        this._AD = ADInstance;
    }

    getAllGroups(config?: IProcessResultsConfig): Promise<IGroupResult[]> {
        return this._AD._findByType(['group'], config);
    }

    findGroup(groupName: string, config?: IProcessResultsConfig): Promise<IGroupResult> {
        groupName = String(groupName || "");

        return new Promise((resolve, reject) => {
            groupName = groupName.indexOf("@") > -1 ? groupName.split("@")[0] : groupName;

            if (groupName.trim() === "") {
                /* istanbul ignore next */
                return reject(`${groupName} is not a valid Group name.`);
            }

            const filter     = `(|(cn=${groupName}))`;
            const opts: Opts = {
                filter:         filter,
                includeDeleted: false
            };

            try {
                this._AD.ad.find(opts, (err: any, results: FindResult) => {
                    if (err) {
                        /* istanbul ignore next */
                        return reject(err);
                    }

                    if (!results || !results.groups || results.groups.length < 1) {
                        return reject(new Error("Group not found: " + groupName));
                    }

                    const groups = processResults<IGroupResult>(config, results.groups);

                    return resolve(groups[0]);
                });
            } catch (e) {
                /* istanbul ignore next */
                return reject(e);
            }
        });
    }

    async groupExists(groupName: string): Promise<boolean> {
        try {
            const groupObject: any = await this.findGroup(groupName);
            return !(!groupObject || !groupObject.dn);
        } catch (e) {
            return false;
        }
    }

    addGroup(props: IAddGroupProps): Promise<IGroupResult> {
        return new Promise((resolve, reject) => {
            this._AD._addObject(`CN=${props.name}`, props.location as string, {
                  cn:             props.name,
                  description:    props.description,
                  objectClass:    "group",
                  sAmAccountName: props.name
              })
              .then(resp => {
                  resolve(resp as IGroupResult);
              })
              .catch(err => {
                  /* istanbul ignore next */
                  reject(Object.assign(err, { error: true }));
              });
        });
    }

    addUserToGroup(userName: string, groupName: string) {
        return new Promise((resolve, reject) => {
            this._AD.userHandler.findUser(userName)
              .then((userObject: any) => {
                  if (Object.keys(userObject).length < 1) {
                      /* istanbul ignore next */
                      return reject({
                          error:   true,
                          message: `User ${userName} does not exist.`
                      });
                  }
                  this._AD.operations._groupAddOperation(groupName, {
                        member: [userObject.dn]
                    })
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

    removeUserFromGroup(userName: string, groupName: string) {
        return new Promise((resolve, reject) => {
            this._AD.userHandler.findUser(userName)
              .then((userObject: any) => {
                  if (Object.keys(userObject).length < 1) {
                      /* istanbul ignore next */
                      return reject({ error: true, message: "User does not exist." });
                  }
                  this._AD.operations._groupDeleteOperation(groupName, {
                        member: [userObject.dn]
                    })
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

    removeGroup(groupName: string, quiet: boolean = false): Promise<{ success: boolean, error?: Error }> {
        return new Promise(async (resolve, reject) => {
            const groupObject: any = await this.findGroup(groupName);

            if (Object.keys(groupObject).length < 1) {
                if (quiet) {
                    return resolve();
                }

                return reject({
                    success: false,
                    message: `Group ${groupName} does not exist.`
                });
            }

            this._AD._deleteObjectByDN(groupObject.dn)
              .then(resp => {
                  resolve({ success: true });
              })
              .catch((err: Error) => {
                  /* istanbul ignore next */
                  reject({ success: false, error: err });
              });
        });
    }

    getGroupMembers(groupName: string) {
        return new Promise(async (resolve, reject) => {
            const groupObject: any = await this.findGroup(groupName);

            if (Object.keys(groupObject).length < 1) {
                return reject({
                    error:   true,
                    message: `Group ${groupName} does not exist.`
                });
            }

            this._AD._getGroupUsers(groupName, {})
              .then(resp => {
                  resolve(resp);
              })
              .catch(err => {
                  /* istanbul ignore next */
                  reject(Object.assign(err, { error: true }));
              });
        });
    }
}
