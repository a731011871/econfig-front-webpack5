const os = require('os');
const iFaces = os.networkInterfaces();
const {sep} = require('path');

exports.DevUtil = class DevUtil {
    static getLocalHost() {
        let host = '127.0.0.1';

        for (const dev in iFaces) {
            if (iFaces.hasOwnProperty(dev)) {
                iFaces[ dev ].forEach(function(details) {
                    if (
                        details.family === 'IPv4' &&
                        details.address.indexOf('192.168') >= 0
                    ) {
                        host = details.address;
                    }
                });
            }
        }

        return host;
    }

    static stringifyEnv(env) {
        const { NODE_ENV, BUILD_ENV } = process.env;
        console.log(env);
        return {
            'process.env': JSON.stringify({
                NODE_ENV,
                BUILD_ENV,
                ...env
            })
        };


    }

    static getPublicPath() {
        const cwd = process.cwd();
        const path = cwd.split(sep);
        const currentDirName = path[ path.length - 1 ];

        return `/${currentDirName}/`;
    }

    static getOutputFileName(env) {
        return env === 'development'
            ? 'assets/js/[name].js'
            : 'assets/js/[name].[chunkhash:7].js';
    }
};
