const {DevUtil} = require('./utils');
const {resolve} = require('path');

exports.globalConfig ={
    host: DevUtil.getLocalHost() ,
    // publicPath: DevUtil.getPublicPath() ,
    publicPath: '/econfig/' ,
    port: 9080,
    outputPath: resolve('dist')
};


