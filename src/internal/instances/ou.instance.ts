import { IAddOUProps, IOUResult, IProcessResultsConfig } from "../../interfaces";
import ADMain from "../../main";
import { OUNameUnspecifiedError, OUNotInstanceMethodError } from "../errors";

export class OUInstance {
    ouName: string;
    _AD: ADMain;

    constructor(_AD: ADMain, ouName: string = "") {
        this._AD = _AD;
        this.ouName = ouName;
    }

    /**
     * OU Unspecified Methods
     */
    add(props: IAddOUProps) {
        if (this.ouName != '') throw new OUNotInstanceMethodError('OU().add()');

        return this._AD.OUHandler.addOU(props);
    }

    find(ouName: string) {
        if (this.ouName != '') throw new OUNotInstanceMethodError('OU().find()');

        return this._AD.OUHandler.findOU(ouName);
    }

    getAll(config?: IProcessResultsConfig) {
        if (this.ouName != '') throw new OUNotInstanceMethodError('OU().getAll()');

        return this._AD.OUHandler.getAllOUs(config);
    }

    /**
     * OU Instance Methods
     */
    get(): Promise<IOUResult> {
        if (this.ouName === '') throw new OUNameUnspecifiedError('ou().get()');

        return this._AD.OUHandler.findOU(this.ouName);
    }

    exists() {
        if (this.ouName === '') throw new OUNameUnspecifiedError('ou().exists()');

        return this._AD.OUHandler.ouExists(this.ouName);
    }

    remove() {
        if (this.ouName === '') throw new OUNameUnspecifiedError('ou().remove()');

        return this._AD.OUHandler.removeOU(this.ouName);
    }
}