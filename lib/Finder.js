const libFs = require('fs');
const libPath = require('path');
const {EventEmitter} = require('events');

class Finder extends EventEmitter {
	constructor(rootPath, scheduler) {
		super();

		/** @type Scheduler */
		this.scheduler = scheduler;

		this._waitCount = 0;

		this._processPath(rootPath);
	}

	_processPath(path) {
		this._waitCount++;

		this.scheduler.enqueue(cb => {
			libFs.lstat(path, (err, /** fs.Stats */ stats) => {
				this._waitCount--;

				if (err) {
					return cb(err);
				}

				if (stats.isDirectory()) {
					this._processDir(path);
				}
				else if (stats.isFile() || stats.isSymbolicLink()) {
					this.emit(Finder.EVENTS.file, path);
				}

				this._checkIfDone();

				return cb(null);
			});
		});
	}

	_processDir(path) {
		this._waitCount++;

		this.scheduler.enqueue(cb => {
			libFs.readdir(path, (err, items) => {
				this._waitCount--;

				if (err) {
					return cb(err);
				}

				items.forEach(item => {
					const itemPath = libPath.resolve(path, item);
					this._processPath(itemPath);
				});

				this._checkIfDone();

				return cb();
			});
		});
	}

	_checkIfDone() {
		if (this._waitCount === 0) {
			this.emit(Finder.EVENTS.done);
		}
	}
}

Finder.EVENTS = {
	file: 'file',
	done: 'done'
};

module.exports = Finder;