const { data, hostFile } = require('./config');
const inquirer = require('inquirer');
const fs = require('fs');
const npmlog = require('npmlog');
const installers = [
  {
    name: 'Install using [NPM] native mode',
    value: 'npm'
  },
  {
    name: 'Install using [npminstall](similar to `cnpm` installation mode) mode',
    value: 'npminstall'
  }
];
npmlog.addLevel('success', 3001, { fg: "green", bold: true });
const questions = {
  type: 'list',
  name: 'installer',
  message: 'Which installer do you want to use?',
  default: data.installer,
  choices: installers,
}
module.exports = () => {
  inquirer.prompt(questions).then(({ installer }) => {
    data.installer = installer;
    fs.writeFileSync(hostFile, JSON.stringify(data), 'utf8');
    return npmlog.success('!', `Saved successfully in ${installer} mode`);
  }).catch(e => npmlog.error(e.message))
}