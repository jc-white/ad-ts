import { IProcessResultsConfig } from "../../interfaces";
import ADMain from "../../main";

export class OtherInstance {
    _AD: ADMain;

    constructor(_AD: ADMain) {
        this._AD = _AD;
    }

    get(config?: IProcessResultsConfig) {
        return this._AD._findByType(['other'], config);
    }

    getAll() {
        return this._AD._findByType(['all']);
    }
}