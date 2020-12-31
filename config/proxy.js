const { globalConfig } = require('./config');

exports.proxy = [
    {
        //要代理的地址 此规则用！取反
        context: '/file',
        //要代理的目标 （默认开发环境）
        // target: 'http://dev.trialos.com/' ,
        target: 'http://file.test.com',
        // target: 'https://www.trialos.com/',
        // target: 'https://uat-edcglobal.trialos.com/' ,
        //是否更改源
        changeOrigin: true
    },
    {
        //要代理的地址 此规则用！取反
        context: '/fs-pdfjs',
        //要代理的目标 （默认开发环境）
        // target: 'http://dev.trialos.com/' ,
        target: 'http://trialos.test.com',
        // target: 'https://www.trialos.com/',
        // target: 'https://uat-edcglobal.trialos.com/' ,
        //是否更改源
        changeOrigin: true
    },
    {
        //要代理的地址 此规则用！取反
        context: '/api/pdf-service',
        //要代理的目标 （默认开发环境）
        // target: 'http://dev.trialos.com/' ,
        target: 'http://trialos.test.com',
        // target: 'https://www.trialos.com/',
        // target: 'https://uat-edcglobal.trialos.com/' ,
        //是否更改源
        changeOrigin: true
    },
    {
        //要代理的地址 此规则用！取反
        context: [`!${globalConfig.publicPath}**`],
        //要代理的目标 （默认开发环境）
        // target: 'http://dev.trialos.com/' ,
        target: 'http://tenant.dev.com/',
        // target: 'https://www.trialos.com/',
        // target: 'https://uat-edcglobal.trialos.com/' ,
        //是否更改源
        changeOrigin: true,
        //路径重写
        pathRewrite: {
            '^/$': ''
        },
        //cookie域名重写
        cookieDomainRewrite: globalConfig.host
    }
];
