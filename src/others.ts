/**
 *  Public functions on misc ad actions
 *  --------------------------
 *  getAllOthers(opts)
 *  getAll(opts)
 */
import ADMain from "./main";
import { IProcessResultsConfig } from "./interfaces";

export class ADOthersHandler {
    _AD: ADMain;

    constructor(_AD: ADMain) {
        this._AD = _AD;
    }

    getAllOthers(config: IProcessResultsConfig) {
        return this._AD._findByType(config, ["other"]);
    }

    getAll(config: IProcessResultsConfig) {
        return this._AD._findByType(config, ["all"]);
    }
}
