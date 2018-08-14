import ADMain from "./main";
import { IAddOUProps, IProcessResultsConfig } from "./interfaces";

const api           = require("./util/api");
const parseLocation = require("./util/parseLocation");

/**
 *  Public ou functions
 *  --------------------------
 *  findOU(ouName)
 *  ouExists(ouName)
 *  addOU({!name, location, description})
 *  removeOU(ouName)
 */

export class ADOUHandler {
    _AD: ADMain;

    constructor(_AD: ADMain) {
        this._AD = _AD;
    }

    async getAllOUs(config: IProcessResultsConfig) {
        return new Promise(async (resolve, reject) => {
            const search = `OU=*`;
            this._AD._search(search, {})
              .then(results => {
                  if (!results || !results.other) {
                      /* istanbul ignore next */
                      return resolve([]);
                  }
                  let match = results.other.filter((ou: any) => {
                      return (
                        String(ou.dn).split(",")[0].toLowerCase().indexOf("ou=") > -1
                      );
                  });
                  resolve(api.processResults(config, match));
              })
              .catch(reject);
        });
    }

    async findOU(ouName: string) {
        return new Promise(async (resolve, reject) => {
            const search = `OU=${ouName}`;
            this._AD._search(search, {})
              .then(results => {
                  if (!results || !results.other) {
                      return resolve(undefined);
                  }

                  let match = results.other.filter((ou: any) => {
                      return (
                        String(ou.dn).split(",")[0].toLowerCase() === search.toLowerCase()
                      );
                  });

                  resolve(match[0]);
              })
              .catch(reject);
        });
    }

    async ouExists(ouName: string) {
        return new Promise(async (resolve, reject) => {
            return this.findOU(ouName).then(ou => {
                resolve(ou !== undefined);
            });
        });
    }

    async addOU(props: string | IAddOUProps) {
        let _props: Partial<IAddOUProps> = {};

        if (typeof props === "string") {
            Object.assign(_props, {
                name: props
            });
        } else {
            Object.assign(_props, props);
        }

        let { name, location, description } = _props,
            loc                             = (location && parseLocation(location)) || "";

        return this._AD._addObject(`OU=${name}`, loc, {
            ou:          name,
            description: description,
            objectClass: "organizationalunit"
        });
    }

    async removeOU(ouName: string) {
        return this._AD._deleteObjectBySearch(`OU=${ouName}`);
    }
}
