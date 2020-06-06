const fs = require('fs');
const url = require('url');
const inquirer = require('inquirer');
const npmlog = require('npmlog');
const chalk = require('chalk');
const { hostFile, data } = require('./config');

npmlog.addLevel('success', 3001, { fg: "green", bold: true });

const questions = {
  type: 'list',
  name: 'selectedIndex',
  message: 'Which mirror do you want to use?',
  default: data.mirrorSelectedIndex,
  choices: data.mirrors.map((mirror, index) => ({ 
    name: (index  + 1) + '. ' + mirror + (data.mirrorSelectedIndex === index ? chalk.red(' (current)') : ''), 
    value: index 
  }))
}

module.exports = (options) => {
  if (!options.delete) {
    questions.choices.unshift({
      name: '+  [ Add a new mirror host ... ]',
      value: -1
    });
    questions.default++;
  }

  inquirer.prompt(questions).then(({ selectedIndex }) => {
    if (selectedIndex > -1) {
      const mirror = data.mirrors[selectedIndex];
      if (options.delete) {
        if (data.mirrors.length === 1) {
          return npmlog.error('Cannot delete all mirrors.');
        }
        data.mirrors.splice(selectedIndex, 1);
        selectedIndex = 0;
      }
      data.mirrorSelectedIndex = selectedIndex;
      fs.writeFileSync(hostFile, JSON.stringify(data), 'utf8');
      return npmlog.success(options.delete ? '-' :'Saved', mirror);
    } else {
      return createnewMirror();
    }
  }).catch(e => npmlog.error(e.message));
}

function createnewMirror() {
  const q = [
    {
      type: 'input',
      name: 'newMirror',
      message: 'What is the url of new mirror?',
      validate(value) {
        if (!value) return 'New mirror cannot be empty.';
        if (!/^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_]*)?$/.test(value)) return 'Incorrect URL address format.';
        const hostPaths = data.mirrors.map(host => url.parse(host).hostname);
        const pathname = url.parse(value).hostname;
        if (hostPaths.indexOf(pathname) > -1) return 'Mirror address already exists';
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'selected',
      message: 'Use this mirror?',
      default: true
    }
  ];
  return inquirer.prompt(q).then(({ newMirror, selected }) => {
    data.mirrors.push(newMirror);
    if (selected) data.mirrorSelectedIndex = data.mirrors.indexOf(newMirror);
    fs.writeFileSync(hostFile, JSON.stringify(data), 'utf8');
    return npmlog.success('+', newMirror);
  });
}