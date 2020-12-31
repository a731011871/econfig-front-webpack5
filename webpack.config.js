const webpack = require('webpack');
const { resolve } = require('path');
const { globalConfig } = require('./config/config');
const { DevUtil } = require('./config/utils');
const { env } = require('./config/env');
const { proxy } = require('./config/proxy');
// const CleanPlugin = require('clean-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssToFile = require('mini-css-extract-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const { loader: exLoader } = CssToFile;
const UglifyJs = require('uglifyjs-webpack-plugin');
const UglifyCss = require('optimize-css-assets-webpack-plugin');
const safeParser = require('postcss-safe-parser');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {
    MicroFrontMasterPlugin
} = require('@tms/micro-front/lib/webpack/master');
const os = require('os');

class WebpackConfig {
    constructor(BUILD_ENV = 'local') {
        if (BUILD_ENV === 'local') {
            process.env.NODE_ENV = 'development';
        } else {
            process.env.NODE_ENV = 'production';
        }

        this.NODE_ENV = process.env.NODE_ENV;
        this.BUILD_ENV = BUILD_ENV;
    }

    get optimization() {
        if (this.NODE_ENV === 'development') return;

        return {
            splitChunks: {
                // name: 'vendors',
                // chunks: 'all',
                chunks: 'all'
            },
            runtimeChunk: {
                name: 'runtime'
            }
            // minimizer: [
            //     new UglifyJs({
            //         parallel: os.cpus().length,
            //         uglifyOptions: {
            //             compress: {
            //                 drop_console: true,
            //                 drop_debugger: true,
            //                 pure_funcs: ['console.log'] // 移除console
            //             },
            //             output: {
            //                 comments: false
            //             }
            //         }
            //     }),
            //     new UglifyCss({
            //         cssProcessorOptions: {
            //             parser: safeParser,
            //             discardComments: { removeAll: true }
            //         }
            //     })
            // ]
        };
    }

    get plugins() {
        const { NODE_ENV, BUILD_ENV } = this;
        const { outputPath, publicPath, host, port } = globalConfig;
        const commonPlugins = [
            //new webpack.IgnorePlugin(/^\.\/locale$/ , /moment$/) ,
            new webpack.DefinePlugin(DevUtil.stringifyEnv(env[BUILD_ENV])),
            new webpack.ContextReplacementPlugin(
                /moment[\\\/]locale$/,
                /^\.\/(zh-cn|en-gb)$/
            ),
            new MicroFrontMasterPlugin()
        ];

        const tms = {
            scripts:
                BUILD_ENV === 'static'
                    ? []
                    : process.env.NODE_ENV === 'development'
                    ? [
                          '//static.mobilemd.cn/public/lib/babel-polyfill/7.6.0/polyfill.min.js',
                          '//static.mobilemd.cn/public/lib/tms-common-vendor/1.0.0/tms-common-vendor.development.de9ce826.js'
                      ]
                    : [
                          '//static.mobilemd.cn/public/lib/babel-polyfill/7.6.0/polyfill.min.js',
                          '//static.mobilemd.cn/public/lib/tms-common-vendor/1.0.0/tms-common-vendor.production.6be5af49.js'
                      ],
            styles:
                BUILD_ENV === 'static'
                    ? ['/econfig/assets/static/econfig.css']
                    : [
                          // '//static.mobilemd.cn/public/lib/tms-common-vendor/1.0.0/tms-common-vendor.production.6fd9b427.css'
                          '/econfig/assets/static/econfig.css'
                      ],
            BUILD_ENV
        };
        const envPlugins = {
            development: [
                ...commonPlugins,
                new webpack.HotModuleReplacementPlugin(),
                new HtmlPlugin({
                    template: resolve('./public/index.html'),
                    filename: 'index.html',
                    favicon: resolve('./public/favicon.ico'),
                    rootPath: '/',
                    inject: true,
                    tms
                }),
                new CopyWebpackPlugin(
                    {
                        patterns: [
                            {
                                from: resolve('./public/assets/static'),
                                to: resolve('./dist/assets/static')
                            }
                        ]
                    }
                    // [
                    //     {
                    //         from: resolve('./public/assets/static'),
                    //         to: resolve('./dist/assets/static')
                    //     }
                    // ]
                ),
                new FriendlyErrors({
                    compilationSuccessInfo: {
                        messages: [
                            `编译成功 运行于http://${host}:${port}`
                            // `编译成功 运行于http://${host}:${port}${publicPath}`
                        ]
                    }
                })
            ],
            production: [
                ...commonPlugins,
                // new CleanPlugin([outputPath], { allowExternal: true }),
                new CleanWebpackPlugin(),
                new CssToFile({
                    filename: 'assets/style/[name].[contenthash:7].css'
                    // allChunks: true
                }),
                new HtmlPlugin({
                    inject: true,
                    template: resolve('./public/index.html'),
                    rootPath: publicPath,
                    favicon: resolve('./public/favicon.ico'),
                    tms,
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        keepClosingSlash: true,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true
                    }
                }),
                new CopyWebpackPlugin(
                    {
                        patterns: [
                            {
                                from: resolve('./public/assets/static'),
                                to: resolve('./dist/assets/static')
                            }
                        ]
                    }
                    // [
                    //     {
                    //         from: resolve('./public/assets/static'),
                    //         to: resolve('./dist/assets/static')
                    //     }
                    // ]
                )
                // new BundleAnalyzerPlugin({
                //     analyzerMode: 'static'
                // })
            ]
        };

