module.exports = {
    master: {
      // 注册子应用信息
      apps: [
        {
          name: 'tenant-verified', // 唯一 id
          entry: '/micro-app/tenant-verified/', // html entry
        },
        {
          name: 'login-component', // 唯一 id
          entry: '/micro-app/login-component/', // html entry
        },
      ],
    },
  };