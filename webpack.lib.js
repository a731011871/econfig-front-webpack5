const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        app: './src/app.jsx'
    },
    output: {
        path: path.resolve('./lib'),
        libraryTarget: 'umd',
        library: 'TmsFormStage'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel!eslint',
                include: [
                    path.resolve('./src'),
                    path.resolve('./node_modules/build-dev-server-client')
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'file',
                options: {
                    name: 'assets/image/[name].[ext]?[hash:7]'
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'file',
                options: {
                    name: 'assets/media/[name].[ext]?[hash:7]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'file',
                options: {
                    name: 'assets/font/[name].[ext]?[hash:7]'
                }
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css']
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            },
            {
                test: /\.less/,
                use: [
                    {
                        loader: 'style'
                    },
                    {
                        loader: 'css'
                    },
                    {
                        loader: 'less',
                        options: {
                            javaEnabled: true,
                            javascriptEnabled: true
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss', '.css', 'less'],
        alias: {
            src: path.resolve('./src'),
            view: path.resolve('./src/view'),
            component: path.resolve('./src/view/component'),
            model: path.resolve('./src/model')
        }
    },
    resolveLoader: {
        moduleExtensions: ['-loader']
    },
    plugins: [
        new CleanPlugin([path.resolve('./lib')], { allowExternal: true })
    ],
    externals: {
        react: 'react',
        antd: 'antd',
        moment: 'moment',
        'react-redux': 'react-redux',
        classnames: 'classnames',
        redux: 'redux',
        'react-router-dom': 'react-router-dom',
        'redux-thunk': 'redux-thunk',
        'react-popo': 'react-popo'
    }
};
