import { MembershipType } from "../node_modules/@types/activedirectory2/interfaces";

export interface IADConfig {
    url: string;
    user: string;
    pass: string;
    domain?: string;
    baseDN?: string;
    includeMembership?: MembershipType;
    tlsOptions:        {
        rejectUnauthorized: boolean
    }
}

export type TCachedItemType = "users" | "ous" | "groups" | "all";

export interface IProcessResultsConfig {
    fields?: Array<string>;
    filter?: {
        [key: string]: any
    };
    q?: boolean;
    start?: number;
    end?: number;
    limit?: number;
    page?: number;
    order?: Array<string>;
    sort?: "asc"|"desc";
}

export interface IAddUserProps extends Dictionary<string | boolean> {
    firstName: string;
    lastName: string;
    commonName: string;
    userName: string;
    pass: string;
    email: string;
    title: string;
    phone: string;
    location: string;
    passwordExpires: boolean;
    enabled: boolean;
}

export interface IUpdateUserProps extends Dictionary<string | boolean> {
    firstName: string;
    lastName: string;
    commonName: string;
    userName: string;
    pass: string;
    email: string;
    title: string;
    phone: string;
    objectClass: string;
    passwordExpires: boolean;
}

export interface IAddOUProps extends Dictionary<string> {
    name: string;
    location: string;
    description: string;
}

export interface IAddGroupProps extends Dictionary<string> {
    groupName: string;
    location: string;
    description: string;
}

export interface Dictionary<T> {
    [key: string]: T
}

export interface IAuthenticationError {
    lde_message: string;
}