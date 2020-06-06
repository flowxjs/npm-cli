const argv = process.argv.slice(2);
const fs = require('fs');
const path = require('path');
const configs = require('./config');
const hostFile = path.resolve(configs.root, '.NPCHOST');
let closing = 0, timer = null;

(() => {
  if (!argv.length) return;
  const data = JSON.parse(fs.readFileSync(hostFile, 'utf8'));
  const registry = data.hosts[data.selected];
  argv.push('--registry=' + registry);
  listen();
  const ls = require('child_process').spawn(require.resolve('cnpm'), argv, { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
  ls.on('close', () => {
    if (closing === 1) {
      closing = 2;
    } else {
      destory();
      process.exit(0);
    }
  });
})();

function close() {
  if ([1, 2].indexOf(closing) > -1) return;
  closing = 1;
  timer = setInterval(() => {
    if (closing === 2) {
      destory();
      clearInterval(timer);
      process.exit(0);
    }
  }, 10);
}

function listen() {
  process.on('SIGINT', close);
  process.on('SIGQUIT', close);
  process.on('SIGTERM', close);
}

function destory() {
  process.removeListener('SIGINT', close);
  process.removeListener('SIGQUIT', close);
  process.removeListener('SIGTERM', close);
}