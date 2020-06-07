const url = require('url');
const request = require('request');
const { data } = require('./config');
const randomstring = require('randomstring');
const inquirer = require('inquirer');
const npmlog = require('npmlog');
const registry = data.registries[data.registrySelectedIndex];
const q = [
  {
    type: 'input',
    name: 'scopes',
    message: '允许的Scope组名?（多个请用英文逗号分割）',
    validate(value) {
      if (!value) return 'scopes组名不能为空';
      const sper = value.split(',')
      for (let i = 0; i < sper.length; i++) {
        if (sper[i].charAt(0) !== '@') return 'scopes组名必须以@符号开头';
      }
      return true;
    }
  },
  {
    type: 'input',
    name: 'username',
    message: '请输入管理账号',
    validate(value) {
      if (!value) return '管理员账号不能为空';
      return true;
    }
  },
  {
    type: 'password',
    name: 'password',
    message: '请输入管理密码',
    validate(value) {
      if (!value) return '密码不能为空';
      return true;
    }
  },
  {
    type: 'password',
    name: 'password2',
    message: '请确认输入管理密码',
    validate(value) {
      if (!value) return '密码不能为空';
      return true;
    }
  },
  {
    type: 'input',
    name: 'email',
    message: '请输入管理邮箱',
    validate(value) {
      if (!value) return '管理员邮箱不能为空';
      if (!/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) return '邮箱格式不正确';
      return true;
    }
  }
];
npmlog.addLevel('success', 3001, { fg: "green", bold: true });
module.exports = () => {
  checkNpcRegistry().then(({ hash, session }) => {
    return inquirer.prompt(q).then(({ scopes, username, password, password2, email }) => {
      if (password !== password2) throw new Error('两次输入的密码不相同');
      return { session, hash, scopes, username, password, email };
    })
  }).then(({ session, hash, scopes, username, password, email }) => doSetup({
    session, hash, scopes: scopes.split(','), username, password, email
  })).then(() => npmlog.success('初始化成功')).catch(e => npmlog.error(e.message));
}

function checkNpcRegistry() {
  return new Promise((resolve, reject) => {
    const session = randomstring.generate();
    request.get(url.resolve(registry, '/-/init/npc'), {
      headers: {
        ['npm-session']: session
      }
    }, (err, res, body) => {
      if (err) return reject(new Error(`当前Registry<${registry}>不是NPC系统程序`));
      if (res.statusCode !== 200) {
        if (res.statusCode === 500 && body === '找不到配置数据') {
          console.log('in')
        }
        return reject(new Error(`当前Registry<${registry}>不是NPC系统程序`));
      }
      try {
        body = JSON.parse(body);
        resolve({
          session,
          hash: body.hash,
        });
      } catch(e) {
        reject(new Error(`当前Registry<${registry}>程序检测不合规`));
      }
    })
  });
}

function doSetup({ session, hash, scopes, username, password, email }) {
  return new Promise((resolve, reject) => {
    request.put(url.resolve(registry, '/-/init/configs'), {
      headers: {
        ['npm-session']: session,
        ['Content-Type']: 'application/json'
      },
      body: JSON.stringify({
        registries: data.registries.filter(r => r !== registry),
        scope: scopes,
        username,
        password,
        email,
        hash,
      })
    }, (err, res, body) => {
      if (err) return reject(err);
      if (res.statusCode !== 200) return reject(new Error(`初始化程序失败`));
      try {
        body = JSON.parse(body);
        if (body.ok) return resolve();
        reject(new Error('程序已初始化，无需再次初始化'));
      } catch(e) {
        reject(new Error(`当前Registry<${registry}>程序检测不合规`));
      }
    })
  })
}