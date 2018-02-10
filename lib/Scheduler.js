const {EventEmitter} = require('events');

class Scheduler extends EventEmitter {
	constructor(parallelism) {
		super();

		this._queue = [];
		this._activeCount = 0;
		this._erroredOut = false;

		this.parallelism = parallelism;
	}

	enqueue(fn) {
		this._queue.unshift(fn);
		this._check();
	}

	isActive() {
		return this._activeCount > 0;
	}

	_check() {
		if (this._activeCount >= this.parallelism || !this._queue.length || this._erroredOut) {
			return;
		}

		const fn = this._queue.pop();
		this._activeCount++;

		fn((err) => {
			if (this._erroredOut) {
				return;
			}

			this._activeCount--;

			if (err) {
				this._erroredOut = true;
				this.emit(Scheduler.EVENTS.error);
			}
			else if (this._activeCount === 0) {
				this.emit(Scheduler.EVENTS.drain);
			}

			this._check();
		});

		this._check();
	}
}

Scheduler.EVENTS = {
	error: 'error',
	drain: 'drain'
};

module.exports = Scheduler;