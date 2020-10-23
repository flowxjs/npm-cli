# NPM-CLI

命令行工具

## Usage

```bash
$ npm i -g @flowx/npm-cli
```

### Registry

```bash
$ npc registry [-d|--delete]
```

### Connect with NPC

```bash
$ npm i -g @flowx/npm-cli
$ npc r
# type the registry url and select yes to confirm
# $ npc setup
# test:
$ npc view react
```

### Choose Installer Mode

```bash
$ npc use
```

你可以选择使用`npm`或者`npminstall`模式来安装模块。默认选择`npm`。

## Plugins

任意存在 `.npc` 文件夹下以 `.cmd.js` 结尾的文件都将被认为是插件。插件写法如下:

```js
const { Command } = require('commander');
const c = module.exports = new Command();
c.name('aa')
c.action(() => {
  console.log('bb')
})
```

它将自动被npc加载:

```bash
$ npc aa # bb
```

搜索目录:

1. `node_modules` 下所有插件
2. `process.cwd()` 同级 `.npc` 文件夹
