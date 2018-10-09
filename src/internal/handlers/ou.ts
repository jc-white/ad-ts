import ADMain from "../../main";
import { IAddOUProps, IOUResult, IProcessResultsConfig } from "../../interfaces";
import processResults = require("../../util/processResults");

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

    getAllOUs(config?: IProcessResultsConfig): Promise<IOUResult[]> {
        return new Promise((resolve, reject) => {
            const search = `OU=*`;
            this._AD._search(search, {})
              .then(results => {
                  if (!Array.isArray(results) || !results.length) {
                      /* istanbul ignore next */
                      return resolve([]);
                  }
                  let match = results.filter((ou: any) => {
                      return (
                        String(ou.dn).split(",")[0].toLowerCase().indexOf("ou=") > -1
                      );
                  });

                  resolve(processResults<IOUResult>(config, match));
              })
              .catch(reject);
        });
    }

    findOU(ouName: string): Promise<IOUResult> {
        return new Promise((resolve, reject) => {
            const search = `OU=${ouName}`;
            this._AD._search(search, {})
              .then(results => {
                  if (!Array.isArray(results) || !results.length) {
                      /* istanbul ignore next */
                      return resolve(undefined);
                  }

                  let match = results.filter((ou: any) => {
                      return (
                        String(ou.dn).split(",")[0].toLowerCase() === search.toLowerCase()
                      );
                  });

                  resolve(match[0]);
              })
              .catch(reject);
        });
    }

    ouExists(ouName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            return this.findOU(ouName).then(ou => {
                resolve(ou !== undefined);
            });
        });
    }

    addOU(props: string | IAddOUProps) {
        let _props: Partial<IAddOUProps> = {};

        if (typeof props === "string") {
            Object.assign(_props, {
                name: props
            });
        } else {
            Object.assign(_props, props);
        }

        let { name, location, description } = _props,
            loc                             = location || "";

        return this._AD._addObject(`OU=${name}`, loc, {
            ou:          name,
            description: description,
            objectClass: "organizationalunit"
        });
    }

    removeOU(ouName: string): Promise<{ success: boolean, error?: Error }> {
        return this._AD._deleteObjectBySearch(`OU=${ouName}`);
    }
}
