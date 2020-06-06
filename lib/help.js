'use strict';

const config = require('./config');
const npmlog = require('npmlog');

module.exports = function outputHelp(argv) {
  npmlog.heading = 'NPC';
  const helpInfo = 'Usage: npc [option] <command>\n' +
  'Help: ' + config.registry.replace(/\/$/, '') + '/' + require('../package.json').name + '\n\n' +
  '  Extend command\n' +
  '    registry [-d|--delete]         delete any registry.\n' +
  '\n' +
  '  npm command use --registry=' + (argv.registry) + '\n' +
  '    where <command> is one of:\n' +
  '    add-user, adduser, apihelp, author, bin, bugs, c, cache,\n' +
  '    completion, config, ddp, dedupe, deprecate, docs, edit,\n' +
  '    explore, faq, find, find-dupes, get, help, help-search,\n' +
  '    home, i, info, init, install, isntall, la, link, list, ll,\n' +
  '    ln, login, ls, outdated, owner, pack, prefix, prune,\n' +
  '    publish, r, rb, rebuild, remove, restart, rm, root,\n' +
  '    run-script, s, se, search, set, show, shrinkwrap, star,\n' +
  '    start, stop, submodule, tag, test, tst, un, uninstall,\n' +
  '    unlink, unpublish, unstar, up, update, v, version, view,\n' +
  '    whoami\n' +

  '      npm <cmd> -h     quick help on <cmd>\n' +
  '      npm -l           display full usage info\n' +
  '      npm faq          commonly asked questions\n' +
  '      npm help <term>  search for help on <term>\n' +
  '      npm help npm     involved overview\n\n' +

  '      Specify configs in the ini-formatted file:\n' +
  '          ' + config.hostFile + '\n' +
  '      or on the command line via: npm <command> --key value\n' +
  '      Config info can be viewed via: npm help config';
  npmlog.info('Help', helpInfo);
  process.exit(0);
};
