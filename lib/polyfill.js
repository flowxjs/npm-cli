const fs = require('fs');
const path = require('path');
const match = require('auto-correct');
const configs = require('./config');
const spawn = require('cross-spawn');
const cp = require('child_process');

module.exports = async (command, rawArgs) => {
  // console.log('rawArgs', rawArgs);
  // return;
  const args = [];
  let isInstall = false;
  let installer = configs.data.installer || 'npm';
  for (let i = 0; i < rawArgs.length; i++) {
    let arg = rawArgs[i];
    if (arg[0] !== '-') arg = correct(arg);
    if (i === 0 && (arg === 'i' || arg === 'install')) {
      isInstall = true;
      continue;
    }
    // support `$ cnpm i --by=npm`
    if (arg.indexOf('--by=') === 0) {
      installer = arg.split('=', 2)[1];
      continue;
    }
    args.push(arg);
  }

  const env = Object.assign({}, process.env);
  const CWD = process.cwd();

  args.unshift('--registry=' + configs.data.registries[configs.data.registrySelectedIndex]);
  args.unshift('--disturl=' + configs.data.mirrors[configs.data.mirrorSelectedIndex]);

  let npmBin;
  let execMethod = spawn;
  const stdio = [
    process.stdin,
    process.stdout,
    process.stderr,
  ];

  if (isInstall) {
    npmBin = path.join(__dirname, '..', 'node_modules', '.bin', installer);
    if (installer === 'npminstall') {
      // use fork to spawn can fix install cnpm itself fail on Windows
      execMethod = cp.fork;
      stdio.push('ipc');
      npmBin = require.resolve('npminstall/bin/install.js');
      args.unshift('--china');
      args.unshift('--fix-bug-versions');
    } else {
      // other installer, like npm
      args.unshift('install');
    }
    // maybe outside installer, just use installer as binary name
    if (!fs.existsSync(npmBin)) {
      npmBin = installer;
    }
  } else {
    npmBin = path.join(__dirname, '..', 'node_modules', '.bin', 'npm');
  }

  const code = await new Promise((resolve, reject) => {
    const child = execMethod(npmBin, args, {
      env,
      cwd: CWD,
      stdio,
    });
    child.on('exit', resolve);
    child.on('error', reject);
  });

  process.exit(code);
}

function correct(command) {
  const cmds = [
    'install',
    'publish',
    'adduser',
    'author',
    'config',
    'unpublish',
  ];
  for (const cmd of cmds) {
    if (match(command, cmd)) {
      return cmd;
    }
  }
  return command;
}

module.exports.plugin = () => {
  const pluginDictionary = path.resolve(process.env.HOME, './.npc-plugins');
  if (!fs.existsSync(pluginDictionary)) {
    fs.mkdirSync(pluginDictionary);
    const pkgfile = path.resolve(pluginDictionary, 'package.json');
    const pkg = {
      "version": "1.0.0",
      "description": "npc plugin factory"
    }
    fs.writeFileSync(pkgfile, JSON.stringify(pkg, null, 2), 'utf8');
  }
  return pluginDictionary;
}