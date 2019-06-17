export function encodePassword(password: string) {
    return new Buffer('"' + password + '"', 'utf16le').toString();
}
