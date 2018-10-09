import ActiveDirectory from "activedirectory2";
import { Filter } from "ldapjs";
import * as ldap from "ldapjs";
import { ADGroupHandler } from "./internal/handlers/group";
import { Dictionary, IADConfig, IProcessResultsConfig, TCachedItemType } from "./interfaces";
import { isEmptyObj } from "./internal/helpers";
import { ADOUHandler } from "./internal/handlers/ou";
import { ADUserHandler } from "./internal/handlers/user";
import { FindResult, MembershipType, Opts } from "activedirectory2/interfaces";
import ADOperations from "./internal/operations";

import defaults = require("lodash.defaults");
import compact = require("lodash.compact");
import processResults = require("./util/processResults");

export default class ADMain {
    ad: ActiveDirectory;
    config: IADConfig;
    _cache: {
        enabled: boolean,
        expiration: number,

        get: Function,
        set: Function
    };
    _cachedItems: {
        users: Dictionary<any>,
        groups: Dictionary<any>,
        ous: Dictionary<any>,
        all: Dictionary<any>,
    } = {
        users:  {},
        groups: {},
        ous:    {},
        all:    {}
    };

    groupHandler: ADGroupHandler;
    userHandler: ADUserHandler;
    OUHandler: ADOUHandler;

    operations: ADOperations;

    constructor(config: IADConfig) {
        if (config === undefined) {
            throw new Error("Configuration is required.");
        }

        let invalid = !config.url || !config.user || !config.pass;

        if (invalid) {
            throw new Error(
              "The following configuration is required: {url, user, pass}."
            );
        }

        if (config.url.indexOf("://") === -1) {
            throw new Error(
              "You must specify the protocol in the url, such as ldaps://127.0.0.1."
            );
        }

        if (config.user.indexOf("@") === -1) {
            throw new Error(
              "The user must include the fully qualified domain name, such as joe@acme.co."
            );
        }

        config.domain = config.domain || config.user.split("@")[1];

        if (config.baseDN === undefined) {
            config.baseDN = config.domain
              .split(".")
              .map(n => `DC=${n}`)
              .join(",");
        }

        config.options = defaults({
            userObjectClass: ["organizationalPerson", "person", "top", "user"]
        });

        this.config = config;

        this._cache = {
            enabled:    true,
            expiration: 600000,
            get:        (type: TCachedItemType, key: string) => {
                if (!this._cache.enabled) {
                    return undefined;
                }

                if (!this._cachedItems[type] || !this._cachedItems[type][key]) {
                    return undefined;
                }

                let obj  = this._cachedItems[type][key],
                    diff = (new Date().getTime()) - obj.timestamp;


                if (diff > this._cache.expiration) {
                    delete this._cachedItems[type][key];
                    return undefined;
                }

                return obj.value;
            },
            set:        (type: TCachedItemType, key: string, value: any) => {
                this._cachedItems[type][key] = {
                    timestamp: new Date(),
                    value
                };
            }
        };

        const adConfig = {
            username:   this.config.user,
            password:   this.config.pass,
            url:        this.config.url,
            baseDN:     this.config.baseDN || "",
            tlsOptions: defaults({
                rejectUnauthorized: false
            })
        };

        this.ad = new ActiveDirectory(adConfig);

        this.userHandler   = new ADUserHandler(this);
        this.groupHandler  = new ADGroupHandler(this);
        this.OUHandler     = new ADOUHandler(this);

        this.operations = new ADOperations(this);
    }

    cache(bool: boolean) {
        this._cache.enabled = bool;
        return this;
    }

    cacheTimeout(millis: number) {
        this._cache.expiration = millis;
        return this;
    }

    _getBoundClient(): Promise<[Error, ldap.Client]> {
        return new Promise((resolve, reject) => {
            const client = ldap.createClient({
                url:        this.config.url,
                tlsOptions: {
                    rejectUnauthorized: false
                }
            });

            client.bind(this.config.user, this.config.pass, function(err, data) {
                resolve([err, client]);
            });
        });
    }

    _findByType(membership: MembershipType[], config?: undefined): Promise<FindResult>
    _findByType(membership: MembershipType[], config?: IProcessResultsConfig, ): Promise<Array<any>>
    _findByType(membership: MembershipType[], config?: any) {
        let cacheKey = JSON.stringify(membership);
        return new Promise((resolve, reject) => {
            let cached = this._cache.get("all", cacheKey);

            if (cached) {
                return resolve(processResults(config, cached));
            }

            const opts: Opts = {
                filter:            `CN=*`,
                includeMembership: membership,
                includeDeleted:    false
            };

            this.ad.find(opts, (err, results) => {
                if (err) {
                    /* istanbul ignore next */
                    return reject(err);
                }

                if (!results || isEmptyObj(results)) {
                    /* istanbul ignore next */
                    return resolve([]);
                }

                if (membership.indexOf("all") > -1) {
                    this._cache.set("all", cacheKey, results);
                    return resolve(processResults<any>(config, results));
                } else {
                    let compiled: Array<any> = [];

                    if (membership.indexOf("user") > -1) {
                        compiled = compiled.concat(results.users);
                    }

                    if (membership.indexOf("group") > -1) {
                        compiled = compiled.concat(results.groups);
                    }

                    if (membership.indexOf("other") > -1) {
                        compiled = compiled.concat(results.other);
                    }

                    this._cache.set("all", cacheKey, compiled);
                    resolve(processResults(config, compiled));
                }
            });
        });
    }

