const libFs = require('fs');
const libPath = require('path');

const CONSTS = require('enumconsts');

const {isWindows} = require('./tools');

function ensurePathSequence(sequence, callback, pathSoFar = '') {
	if (!sequence.length) {
		// We are done
		return callback(null);
	}
	
	const path = libPath.resolve(pathSoFar, sequence.pop());
	
	return libFs.mkdir(path, (err) => {
		if (err && err.code !== CONSTS.ERRNO.EEXIST) {
			return callback(err);
		}
		
		return ensurePathSequence(sequence, callback, path);
	});
}

/**
 * The equivalent of mkdir -p command in *nix.
 * @param {string} path Directory path
 * @param [callback] Optional callback
 * @return {Promise<void>}
 */
function ensureDir(path, callback) {
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

module.exports = ensureDir;