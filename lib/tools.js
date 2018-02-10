function isWindows() {
	return process.platform === 'win32';
}

class PlatformUnsupportedError extends Error {
	constructor(op) {
		super(`Operation "${op}" is not supported on "${process.platform}"`);
		this.op = op;
		this.platform = process.platform;
	}
}

module.exports = {
	isWindows,
	
	PlatformUnsupportedError
};