const libFs = require('fs');
const libPath = require('path');

const ensureDir = require('../commands/ensure_dir');

/**
 * This class will map from file path to file path using the provided mapFn function (eg. move or copy).
 * It will ensure target directory is ready before mapFn is called.
 */
class Mapper {
	constructor(mapFn, scheduler) {
		/** @type Scheduler */
		this.scheduler = scheduler;
		
		this.mapFn = mapFn;
		
		/**
		 * @type {Object.<string, {ensured, pending}>}
		 * @private
		 */
		this._dirs = {};
	}

	map(from, to) {
		const dir = libPath.dirname(to);
		
		if (this._dirs[dir]) {
			if (this._dirs[dir].ensured) {
				return this._doMap(from, to);
			}
			
			this._dirs[dir].pending.push([from, to]);
			return;
		}
		
		this._dirs[dir] = {
			ensured: false,
			pending: [[from, to]]
		};
		
		return this.scheduler.enqueue(cb => {
			ensureDir(dir, (err) => {
				if (err) {
					return cb(err);
				}
				
				this._dirs[dir].ensured = true;
				this._dirs[dir].pending.forEach(([from, to]) => {
					this._doMap(from, to);
				});
				this._dirs[dir].pending = [];
				
				cb();
			});
		});
	}
	
	_doMap(from, to) {
		return this.scheduler.enqueue(cb => {
			this.mapFn(from, to, (err) => {
				cb(err || null);
			});
		});
	}
}

module.exports = Mapper;