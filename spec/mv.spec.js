const expect = require('chai').expect;

const libFs = require('fs');
const libPath = require('path');
const res = libPath.resolve;

const {mv} = require('../index');
const {ROOT, SIMPLE, TREE, prepareRoot, SchedulerMock} = require('./common');

beforeEach(prepareRoot);

describe('mv', () => {
	it('can move a single file', async () => {
		const srcPath = res(SIMPLE, 'file1.dat');
		const destPath = res(ROOT, 'a/b/c/file1.dat');
		
		expect(libFs.existsSync(srcPath)).to.be.true;
		expect(libFs.existsSync(destPath)).to.be.false;
		
		await mv(srcPath, destPath);
		
		expect(libFs.existsSync(srcPath)).to.be.false;
		expect(libFs.existsSync(destPath)).to.be.true;
	});
	
	it('can move a directory', async () => {
		const srcPath = TREE;
		const destPath = res(ROOT, 'a/b/c/');
		
		expect(libFs.existsSync(srcPath)).to.be.true;
		expect(libFs.existsSync(destPath)).to.be.false;
		
		await mv(srcPath, destPath);
		
		expect(libFs.existsSync(srcPath)).to.be.false;
		expect(libFs.existsSync(destPath)).to.be.true;
		expect(libFs.existsSync(res(destPath, 'a/b/file2.dat'))).to.be.true;
		expect(libFs.existsSync(res(destPath, 'd/file4.dat'))).to.be.true;
		expect(libFs.existsSync(res(destPath, 'file1.dat'))).to.be.true;
	});
});