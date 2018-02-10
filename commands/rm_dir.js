const exec = require('child_process').exec;
const libPath = require('path');

const CONSTS = require('enumconsts');

const {isWindows, PlatformUnsupportedError} = require('../lib/tools');

/**
 * Removes directory and all its content. Equivalent of rm -r on *nix. Uses a native OS call.
 * @param {string} path Directory or file path
 * @param [callback] Optional callback
 * @return {Promise<void>}
 */
function rmDir(path, callback) {
	let promise;
	if (callback === undefined) {
		promise = new Promise((resolve, reject) => {
			callback = (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			}
		});
	}
	
	if (isWindows()) {
		return callback(new PlatformUnsupportedError('rmDir'));
	}
	
	// TODO
	
	return promise;
}

module.exports = rmDir;