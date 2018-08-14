import { Opts } from "../node_modules/@types/activedirectory2/interfaces";

/**
 *  Exposes library through simple,
 *  chainable functions
 *  --------------------------
 *  ad.user().get(opts);
 *  ad.user().add({!userName, !commonName, !pass});
 *  ad.user(username).get(opts);
 *  ad.user(userName).exists();
 *  ad.user(userName).addToGroup(groupName);
 *  ad.user(userName).removeFromGroup(groupName);
 *  ad.user(userName).isMemberOf(groupName);
 *  ad.user(userName).authenticate(password);
 *  ad.user(userName).password(password);
 *  ad.user(userName).passwordNeverExpires();
 *  ad.user(userName).passwordExpires();
 *  ad.user(userName).enable();
 *  ad.user(userName).disable();
 *  ad.user(userName).move(location);
 *  ad.user(userName).unlock();
 *  ad.user(userName).remove();
 *  ad.user(userName).location();
 *
 *  ad.group().get(opts);
 *  ad.group().add();
 *  ad.group(groupName).get(opts);
 *  ad.group(groupName).exists();
 *  ad.group(groupName).members();
 *  ad.group(groupName).addUser(userName);
 *  ad.group(groupName).removeUser(userName);
 *  ad.group(groupName).remove();
 *
 *  ad.ou().get(opts);
 *  ad.ou().add(opts);
 *  ad.ou(ouName).get();
 *  ad.ou(ouName).exists();
 *  ad.ou(ouName).remove();
 *
 *  ad.other().get(opts);
 *  ad.all().get(opts);
 *  ad.find(searchString);
 */
import ADMain from "./main";
import {
    IADConfig,
    IAddGroupProps,
    IAddOUProps,
    IAddUserProps,
    IProcessResultsConfig,
    IUpdateUserProps
} from "./interfaces";

export class AD {
    _AD: ADMain;

    constructor(config: IADConfig) {
        this._AD = new ADMain(config);
    }

    user(userName: string) {
        if (userName === undefined) {
            return {
                get: (config: IProcessResultsConfig) => {
                    return this._AD.userHandler.getAllUsers(config);
                },
                add: (props: IAddUserProps) => {
                    return this._AD.userHandler.addUser(props);
                }
            };
        }

        return {
            get:                  (config: IProcessResultsConfig) => {
                return this._AD.userHandler.findUser(userName, config);
            },
            update:               (props: IUpdateUserProps) => {
                return this._AD.userHandler.updateUser(userName, props);
            },
            exists:               () => {
                return this._AD.userHandler.userExists(userName);
            },
            addToGroup:           (groupName: string) => {
                return this._AD.groupHandler.addUserToGroup(userName, groupName);
            },
            removeFromGroup:      (groupName: string) => {
                return this._AD.groupHandler.removeUserFromGroup(userName, groupName);
            },
            isMemberOf:           (groupName: string) => {
                return this._AD.userHandler.userIsMemberOf(userName, groupName);
            },
            authenticate:         (pass: string) => {
                return this._AD.userHandler.authenticateUser(userName, pass);
            },
            password:             (pass: string) => {
                return this._AD.userHandler.setUserPassword(userName, pass);
            },
            passwordNeverExpires: () => {
                return this._AD.userHandler.setUserPasswordNeverExpires(userName);
            },
            passwordExpires:      () => {
                return this._AD.userHandler.enableUser(userName);
            },
            enable:               () => {
                return this._AD.userHandler.enableUser(userName);
            },
            disable:              () => {
                return this._AD.userHandler.disableUser(userName);
            },
            move:                 (location: string) => {
                return this._AD.userHandler.moveUser(userName, location);
            },
            location:             () => {
                return this._AD.userHandler.getUserLocation(userName);
            },
            unlock:               () => {
                return this._AD.userHandler.unlockUser(userName);
            },
            remove:               () => {
                return this._AD.userHandler.removeUser(userName);
            },
            getGroupMembership:   (opts: Opts) => {
                return this._AD.userHandler.getUserGroupMembership(userName, opts);
            }
        };
    }

    group(groupName: string) {
        if (groupName === undefined) {
            return {
                get: (config: IProcessResultsConfig) => {
                    return this._AD.groupHandler.getAllGroups(config);
                },
                add: (props: IAddGroupProps) => {
                    return this._AD.groupHandler.addGroup(props);
                }
            };
        }

        return {
            get:        (config: IProcessResultsConfig) => {
                return this._AD.groupHandler.findGroup(groupName, config);
            },
            exists:     () => {
                return this._AD.groupHandler.groupExists(groupName);
            },
            members:    () => {
                return this._AD.groupHandler.getGroupMembers(groupName);
            },
            addUser:    (userName: string) => {
                return this._AD.groupHandler.addUserToGroup(userName, groupName);
            },
            removeUser: (userName: string) => {
                return this._AD.groupHandler.removeUserFromGroup(userName, groupName);
            },
            remove:     () => {
                return this._AD.groupHandler.removeGroup(groupName);
            }
        };
    }

    ou(ouName: string) {
        if (ouName === undefined) {
            return {
                get: (config: IProcessResultsConfig) => {
                    return this._AD.OUHandler.getAllOUs(config);
                },
                add: (props: IAddOUProps) => {
                    return this._AD.OUHandler.addOU(props);
                }
            };
        }

        return {
            get:    () => {
                return this._AD.OUHandler.findOU(ouName);
            },
            exists: () => {
                return this._AD.OUHandler.ouExists(ouName);
            },
            remove: () => {
                return this._AD.OUHandler.removeOU(ouName);
            }
        };
    }

    other() {
        return {
            get: (config: IProcessResultsConfig) => {
                return this._AD.othersHandler.getAllOthers(config);
            }
        };
    }

    all() {
        return {
            get: (config: IProcessResultsConfig) => {
                return this._AD.othersHandler.getAll(config);
            }
        };
    }

    find(searchString: string, config: IProcessResultsConfig) {
        return this._AD._search(searchString, config);
    }
}
