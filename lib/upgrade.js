const fs = require('fs');
const url = require('url');
const path = require('path');
const request = require('request');
const randomstring = require('randomstring');
const inquirer = require('inquirer');
const compareVersions = require('compare-versions');
const polyfill = require('./polyfill');
const dictionary = polyfill.plugin();
const { data } = require('./config');
const registry = data.registries[data.registrySelectedIndex];
const nodeModules = path.resolve(dictionary, 'node_modules');

module.exports = async () => {
  const packageFile = path.resolve(dictionary, 'package.json');
  const pkg = require(packageFile);
  const dependencies = pkg.dependencies || {};
  const keys = Object.keys(dependencies);
  if (!keys.length) {
    console.log('未找到任何插件');
    return process.exit(0);
  }
  const changeVersions = [];
  const _versions = await Promise.all(keys.map(getPackageLatestVersion));
  keys.forEach((key, index) => {
    const version = findRealPackageVersion(key);
    if (compareVersions(version, _versions[index]) === -1) {
      changeVersions.push({
        name: key,
        oldVersion: version,
        newVersion: _versions[index],
      });
    }
  });
  if (changeVersions.length) {
    const chunks = [];
    if (changeVersions.length === 1) {
      const checked = await inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `请确定是否升级插件：\`${changeVersions[0].name}\`<${changeVersions[0].oldVersion} -> ${changeVersions[0].newVersion}>？`,
        default: true,
      });
      if (checked.confirm) {
        chunks.push(changeVersions[0]);
      }
    } else {
      const res = await inquirer.prompt({
        type: 'checkbox',
        name: 'data',
        message: '请选择需要更新的插件<支持多选>',
        default: [],
        choices: changeVersions.map(version => {
          return {
            name: `${version.name}<${version.oldVersion} -> ${version.newVersion}>`,
            value: version
          }
        })
      });
      chunks.push(...res.data);
    }
    if (chunks.length) {
      process.chdir(dictionary);
      polyfill(null, ['install', ...chunks.map(chunk => `${chunk.name}@${chunk.newVersion}`)]);
    }
  } else {
    console.log('插件无需更新！');
    process.exit(0)
  }
}

function getPackageLatestVersion(packageName) {
  return new Promise((resolve, reject) => {
    request.get(url.resolve(registry, packageName), {
      headers: {
        ['npm-session']: randomstring.generate(),
        ['Content-Type']: 'application/json'
      }
    }, (err, res, body) => {
      if (err) return reject(err);
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(res.statusMessage));
      }
      try {
        const data = JSON.parse(body);
        resolve(data['dist-tags'].latest);
      } catch(e) {
        reject(e);
      }
    })
  })
}

function findRealPackageVersion(packageName) {
  const dir = path.resolve(nodeModules, packageName);
  const pkgFile = path.resolve(dir, 'package.json');
  return require(pkgFile).version;
}