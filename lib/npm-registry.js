const argv = process.argv.slice(2);
const fs = require('fs');
const url = require('url');
const inquirer = require('inquirer');
const npmlog = require('npmlog');
const request = require('request');
const { hostFile, data } = require('./config');
const chalk = require('chalk');

require('./parse')('registry');

// npmlog.pause();
npmlog.heading = 'Registry';
npmlog.addLevel('success', 3001, { fg: "green", bold: true });

const isDelete = argv[1] === '-d' || argv[1] === '--delete';

const questions = {
  type: 'list',
  name: 'selectedIndex',
  message: 'Which reigstry do you want to delete?',
  default: data.selected,
  choices: data.hosts.map((host, index) => ({ name: (index  + 1) + '. ' + host + (data.selected === index ? chalk.gray(' (current selected)') : ''), value: index }))
}

if (!isDelete) {
  questions.choices.unshift({
    name: '+  [ Add a new registry host ... ]',
    value: -1
  });
  questions.default++;
}

inquirer.prompt(questions).then(({ selectedIndex }) => {
  if (selectedIndex > -1) {
    let registry = data.hosts[selectedIndex];
    if (isDelete) {
      if (data.hosts.length === 1) {
        return npmlog.error('Cannot delete all registries.');
      }
      data.hosts.splice(selectedIndex, 1);
      selectedIndex = 0;
    }
    fs.writeFileSync(hostFile, JSON.stringify({
      hosts: data.hosts,
      selected: selectedIndex,
    }), 'utf8');
    return npmlog.success(isDelete ? '-' :'Saved', registry);
  } else {
    return createNewRegistry();
  }
}).catch(e => npmlog.error(e.message));

function createNewRegistry() {
  const q = [
    {
      type: 'input',
      name: 'newRegistry',
      message: 'What is the name of new registry?',
      validate(value) {
        if (!value) return 'New registry cannot be empty.';
        if (!/^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_]*)?$/.test(value)) return 'Incorrect URL address format.';
        const hostPaths = data.hosts.map(host => url.parse(host).hostname);
        const pathname = url.parse(value).hostname;
        if (hostPaths.indexOf(pathname) > -1) return 'Registry address already exists';
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'selected',
      message: 'Use this registry?',
      default: true
    }
  ];
  return inquirer.prompt(q).then(({ newRegistry, selected }) => {
    return new Promise((resolve, reject) => {
      request(url.resolve(newRegistry, '/npm'), (err, res, body) => {
        if (err) return reject(err);
        if (res && res.statusCode >= 200 && res.statusCode <= 300) {
          try {
            const pkg = JSON.parse(body);
            if (pkg._id === 'npm' && pkg.name === 'npm' && pkg._rev && pkg.versions && pkg['dist-tags'] && !pkg.error) {
              resolve({ newRegistry, selected });
            } else {
              reject(new Error('Invalid registry! It is not a private npm registry.'));
            }
          } catch(e) {
            reject(new Error('Invalid registry! It is not a private npm registry.'));
          }
        } else {
          reject(new Error('Invalid registry address.'));
        }
      });
    });
  }).then(({ newRegistry, selected }) => {
    data.hosts.push(newRegistry)
    if (selected) {
      data.selected = data.hosts.indexOf(newRegistry);
    }
    fs.writeFileSync(hostFile, JSON.stringify(data), 'utf8');
    return npmlog.success('+', newRegistry);
  });
}