        return envPlugins[NODE_ENV];
    }

    get resolve() {
        return {
            extensions: ['.js', '.jsx', '.scss', '.css', 'less'],
            alias: {
                src: resolve('./src'),
                model: resolve('./src/model'),
                view: resolve('./src/view'),
                component: resolve('./src/component'),
                container: resolve('./src/container'),
                router: resolve('./src/router'),
                assets: resolve('./public/assets'),
                utils: resolve('./src/utils')
            }
        };
    }

    get resolveLoader() {
        return {
            // moduleExtensions: ['-loader']
        };
    }

    get devServer() {
        const { publicPath, port, host } = globalConfig;
        return {
            contentBase: [resolve('./public')],
            port,
            publicPath,
            historyApiFallback: {
                rewrites: [
                    {
                        from: new RegExp(`^${publicPath}`),
                        to: `${publicPath}index.html`
                    }
                ]
            },
            compress: true,
            hot: true,
            host,
            open: true,
            // openPage: publicPath.slice(1),
            inline: true,
            noInfo: true,
            quiet: true,
            clientLogLevel: 'none',
            overlay: {
                warnings: true,
                errors: true
            },
            proxy
            // https: true
        };
    }

    get devtool() {
        let devtool = false;

        if (this.BUILD_ENV === 'local') {
            devtool = 'cheap-module-source-map';
        } else if (env[this.BUILD_ENV].sourceMap) {
            devtool = 'source-map';
        }

        return devtool;
    }

    get module() {
        const common = {
            rules: [
                {
                    test: /\.jsx?$/,
                    use: [
                        {
                            loader: 'babel-loader'
                        },
                        {
                            loader: 'eslint-loader',
                            options: {
                                fix: true
                            }
                        }
                    ],
                    include: [
                        resolve('./src'),
                        resolve('./node_modules/build-dev-server-client')
                    ],
                    exclude: /node_modules/
                },
                {
                    exclude: [/\.(js|mjs|jsx|ts|tsx|html|json|scss|less|css)$/],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/media/[name].[hash:8].[ext]'
                            }
                        }
                    ]
                }
            ]
        };

        const development = {
            rules: [
                ...common.rules,
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader'
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: {
                                    modifyVars: {
                                        'primary-color': '#46b1ed',
                                        'link-color': '#46b1ed',
                                        'font-size-base': '14px',
                                        'border-radius-base': '6px'
                                    },
                                    javaEnabled: true,
                                    javascriptEnabled: true
                                }
                                // modifyVars: {
                                //     'primary-color': '#46b1ed',
                                //     'link-color': '#46b1ed',
                                //     'font-size-base': '14px',
                                //     'border-radius-base': '6px'
                                // },
                                // javaEnabled: true,
                                // javascriptEnabled: true
                            }
                        }
                    ]
                }
            ]
        };

        const production = {
            rules: [
                ...common.rules,
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: exLoader
                        },
                        {
                            loader: 'css-loader'
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: exLoader
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                },
                {
                    test: /\.less/,
                    use: [
                        {
                            loader: exLoader
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: {
                                    modifyVars: {
                                        'primary-color': '#46b1ed',
                                        'link-color': '#46b1ed',
                                        'font-size-base': '14px',
                                        'border-radius-base': '6px'
                                    },
                                    javaEnabled: true,
                                    javascriptEnabled: true
                                }
                                // modifyVars: {
                                //     'primary-color': '#46b1ed',
                                //     'link-color': '#46b1ed',
                                //     'font-size-base': '14px'
                                // },
                                // javaEnabled: true,
                                // javascriptEnabled: true
                            }
                        }
                    ]
                }
            ]
        };

        const modules = {
            development,
            production
        };

        return modules[this.NODE_ENV];
    }

    get externals() {
        if (this.BUILD_ENV === 'static') {
            return {};
        } else {
            return {
                moment: 'moment',
                '../moment': 'moment',
                antd: 'antd',
                react: 'React',
                'react-dom': 'ReactDOM'
            };
        }
    }

    getConfig() {
        const { publicPath, outputPath } = globalConfig;
        const {
            NODE_ENV,
            resolveLoader,
            plugins,
            devtool,
            devServer,
            module,
            optimization,
            externals
        } = this;
        const filename = DevUtil.getOutputFileName(NODE_ENV);

        return {
            mode: NODE_ENV,
            entry: {
                app: resolve('src/index.jsx')
            },
            output: {
                filename,
                publicPath,
                chunkFilename: filename,
                path: outputPath
            },
            resolve: this.resolve,
            resolveLoader,
            plugins,
            devServer,
            devtool,
            module,
            optimization,
            externals
        };
    }
}

module.exports = new WebpackConfig(process.env.BUILD_ENV).getConfig();
