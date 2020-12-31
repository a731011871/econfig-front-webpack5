import tmsRequest from 'tms-request-tenant';
import { clearAllCache, getCurrentLanguage } from 'utils/utils';

const status = {
    '500': {
        msg: {
            zh_CN: '服务器错误!',
            en_US: 'server error!'
        }
    },
    '405': {
        msg: {
            zh_CN: '登陆已失效!',
            en_US: 'Login has expired!'
        }
    },
    '406': {
        msg: {
            zh_CN: '当前账号在其他地方登陆!',
            en_US: 'current account has been logged in elsewhere!'
        }
    },
    '407': {
        msg: {
            zh_CN: '当前会话已失效!',
            en_US: 'current account has been logged in elsewhere!'
        }
    }
};

const errorResponseInterceptor = error => {
    const defaultMessage = {
        zh_CN: '系统服务超时!',
        en_US: 'System service timed out!'
    };
    if (error) {
        if (error.code === 'ECONNABORTED') {
            const locale =
                localStorage.getItem('econfigLanguage') ||
                (
                    JSON.parse(
                        localStorage.getItem('sso_loginAccountInfo') || '{}'
                    ).selectLanguage || {}
                ).key;
            return Promise.reject({
                message: defaultMessage[locale],
                code: null
            });
        }
        return Promise.reject({
            message: error.message || defaultMessage,
            code: null
        });
    }
    return Promise.reject({
        message: defaultMessage,
        code: null
    });
};

export const $http = tmsRequest.create({
    timeout: 100000,
    responseInterceptor: response => {
        const {
            data: { errors = [] }
        } = response;
        if (Array.isArray(errors) && errors.length) {
            const firstError = errors[0];
            const code = firstError.code;
            if (code in status) {
                const locale =
                    localStorage.getItem('econfigLanguage') ||
                    (
                        JSON.parse(
                            localStorage.getItem('sso_loginAccountInfo') || '{}'
                        ).selectLanguage || {}
                    ).key;
                const { msg } = status[code];
                if (code === '405' || code === '406' || code === '407') {
                    setTimeout(() => {
                        clearAllCache();
                        window.location.href = '/login/';
                    }, 3000);
                }
                return Promise.reject({
                    message: msg[locale],
                    code
                });
            }
        }
        return response;
    },
    errorResponseInterceptor,
    headers: {
        'TM-HEADER-DOMAIN': window.location.origin,
        'TM-Header-Locale': getCurrentLanguage()
    },
    cache: true
});

/**
 create 方法配置
 {
    //是否要过滤Null值与Undefined 默认值为false
    filter: false ,
    //是否要添加防缓存随机数 默认为false
    cache: false ,
    //响应拦截器 加载于内置响应拦截器前 请谨慎使用 使用后请完整返回修改过后的response
    responseInterceptor: response => response ,
    //请求拦截器 加载于内置请求拦截器前 请谨慎使用 使用后请完整返回修改过后的config
    requestInterceptor: config => config ,
    //默认请求方法 默认为get 即使用$http.request的使用在不传入method时执行的请求动作
    method: 'get' ,
    //请求url前缀
    baseURL: '/ccp-web' ,
    //默认要携带的请求头
    headers: {
        'TMS-TOKEN': 'SSSSS'
    } ,
    //超时时间 默认为5秒
    timeout: 5000 ,
    //上传进度回调 建议在请求级别配置添加
    onUploadProgress: progressEvent => progressEvent ,
    //下载进度回调 建议在请求级别配置添加
    onDownloadProgress: progressEvent => progressEvent
    //还有更多配置项 请参考axios官方文档 翻阅配置api
}

 */
