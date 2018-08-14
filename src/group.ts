import { FindResult, Opts } from "../node_modules/@types/activedirectory2/interfaces";
import { IAddGroupProps, IProcessResultsConfig } from "./interfaces";
import ADMain from "./main";
import { parseLocation } from "./util/parseLocation";
import * as api from "./util/api";

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

    getAllGroups(config: IProcessResultsConfig) {
        return this._AD._findByType(config, ["group"]);
    }

    findGroup(groupName: string, config?: IProcessResultsConfig): Promise<object> {
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
                this._AD.ad.find(opts, (err: Error, results: FindResult) => {
                    if (err) {
                        /* istanbul ignore next */
                        return reject(err);
                    }
                    if (!results || !results.groups || results.groups.length < 1) {
                        return resolve({});
                    }
                    const groups = api.processResults(config, results.groups);
                    return resolve(groups[0]);
                });
            } catch (e) {
                /* istanbul ignore next */
                return reject(e);
            }
        });
    }

    async groupExists(groupName: string) {
        const groupObject: any = await this.findGroup(groupName);

        return !(!groupObject || !groupObject.dn);
    }

    async addGroup(props: IAddGroupProps) {
        let { groupName, location, description } = props,
            loc                                  = (location && parseLocation(location)) || "";

        return this._AD._addObject(`CN=${groupName}`, loc, {
            cn:             groupName,
            description:    description,
            objectClass:    "group",
            sAmAccountName: groupName
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

    removeGroup(groupName: string) {
        return new Promise(async (resolve, reject) => {
            const groupObject: any = await this.findGroup(groupName);

            if (Object.keys(groupObject).length < 1) {
                return reject({
                    error:   true,
                    message: `Group ${groupName} does not exist.`
                });
            }

            return this._AD._deleteObjectByDN(groupObject.dn);
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
            return this._AD._getGroupUsers(groupName, {});
        });
    }
}
