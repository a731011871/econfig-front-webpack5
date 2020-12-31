const presets = [
    '@babel/react',
    [
        '@babel/preset-env',
        {
            targets: {
                ie: '8'
            },
            useBuiltIns: 'entry',
            modules: false,
            corejs: '3'
        }
    ]
];

const plugins = [
    //styled-components 插件
    'styled-components',
    //动态引入
    '@babel/syntax-dynamic-import',
    [
        '@babel/proposal-decorators',
        {
            legacy: true
        }
    ],
    // 类属性
    [
        '@babel/proposal-class-properties',
        {
            loose: true
        }
    ],
    // 装饰器

    // export default form '' 语法
    '@babel/proposal-export-default-from',
    // 参数异常语法
    '@babel/proposal-throw-expressions',
    // export * as name from '' 语法
    '@babel/proposal-export-namespace-from',
    // const a = obj ?? 'link'
    // var a = obj !== null && obj !== void 0 ？ obj:'link'
    // '@babel/proposal-nullish-coalescing-operator',
    ['@babel/plugin-proposal-optional-chaining', {}],
    ['@babel/plugin-proposal-nullish-coalescing-operator', {}],
    // polyfill
    [
        '@babel/plugin-transform-runtime'
        // {
        //     corejs: 2
        // }
    ]
];

module.exports = {
    presets,
    plugins
};
