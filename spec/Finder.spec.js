const expect = require('chai').expect;

const libPath = require('path');

const Finder = require('../lib/Finder');
const {SIMPLE, TREE, prepareRoot, SchedulerMock} = require('./common');

beforeEach(prepareRoot);

describe('Finder', () => {
	it('can find files shallowly', async () => {
		const scheduler = new SchedulerMock();
		
		const finder = new Finder(SIMPLE, scheduler);
		
		const files = [];
		let done = false;
		finder.on('file', (file) => files.push(file));
		finder.on('done', () => done = true);
		
		expect(scheduler.queue.length).to.equal(1);
		await scheduler.execNext();
		await scheduler.execNext();
		
		expect(scheduler.queue.length).to.equal(2);
		
		await scheduler.execNext();
		await scheduler.execNext();
		
		const fileNames = files.map(f => libPath.relative(SIMPLE, f)).sort();
		expect(fileNames).to.eql(['file1.dat', 'file2.dat']);
		expect(done).to.be.true;
	});
	
	it('can find files deeply', async () => {
		const scheduler = new SchedulerMock();
		
		const finder = new Finder(TREE, scheduler);
		
		const files = [];
		let done = false;
		finder.on('file', (file) => files.push(file));
		
		finder.on('done', () => {
			const fileNames = files.map(f => libPath.relative(TREE, f)).sort();
			expect(fileNames).to.eql([
				'a/b/file2.dat',
				'a/b/file3.dat',
				'd/file4.dat',
				'file1.dat',
			]);
			done = true;
		});
		
		while (!done) {
			await scheduler.execNext();
		}
	});
});