/*export function encodePassword(password: string) {
	let newPassword = '';
	password = "\"" + password + "\"";

	for (let i = 0; i < password.length; i++) {
	    newPassword += String.fromCharCode( password.charCodeAt(i) & 0xFF,(password.charCodeAt(i) >>> 8) & 0xFF);
	}

	return newPassword;
}*/

export function encodePassword(password: string) {
    return new Buffer('"' + password + '"', 'utf16le').toString();
}