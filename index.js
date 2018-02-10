const mv = require('./commands/mv');
const ensureDir = require('./commands/ensure_dir');

module.exports = {
	mv,
	move: mv,
	ensureDir
};