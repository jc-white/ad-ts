import { IAddUserProps, IProcessResultsConfig, IUpdateUserProps } from "../../interfaces";
import ADMain from "../../main";
import { UsernameUnspecifiedError, UserNotInstanceMethodError } from "../errors";

export class UserInstance {
    userName: string;
    _AD: ADMain;

    constructor(_AD: ADMain, userName: string = "") {
        this._AD      = _AD;
        this.userName = userName;
    }

    /**
     * User unspecified methods
     */

    getAll(config?: IProcessResultsConfig) {
        if (this.userName !== '') throw new UserNotInstanceMethodError('user().getAll()');

        return this._AD.userHandler.getAllUsers(config);
    }

    add(props: IAddUserProps) {
        if (this.userName !== '') throw new UserNotInstanceMethodError('user().add()');

        return this._AD.userHandler.addUser(props);
    }

    /**
     * User instance methods
     */

    get(config?: IProcessResultsConfig) {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().get()');

        return this._AD.userHandler.findUser(this.userName, config);
    }

    update(props: IUpdateUserProps) {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().update()');

        return this._AD.userHandler.updateUser(this.userName, props);
    }

    exists() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().exists()');

        return this._AD.userHandler.userExists(this.userName);
    }

    addToGroup(groupName: string) {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().addToGroup()');

        return this._AD.groupHandler.addUserToGroup(this.userName, groupName);
    }

    removeFromGroup(groupName: string) {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().removeFromGroup()');

        return this._AD.groupHandler.removeUserFromGroup(this.userName, groupName);
    }

    getGroupMembership() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().getGroupMembership()');

        return this._AD.userHandler.getUserGroupMembership(this.userName);
    }

    isMemberOf(groupName: string) {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().isMemberOf()');

        return this._AD.userHandler.userIsMemberOf(this.userName, groupName);
    }

    authenticate(pass: string) {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().authenticate()');

        return this._AD.userHandler.authenticateUser(this.userName, pass);
    }

    setPassword(pass: string) {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().password()');

        return this._AD.userHandler.setUserPassword(this.userName, pass);
    }

    passwordNeverExpires() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().passwordNeverExpires()');

        return this._AD.userHandler.setUserPasswordNeverExpires(this.userName);
    }

    passwordExpires() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().passwordExpires()');

        return this._AD.userHandler.enableUser(this.userName);
    }

    enable() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().enable()');

        return this._AD.userHandler.enableUser(this.userName);
    }

    disable() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().disable()');

        return this._AD.userHandler.disableUser(this.userName);
    }

    move(location: string) {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().move()');

        return this._AD.userHandler.moveUser(this.userName, location);
    }

    getLocation() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().location()');

        return this._AD.userHandler.getUserLocation(this.userName);
    }

    unlock() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().unlock()');

        return this._AD.userHandler.unlockUser(this.userName);
    }

    remove() {
        if (this.userName === '') throw new UsernameUnspecifiedError('user().remove()');

        return this._AD.userHandler.removeUser(this.userName);
    }
}