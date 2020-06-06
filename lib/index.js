const program = require('commander');
const pkg = require('../package.json');
const help = require('./help');

program
  .allowUnknownOption(true)
  .option('-v, --version', 'NPC version')
  .version(pkg.version);

program.on('--help', help);

program.command('registry')
  .alias('r')
  .option('-d, --delete', 'delete any registry.')
  .action(require('./registry'));

program.command('mirror')
  .alias('m')
  .option('-d, --delete', 'delete any mirror.')
  .action(require('./mirror'));

program.command('*')
  .allowUnknownOption(true)
  .action(require('./polyfill'));

program.parse(process.argv);