#!/usr/bin/env node
var path       = require('path')
,   fs         = require('fs')
,   watch      = require('watch')
,   browserify = require('browserify')
,   bundle     = browserify({debug: true, bare: true})
,   params     = require('minimist')(process.argv)
,   outfile    = typeof params.o === 'string' || path.join(__dirname, 'bundle.js')
,   watchDir   = typeof params.watch === 'string' ? params.watch : __dirname
;

bundle.add(path.join(__dirname, 'main.js'));

function doTheBuild (outfile) {

	var writable = outfile ? fs.createWriteStream(outfile) : process.stdout;
	function end () { outfile && writable.end(); }

	res = bundle.bundle()
		.on('error', function (err) {
			console.log(err.toString());
			end();
		})
		.on('end', function () {
			outfile && console.log(outfile, 'written');
			end();
		})
		.pipe(writable)
		;
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
	doTheBuild(outfile);
}
