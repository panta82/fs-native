const libPath = require('path');

const MvNativeOptions = require('./options');
const Scheduler = require('./Scheduler');
const Finder = require('./Finder');
const Mover = require('./Mover');

/**
 * @param {string} from
 * @param {function} toFn
 * @param {MvNativeOptions} opts
 * @param callback
 */
function doMv(from, toFn, opts, callback) {
	let scheduler = new Scheduler(opts.parallelism);
	let mover = new Mover(scheduler);
	let finder = new Finder(from, scheduler);

	let calledBack = false;

	scheduler.on(Scheduler.EVENTS.error, doCallback);

	finder.on(Finder.EVENTS.file, (fromPath) => {
		const toPath = toFn(fromPath);
		if (toPath) {
			mover.move(fromPath, toPath);
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
 * The equivalent of mv command in *nix.
 * @param {string} from Source directory
 * @param {string|function} to Target directory or mapper function. If mapper returns falsy, we will skip that file
 * @param {MvNativeOptions} [opts] See MvNativeOptions for details
 * @param [callback] Error callback. Leave out if you want to use promises
 * @return {Promise<void>}
 */
function mvNative(from, to, opts, callback) {
	let promise;
	if (!(opts instanceof 'object')) {
		callback = opts;
		opts = null;
	}

	opts = new MvNativeOptions(opts);

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
		to = fromPath => {
			const toPath =  libPath.resolve(to, libPath.relative(from, fromPath));
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

module.exports = mvNative;

module.exports.mv = mvNative;
module.exports.Options = MvNativeOptions;
