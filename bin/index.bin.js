#!/usr/bin/env node
var geocode = require('../');

if (!process.argv[2] || process.argv[2] === '') {
  process.stderr.write('no location specified\n');
  process.exit(1);
}

process.stdout.write(geocode(process.argv[2])+'\n');
