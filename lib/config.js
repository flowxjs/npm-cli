'use strict';
const path = require('path');
const fs = require('fs');
const npmlog = require('npmlog');
npmlog.heading = 'NPC';

let root;
if (process.platform === 'win32') {
  root = process.env.USERPROFILE || process.env.APPDATA || process.env.TMP || process.env.TEMP;
} else {
  root = process.env.HOME || process.env.TMPDIR || '/tmp';
}

const hostFile = path.resolve(root, '.NPC');
if (!fs.existsSync(hostFile)) fs.writeFileSync(hostFile, JSON.stringify({
  installer: 'npm',
  registries: ['https://registry.npmjs.org/'],
  registrySelectedIndex: 0,
  mirrors: ['https://npm.taobao.org/mirrors/node'],
  mirrorSelectedIndex: 0,
}), 'utf8');

const data = JSON.parse(fs.readFileSync(hostFile, 'utf8'));

module.exports = {
  registry: data.registries[data.registrySelectedIndex],
  disturl: data.mirrors[data.mirrorSelectedIndex], // download dist tarball for node-gyp
  cache: path.join(root, '.npc'), // cache folder name
  hostFile,
  data,
};