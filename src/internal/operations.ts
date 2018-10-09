import { Client } from "ldapjs";
import ADMain from "../main";
import { UserNotExistError } from "./errors";

const ldap = require("ldapjs");

/**
 *  Private operations functions
 *  --------------------------
 *  _operation(objectString, operation)
 *  _operationByUser(user, operation)
 *  _operationByGroup(group, operation)
 *  _groupAddOperation(groupName, modification)
 *  _groupDeleteOperation(groupName, modification)
 *  _userReplaceOperation(user, modification)
 */

export class Operations {
    _AD: ADMain;

    constructor(_AD: ADMain) {
        this._AD = _AD;
    }

    _operation(objectString: string, operation: any) {
        return new Promise(async (resolve: (result: any) => any, reject) => {
            const [error, client]: [Error, Client] = await this._AD._getBoundClient();
            if (error) {
                /* istanbul ignore next */
                return reject(error);
            }
            operation        = Array.isArray(operation) ? operation : [operation];
            const operations = operation.map((op: any) => new ldap.Change(op));
            client.modify(objectString, operations, (error3: Error) => {
                if (error3) {
                    /* istanbul ignore next */
                    return reject(error3);
                }
                return resolve({ success: true });
            });
        });
    }

    _operationByUser(userName: string, operation: any): Promise<{ success: boolean }> {
        return new Promise(async (resolve, reject) => {
            const domain = this._AD.config.domain;
            userName     = `${userName}@${domain}`;

            this._AD.userHandler.findUser(userName)
              .then((userObject: any) => {
                  if (!userObject || !userObject.dn) {
                      /* istanbul ignore next */
                      return reject(new UserNotExistError(userName));
                  }

                  return this._operation(userObject.dn, operation);
              })
              .then(data => {
                  delete this._AD._cachedItems.users[userName];
                  resolve({ success: true });
              })
              .catch(error => {
                  /* istanbul ignore next */
                  reject(error);
              });
        });
    }

    _operationByGroup(groupName: string, operation: any) {
        return new Promise(async (resolve, reject) => {
            this._AD.groupHandler.findGroup(groupName)
              .then((groupObject: any) => {
                  if (!groupObject || Object.keys(groupObject).length < 1) {
                      /* istanbul ignore next */
                      return reject({ message: `Group ${groupName} does not exist.` });
                  }

                  return this._operation(groupObject.dn, operation);
              })
              .then(data => {
                  resolve(data);
              })
              .catch(reject);
        });
    }

    _groupAddOperation(groupName: string, modification: any) {
        return this._operationByGroup(groupName, {
            operation: "add",
            modification
        });
    }

    _groupDeleteOperation(groupName: string, modification: any) {
        return this._operationByGroup(groupName, {
            operation: "delete",
            modification
        });
    }

    _userReplaceOperation(userName: string, modification: any) {
        return this._operationByUser(userName, {
            operation: "replace",
            modification
        });
    }
}

export default Operations;