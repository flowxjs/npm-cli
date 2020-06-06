'use strict';
const program = require('commander');
const config = require('./config');
const pkg = require('../package.json');
const help = require('./help');
const npmlog = require('npmlog');
const cp = require('child_process');

let argv = null;
npmlog.heading = 'NPC';

module.exports = cmd => {
  if (!argv) {
    argv = program
      .option('-v, --version', 'show full versions')
      .option('--disturl [disturl]', 'dist url for node-gyp, default is ' + config.disturl)
      .option('-c, --cache [cache]', 'cache folder, default is ' + config.cache)
      .option('-y, --yes', 'yes all confirm')
  }

  if (cmd === 'registry') {
    argv.option('-d, --delete', 'delete any registry.');
  }

  // commander's bug, fix here
  // https://github.com/visionmedia/commander.js/pull/189
  let cacheInfo;
  argv.on('cache', function(cache) {
    if (typeof cache === 'string') {
      cacheInfo = cache;
      return;
    }
    argv.args = [ 'cache' ].concat(cache || []);
  });

  argv.on('version', function() {
    const npmversion = cp.execSync('npm -v').toString().trim();
    const nodeversion = cp.execSync('node -v').toString().trim();
    npmlog.addLevel('version', 3001, { fg: "blue" });
    npmlog.addLevel('registry', 3001, { fg: "green" });
    npmlog.version('npc', pkg.version);
    npmlog.version('npm', npmversion);
    npmlog.version('node', nodeversion);
    npmlog.registry('current', config.registry);
    process.exit(0);
  });

  // custom help message
  // output command help, default options help info will output by default
  argv.on('--help', function() {
    argv.registry = config.registry;
    help(argv);
  });

  argv.parse(process.argv.slice());
  if (process.argv[2] === '-v' || process.argv[2] === '--version') {
    argv.emit('version');
  }

  argv.registry = config.registry;

  if (!argv.disturl) {
    const isIOJS = process.execPath.indexOf('iojs') >= 0;
    argv.disturl = isIOJS ? config.iojsDisturl : config.disturl;
  }

  if (argv.disturl === 'none') {
    delete argv.disturl;
  }

  argv.cache = cacheInfo || config.cache;

  if (!argv.args.length) {
    help(argv);
  }

  // filter rawArgs
  const rawArgs = argv.rawArgs;
  const needs = [];
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg.indexOf('--disturl=') === 0) continue;
    needs.push(arg);
  }
  argv.rawArgs = needs;

  return argv;
};