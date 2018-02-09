function MvNativeOptions(source) {
	/** How many parallel threads of execution to allow */
	this.parallelism = 5;

	Object.assign(this, source);
}

module.exports = MvNativeOptions;