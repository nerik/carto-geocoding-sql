#!/usr/bin/env node
var geocode = require('../');
process.stdout.write(geocode(process.argv[2]))
