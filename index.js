'use strict';

var streamfilter = require('streamfilter');
var micromatch = require('micromatch');
var path = require('path');

function compose(f, g) {
	return function gf(x) {
		return g(f(x));
	};
}

function relativePath(file) {
	return file.relative;
}

function relativeToCwd(file) {
	return path.relative(file.cwd, file.path);
}

function fileFilter(predicate, options) {
	return streamfilter(function (file, enc, cb) {
		cb(!predicate(file));
	}, options);
}

function filter(pattern, options) {
	options = options || {};
	var predicate;

	if (typeof pattern === 'function') {
		predicate = pattern;
	} else {
		predicate = compose(options.fileToPath || relativePath, micromatch.filter(pattern, options));
	}

	return fileFilter(predicate, {
		objectMode: true,
		passthrough: options.passthrough !== false,
		restore: options.restore !== false
	});
}

filter.fileFilter = fileFilter;
filter.relativePath = relativePath;
filter.relativeToCwd = relativeToCwd;

module.exports = filter;
