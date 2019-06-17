import { IAddGroupProps, IGroupResult, IProcessResultsConfig } from "../../interfaces";
import ADMain from "../../main";
import { GroupNameUnspecifiedError, GroupNotInstanceMethodError } from "../errors";

export class GroupInstance {
    groupName: string;
    _AD: ADMain;

    constructor(_AD: ADMain, groupName: string = "") {
        this._AD       = _AD;
        this.groupName = groupName;
    }

    /**
     * Group unspecified methods
     */

    getAll(config?: IProcessResultsConfig) {
        if (this.groupName != '') throw new GroupNotInstanceMethodError('group().getAll()');

        return this._AD.groupHandler.getAllGroups(config);
    }

    add(props: IAddGroupProps) {
        if (this.groupName != '') throw new GroupNotInstanceMethodError('group().add()');

        return this._AD.groupHandler.addGroup(props);
    }

    /**
     * Group instance methods
     */

    get(config?: IProcessResultsConfig): Promise<IGroupResult> {
        if (this.groupName === '') throw new GroupNameUnspecifiedError('group().get()');

        return this._AD.groupHandler.findGroup(this.groupName, config);
    }

    exists(): Promise<boolean> {
        if (this.groupName === '') throw new GroupNameUnspecifiedError('group().exists()');

        return this._AD.groupHandler.groupExists(this.groupName);
    }

    members(): Promise<Array<any>> {
        if (this.groupName === '') throw new GroupNameUnspecifiedError('group().members()');

        return this._AD.groupHandler.getGroupMembers(this.groupName);
    }

    addUser(userName: string) {
        if (this.groupName === '') throw new GroupNameUnspecifiedError('group().addUser()');

        return this._AD.groupHandler.addUserToGroup(userName, this.groupName);
    }

    removeUser(userName: string) {
        if (this.groupName === '') throw new GroupNameUnspecifiedError('group().removeUser()');

        return this._AD.groupHandler.removeUserFromGroup(userName, this.groupName);
    }

    remove(quiet: boolean = false) {
        if (this.groupName === '') throw new GroupNameUnspecifiedError('group().remove()');

        return this._AD.groupHandler.removeGroup(this.groupName, quiet);
    }
}