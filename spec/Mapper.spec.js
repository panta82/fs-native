const expect = require('chai').expect;

const libPath = require('path');
const libFs = require('fs');
const res = libPath.resolve;

const Mapper = require('../lib/Mapper');
const {ROOT, SIMPLE, TREE, prepareRoot, SchedulerMock} = require('./common');

beforeEach(prepareRoot);

describe('Mapper', () => {
	it('can map multiple files, while ensuring directories smartly', async () => {
		const scheduler = new SchedulerMock();
		
		const output = [];
		const mapFn = (from, to, cb) => {
			output.push([from, to]);
			setImmediate(cb);
		};
		
		const mapper = new Mapper(mapFn, scheduler);
		const destPath = res(ROOT, './dest/a/b/c');
		
		const input = [
			[res(SIMPLE, './file1.dat'), res(destPath, './file1.dat')],
			[res(SIMPLE, './file2.dat'), res(destPath, './file2.dat')],
		];
		
		mapper.map(...input[0]);
		mapper.map(...input[1]);
		
		while (output.length < 2) {
			await scheduler.execNext();
		}
		
		expect(output).to.eql(input);
		expect(libFs.existsSync(destPath)).to.be.true;
	});
});