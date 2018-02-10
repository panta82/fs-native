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
	
	
	
	const parts = libPath.normalize(path).split(libPath.sep);
	
	const count = parts.length - 1;
	const sequence = Array(count);
	if (isWindows()) {
		sequence[count - 1] = parts[0] + parts[1];
	} else {
		sequence[count - 1] = libPath.sep + parts[1];
	}
	for (let i = 2; i <= count; i++) {
		sequence[count - i] = parts[i];
	}
	
	ensurePathSequence(sequence, (err) => {
		if (err) {
			return callback(err);
		}
		
		return callback(null);
	});
	
	return promise;
}

module.exports = rmDir;