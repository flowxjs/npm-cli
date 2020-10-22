#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkg = require('../package.json');
const help = require('./help');
const extra = require('./extra');

program
  .allowUnknownOption(true)
  .option('-v, --version', 'NPC version')
  .version(pkg.version);

program.on('--help', help);

program.command('registry')
  .alias('r')
  .description('Manage registry operations')
  .option('-d, --delete', 'delete any registry.')
  .action(require('./registry'));

program.command('mirror')
  .alias('m')
  .description('Manage mirror operations')
  .option('-d, --delete', 'delete any mirror.')
  .action(require('./mirror'));

program.command('setup')
  .description('Initializing the NPC\'s registry program')
  .action(require('./setup'));

program.command('use')
  .description('Use installer between npm and npminstall')
  .action(require('./installer'));

program.command('*')
  .allowUnknownOption(true)
  .action(require('./polyfill'));

extra(program);

program.parse(process.argv);