const libPath = require('path');
const exec = require('child_process').exec;

const MASTER_PATH = libPath.resolve(__dirname, './master');
const ROOT_PATH = libPath.resolve(__dirname, './root');

function prepareRoot() {
	return new Promise((resolve, reject) => {
		exec(`rm -rf '${ROOT_PATH}' && cp -r '${MASTER_PATH}' ${ROOT_PATH}`, (err, stdout, stderr) => {
			if (!err && stderr) {
				err = new Error(`Error output: ${stderr}`);
			}
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

class SchedulerMock {
	constructor() {
		this.queue = [];
	}
	
	enqueue(fn) {
		this.queue.unshift(fn);
	}
	
	async execNext() {
		const fn = this.queue.pop() || ((cb) => setInterval(cb, 15));
		
		return new Promise((resolve, reject) => {
			fn((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}

module.exports = {
	ROOT: ROOT_PATH,
	SIMPLE: libPath.resolve(ROOT_PATH, 'simple'),
	TREE: libPath.resolve(ROOT_PATH, 'tree'),
	
	prepareRoot,
	
	SchedulerMock,
};