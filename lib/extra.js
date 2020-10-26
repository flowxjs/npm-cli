const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const npcName = '.npc';
const npcFileSufix = '.cmd.js';
module.exports = (program) => {
  const cwd = process.cwd();
  const nodeModules = path.resolve(cwd, 'node_modules');
  if (fs.existsSync(nodeModules)) {
    const packages = fs.readdirSync(nodeModules);
    packages.forEach(pkg => {
      const dir = path.resolve(nodeModules, pkg);
      if (pkg.startsWith('@') && fs.statSync(dir).isDirectory()) {
        const dirs = fs.readdirSync(dir);
        dirs.forEach(d => {
          const packageNpcDir = path.resolve(dir, d);
          if (fs.existsSync(packageNpcDir)) {
            readNpcDictionary(program, packageNpcDir);
          }
        })
      } else {
        const packageNpcDir = path.resolve(dir, npcName);
        if (fs.existsSync(packageNpcDir)) {
          readNpcDictionary(program, packageNpcDir);
        }
      }
    });
  }
  const localNpcDir = path.resolve(cwd, npcName);
  if (fs.existsSync(localNpcDir)) {
    readNpcDictionary(program, localNpcDir);
  }
}

function readNpcDictionary(program, dictionary) {
  const dirs = fs.readdirSync(dictionary);
  dirs.forEach(dir => {
    const file = path.resolve(dictionary, dir);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      readNpcDictionary(program, file);
    } else if (stat.isFile() && file.endsWith(npcFileSufix)) {
      try {
        const result = require(file);
        if (Array.isArray(result.commands)) {
          program.addCommand(result);
        }
      } catch(e) {}
    }
  })
}