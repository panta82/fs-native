const libFs = require('fs');
const libPath = require('path');

const CONSTS = require('enumconsts');

class Mover {
	constructor(scheduler) {
		/** @type Scheduler */
		this.scheduler = scheduler;

		this._dirs = {};
	}

	move(from, to) {
		this._ensureDir(to);
		this.scheduler.enqueue(cb => {
			libFs.rename(from, to, (err) => {
				cb(err);
			});
		});
	}

	_ensureDir(filePath) {
		const dir = libPath.dirname(filePath);
		if (dir in this._dirs) {
			// We are good
			return;
		}

		this._dirs[dir] = true;

		this.scheduler.enqueue((cb) => {
			libFs.mkdir(dir, (err) => {
				if (err && err.code !== CONSTS.ERRNO.EEXIST) {
					cb(err);
				} else {
					cb(null);
				}
			});
		});
	}
}

module.exports = Mover;