    _search(filter: string | Filter, config?: undefined): Promise<FindResult>
    _search(filter: string | Filter, config?: IProcessResultsConfig): Promise<Dictionary<any>>
    _search(filter: string | Filter, config?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const opts: Opts = {
                filter:         filter,
                includeDeleted: false
            };

            try {
                this.ad.find(opts, (err, results) => {
                    let processed: Dictionary<any> = {};

                    if (err) {
                        /* istanbul ignore next */
                        return reject(err);
                    }

                    if (!results) {
                        return resolve(results);
                    }

                    if (config) {
                        let combined: Array<any> = [];
                        for (const key in results) {
                            if (Array.isArray(results[key])) {
                                combined = combined.concat(results[key]);
                            }
                        }

                        processed = processResults(config, combined);
                        resolve(processed);
                    } else {
                        resolve(results);
                    }
                });
            } catch (e) {
                /* istanbul ignore next */
                return reject({ message: e.message, type: e.type, stack: e.stack });
            }
        });
    }

    _getGroupUsers(groupName: string, opts: Opts): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            this.ad.getUsersForGroup(opts, groupName, (err, users) => {
                if (err) {
                    /* istanbul ignore next */
                    return reject({ message: err.message });
                }

                if (!users) {
                    /* istanbul ignore next */
                    return reject({ message: `Group ${groupName} does not exist.` });
                }

                return resolve(users);
            });
        });
    }

    _getUserGroups(userName: string, opts: Opts = {}): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            this.ad.getGroupMembershipForUser(opts, userName, (err, groups) => {
                if (err) {
                    /* istanbul ignore next */
                    return reject({ message: err.message });
                }

                return resolve(groups);
            });
        });
    }

    _addObject(name: string, location: string, object: Dictionary<any>): Promise<Dictionary<any>> {
        return new Promise(async (resolve, reject) => {
            let baseDN = this.config.baseDN!.replace(/dc=/g, "DC="),
                fullDN = compact([name, location, baseDN]).join(",");

            const [error, client] = await this._getBoundClient();

            if (error) {
                /* istanbul ignore next */
                return reject(error);
            }

            for (const key in object) {
                if (object[key] === undefined) {
                    delete object[key];
                }
            }

            client.add(fullDN, object, (err: Error) => {
                if (err) {
                    /* istanbul ignore next */
                    return reject(err);
                }
                delete object.userPassword;

                return resolve(object);
            });
        });
    }

    _deleteObjectBySearch(searchString: string): Promise<{ success: boolean, error?: Error }> {
        // todo
        return new Promise((resolve, reject) => {
            this._search(searchString, { fields: ["dn"] })
              .then(results => {
                  if (results.length < 1) {
                      /* istanbul ignore next */
                      return reject({
                          message: `Object ${searchString} does not exist.`
                      });
                  }

                  if (results.length > 1) {
                      /* istanbul ignore next */
                      return reject({ message: `More than 1 Object was returned.` });
                  }

                  this._deleteObjectByDN(results[0].dn)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(reject);
              })
              .catch(reject);
        });
    }

    _deleteObjectByDN(dn: string): Promise<{ success: boolean, error?: Error }> {
        return new Promise(async (resolve, reject) => {
            const [error, client] = await this._getBoundClient();

            if (error) {
                /* istanbul ignore next */
                return reject(error);
            }

            client.del(dn, (err) => {
                if (err) {
                    /* istanbul ignore next */
                    return reject(err);
                }

                return resolve({ success: true });
            });
        });
    }

    _modifyDN(oldDN: string, newDN: string) {
        return new Promise(async (resolve, reject) => {
            const [error, client] = await this._getBoundClient();
            if (error) {
                /* istanbul ignore next */
                return reject(error);
            }

            try {
                client.modifyDN(oldDN, newDN, err => {
                    if (err) {
                        /* istanbul ignore next */
                        return reject({ message: err.message });
                    }
                    return resolve({ success: true });
                });
            } catch (e) {
                return reject({ message: e.message });
            }
        });
    }
}