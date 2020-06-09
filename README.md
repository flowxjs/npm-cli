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
$ npc setup
# test:
$ npc view react
```

### Choose Installer Mode

```bash
$ npc use
```

你可以选择使用`npm`或者`npminstall`模式来安装模块。默认选择`npm`。