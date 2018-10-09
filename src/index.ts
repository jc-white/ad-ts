import { OtherInstance } from "./internal/instances/other.instance";
import { OUInstance } from "./internal/instances/ou.instance";
import { UserInstance } from "./internal/instances/user.instance";

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

import { GroupInstance } from "./internal/instances/group.instance";

class AD {
    _AD: ADMain;

    constructor(config: IADConfig) {
        this._AD = new ADMain(config);
    }

    user(this: AD, userName?: undefined): UserInstance
    user(this: AD, userName?: string): UserInstance
    user(this: AD, userName?: any): UserInstance {
        return new UserInstance(this._AD, userName);
    }

    group(this: AD, groupName?: undefined): GroupInstance
    group(this: AD, groupName?: string): GroupInstance
    group(this: AD, groupName?: any): GroupInstance {
        return new GroupInstance(this._AD, groupName);
    }

    ou(this: AD, ouName?: undefined): OUInstance
    ou(this: AD, ouName?: string): OUInstance
    ou(this: AD, ouName?: any): OUInstance {
        return new OUInstance(this._AD, ouName);
    }

    other(this: AD): OtherInstance {
        return new OtherInstance(this._AD);
    }

    find(searchString: string, config?: IProcessResultsConfig) {
        return this._AD._search(searchString, config);
    }

    cache(enabled: boolean) {
        this._AD.cache(enabled);
        return this;
    }

    cacheTimeout(millis: number) {
        this._AD.cacheTimeout(millis);
        return this;
    }
}

export = AD;