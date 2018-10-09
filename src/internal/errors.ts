/**
 * Group related errors
 */
export class GroupNameUnspecifiedError extends Error {
    constructor(methodName?: string) {
        super(`${methodName ? `${String(methodName)}` : ''}: Group name must be specified.`);
        Object.setPrototypeOf(this, GroupNameUnspecifiedError.prototype);
    }
}

export class GroupNotInstanceMethodError extends Error {
    constructor(methodName?: string) {
        super(`${methodName ? `${String(methodName)}` : ''}: This method cannot be called when a group name is specified.`);
        Object.setPrototypeOf(this, GroupNotInstanceMethodError.prototype);
    }
}

export class GroupNotExistError extends Error {
    constructor(userName?: string) {
        super(`Group ${userName ? `${String(userName)}` : ''} does not exist.`);

        Object.setPrototypeOf(this, GroupNotExistError.prototype);
    }
}

/**
 * User related errors
 */
export class UsernameUnspecifiedError extends Error {
    constructor(methodName?: string) {
        super(`${methodName ? `${String(methodName)}` : ''}: Username must be specified.`);
        Object.setPrototypeOf(this, UsernameUnspecifiedError.prototype);
    }
}

export class UserNotInstanceMethodError extends Error {
    constructor(methodName?: string) {
        super(`${methodName ? `${String(methodName)}` : ''}: This method cannot be called when a username is specified.`);
        Object.setPrototypeOf(this, UserNotInstanceMethodError.prototype);
    }
}

export class UserNotExistError extends Error {
    constructor(userName?: string) {
        super(`User ${userName ? `${String(userName)}` : ''} does not exist.`);

        Object.setPrototypeOf(this, UserNotExistError.prototype);
    }
}

export class InvalidCredentialError extends Error {
    message: string;
    lde_message?: string;

    constructor(userName: string, message: string, lde_message?: string) {
        super(`Invalid credentials for username ${userName}.`);

        this.message = message;
        this.lde_message = lde_message;

        Object.setPrototypeOf(this, InvalidCredentialError.prototype);
    }
}

/**
 * OU related errors
 */
export class OUNameUnspecifiedError extends Error {
    constructor(methodName?: string) {
        super(`${methodName ? `${String(methodName)}` : ''}: OU name must be specified.`);
        Object.setPrototypeOf(this, OUNameUnspecifiedError.prototype);
    }
}

export class OUNotInstanceMethodError extends Error {
    constructor(methodName?: string) {
        super(`${methodName ? `${String(methodName)}` : ''}: This method cannot be called when an OU name is specified.`);
        Object.setPrototypeOf(this, OUNotInstanceMethodError.prototype);
    }
}