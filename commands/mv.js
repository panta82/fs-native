const libFs = require('fs');
const libPath = require('path');

const Scheduler = require('../lib/Scheduler');
const Finder = require('../lib/Finder');
const Mapper = require('../lib/Mapper');

function mvMapper(from, to, callback) {
	return libFs.rename(from, to, callback);
}

/**
 * @param {string} from
 * @param {function} toFn
 * @param {MvOptions} opts
 * @param callback
 */
function doMv(from, toFn, opts, callback) {
	let scheduler = new Scheduler(opts.parallelism);
	let mapper = new Mapper(mvMapper, scheduler);
	let finder = new Finder(from, scheduler);

	let calledBack = false;

	scheduler.on(Scheduler.EVENTS.error, doCallback);

	finder.on(Finder.EVENTS.file, (fromPath) => {
		const toPath = toFn(fromPath);
		if (toPath) {
			mapper.map(fromPath, toPath);
		}
	});

	finder.on(Finder.EVENTS.done, () => {
		if (!scheduler.isActive()) {
			// We are done
			return doCallback();
		}

		// Wait for drain
		scheduler.on(Scheduler.EVENTS.drain, () => {
			doCallback();
		});
	});

	function doCallback(err) {
		if (calledBack) {
			return;
		}

		// Help GC a bit
		scheduler = null;
		mover = null;
		finder = null;

		calledBack = true;
		callback(err);
	}
}

/**
 * @param source
 */
function MvOptions(source) {
	/** How many parallel threads of execution to allow */
	this.parallelism = 5;
	
	Object.assign(this, source);
}

/**
 * Moves single file or a directory tree. The equivalent of mv command in *nix.
 * @param {string} from Source directory
 * @param {string|function} to Target directory or mapper function. If mapper returns falsy, we will skip that file
 * @param {MvOptions} [opts] See MvOptions for details
 * @param [callback] Error callback. Leave out if you want to use promises
 * @return {Promise<void>}
 */
function mv(from, to, opts, callback) {
	let promise;
	if (!(typeof opts === 'object')) {
		callback = opts;
		opts = null;
	}

	opts = new MvOptions(opts);

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

	if (!from) {
		return callback(new Error(`Missing required argument "from"`));
	}

	if (!to) {
		return callback(new Error(`Missing required argument "to"`));
	}

	if (typeof to !== 'function') {
		const toValue = to;
		to = fromPath => {
			const toPath = libPath.resolve(toValue, libPath.relative(from, fromPath));
			return toPath;
		};
	}

	doMv(from, to, opts, (err) => {
		if (err) {
			return callback(err);
		}

		return callback(null);
	});

	return promise;
}

mv.Options = MvOptions;

module.exports = mv;
