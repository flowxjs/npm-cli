const fs = require('fs');
const path = require('path');
const polyfill = require('./polyfill');
const pluginDictionary = polyfill.plugin();

exports.setup = (options) => {
  process.chdir(pluginDictionary);
  polyfill(null, ['install', ...options]);
}

exports.unsetup = (options) => {
  process.chdir(pluginDictionary);
  polyfill(null, ['uninstall', ...options]);
}

exports.commands = (program) => {
  const file = path.resolve(pluginDictionary, 'package.json');
  if (!fs.existsSync(file)) return;
  const pkg = require(file);
  const dependenciesTree = pkg.dependencies || {};
  const dependencies = Object.keys(dependenciesTree);
  const pluginDirs = dependencies.map(dependency => path.resolve(pluginDictionary, 'node_modules', dependency));
  pluginDirs.forEach(pd => {
    const result = require(pd);
    if (Array.isArray(result.commands)) {
      program.addCommand(result);
    }
  })
}