#!/usr/bin/env node
var path       = require('path')
,   fs         = require('fs')
,   watch      = require('watch')
,   browserify = require('browserify')
,   bundle     = browserify({debug: true, bare: true})
,   params     = require('minimist')(process.argv)
,   outfile    = params.o || path.join(__dirname, 'bundle.js')
,   watchDir   = typeof params.watch === 'string' ? params.watch : __dirname
;

function doTheBuild (outfile) {
	bundle.add(path.join(__dirname, 'main.js'));

	outfile && console.log(outfile, 'written');
	bundle.bundle().pipe(outfile ?
		fs.createWriteStream(outfile) :
		process.stdout
	);
}

if ('watch' in params) {
	console.log('watching ', watchDir);
	watch.createMonitor(watchDir, {
		ignoreDotFiles: true,
		ignoreUnreadableDir: true,
		ignoreNotPermitted: true
	}, function (mon) {
		var outfileRegex = new RegExp(outfile, 'i');
		function handleChange (f, change) {
			if (!outfileRegex.test(f)) {
				console.log(f, change);
				doTheBuild(outfile);
			} 
		}
		mon.on('created', function (f, stat) {
			handleChange(f, 'created');
		});
		mon.on('changed', function (f, curr, prev) {
			handleChange(f, 'changed');
		});
		mon.on('removed', function (f, stat) {
			handleChange(f, 'removed');
		});
	});
} else {
	doTheBuild();
}



