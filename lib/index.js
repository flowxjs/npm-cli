#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkg = require('../package.json');
const help = require('./help');
const extra = require('./extra');
const { commands } = require('./plugin');

program
  .allowUnknownOption(true)
  .option('-v, --version', 'NPC version')
  .version(pkg.version);

// program.on('--help', help);

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

program.command('upgrade')
  .description('update all plugins.')
  .action(require('./upgrade'));

program.command('use')
  .description('Use installer between npm and npminstall')
  .action(require('./installer'));

program.command('setup <plugins...>')
  .description('setup plugins')
  .action(require('./plugin').setup);

program.command('unsetup <plugins...>')
  .description('unsetup plugins')
  .action(require('./plugin').unsetup);

commands(program);
extra(program);

program.command('*')
  .allowUnknownOption(true)
  .action(require('./polyfill'));

program.parseAsync(process.argv);
