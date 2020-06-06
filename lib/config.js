'use strict';
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

let root;
if (process.platform === 'win32') {
  root = process.env.USERPROFILE || process.env.APPDATA || process.env.TMP || process.env.TEMP;
} else {
  root = process.env.HOME || process.env.TMPDIR || '/tmp';
}

const hostFile = path.resolve(root, '.NPCHOST');
if (!fs.existsSync(hostFile)) fs.writeFileSync(hostFile, JSON.stringify({
  hosts: ['https://registry.npmjs.org/'],
  selected: 0,
}), 'utf8');

const data = JSON.parse(fs.readFileSync(hostFile, 'utf8'));

module.exports = {
  registry: data.hosts[data.selected],
  disturl: 'https://npm.taobao.org/mirrors/node', // download dist tarball for node-gyp
  iojsDisturl: 'https://npm.taobao.org/mirrors/iojs',
  cache: path.join(root, '.npc'), // cache folder name
  hostFile,
  data,
};