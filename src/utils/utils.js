import CryptoJS from 'crypto-js';

const CRYPTOJSKEY = '4028eea46a5e4cf6016a5e4cf6f70000';

export const DEFAULT_PAGE_DATAS = {
    logo: 'http://static.mobilemd.cn/public/nf/logo.png', // logo
    themeColor: '#E3722D', // 主题色
    taimeiLogo: 'http://static.mobilemd.cn/public/lib/logo/0.0.1/logo3.png', // 太美logo
    ctaimeiLogo: 'http://static.mobilemd.cn/public/lib/logo/0.0.1/logo1.png',
    corporateBanner: 'http://static.mobilemd.cn/public/nf/corporateBanner.jpeg', // banner
    appName: '临床实验机构管理系统' // app名称
};

// 这些应用下的角色有适用项目
export const ROLE_IS_PROJECT = ['esupply', 'edc'];

//清除缓存
export function clearAllCache() {
    // localStorage.clear();
    sessionStorage.clear();

    const keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    const patt = /(\.[a-z0-9]+\.(cn|com))$/;
    let cookieVal2 = `=0;path=/;expires=${new Date(0).toUTCString()}`;

    if (patt.test(location.hostname)) cookieVal2 += `;domain=${RegExp.$1}`;

    if (keys) {
        for (let i = keys.length; i--; ) {
            document.cookie = `${keys[i]}=0;path=/csp;expires=${new Date(
                0
            ).toUTCString()}`;
            document.cookie = keys[i] + cookieVal2;
        }
    }
}

/**
 * 判断是否是IE11
 * @returns boolean
 */
export function isIE11() {
    if (/Trident\/7\./.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

// 跳转页面
export function jumpPage(url) {
    const domA = document.createElement('a');
    domA.target = '_blank';
    domA.href = url;
    document.body.appendChild(domA);
    domA.click();
    domA.remove();
}

//数据为空过滤
export function formatEmpty(text) {
    return text ? text : '-';
}

// 文本框通用校验
export function textValidate() {
    return function(rule, value, callback) {
        if (/<("[^"]*"|'[^']*'|[^'">])*>/.test(value)) {
            callback(`请不要填写<>或</>标签`);
        }
        callback();
    };
}

export function tmsEncodeURIComponent(obj) {
    return encodeURIComponent(JSON.stringify(obj));
}

export function tmsDecodeURIComponent(str) {
    return JSON.parse(decodeURIComponent(str));
}

// 获取cookie
export const getCookie = function(name) {
    const regexp =
        document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`)) || [];
    return regexp[2];
};

export const isIE = function() {
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        return true;
    } else {
        return false;
    }
};

export const getCurrentLanguage = function() {
    return (
        localStorage.getItem('econfigLanguage') ||
        (
            JSON.parse(localStorage.getItem('sso_loginAccountInfo') || '{}')
                .selectLanguage || {}
        ).key
    );
};

export const timeZones = [
    {
        name: 'UTC(都柏林)',
        value: '0',
        i18nKey: 'ECONFIG_FRONT_A0596'
    },
    {
        name: 'UTC+1(罗马)',
        value: '+1',
        i18nKey: 'ECONFIG_FRONT_A0597'
    },
    {
        name: 'UTC+2(安曼)',
        value: '+2',
        i18nKey: 'ECONFIG_FRONT_A0598'
    },
    {
        name: 'UTC+3(莫斯科)',
        value: '+3',
        i18nKey: 'ECONFIG_FRONT_A0599'
    },
    {
        name: 'UTC+4(巴库)',
        value: '+4',
        i18nKey: 'ECONFIG_FRONT_A0600'
    },
    {
        name: 'UTC+5(塔什干)',
        value: '+5',
        i18nKey: 'ECONFIG_FRONT_A0601'
    },
    {
        name: 'UTC+6(阿斯塔纳)',
        value: '+6',
        i18nKey: 'ECONFIG_FRONT_A0602'
    },
    {
        name: 'UTC+7(曼谷)',
        value: '+7',
        i18nKey: 'ECONFIG_FRONT_A0603'
    },
    {
        name: 'UTC+8(北京)',
        value: '+8',
        i18nKey: 'ECONFIG_FRONT_A0604'
    },
    {
        name: 'UTC+9(东京)',
        value: '+9',
        i18nKey: 'ECONFIG_FRONT_A0605'
    },
    {
        name: 'UTC+10(悉尼)',
        value: '+10',
        i18nKey: 'ECONFIG_FRONT_A0606'
    },
    {
        name: 'UTC+11(所罗门群岛)',
        value: '+11',
        i18nKey: 'ECONFIG_FRONT_A0607'
    },
    {
        name: 'UTC+12(斐济)',
        value: '+12',
        i18nKey: 'ECONFIG_FRONT_A0608'
    },
    {
        name: 'UTC-1(亚速尔群岛)',
        value: '-1',
        i18nKey: 'ECONFIG_FRONT_A0609'
    },
    {
        name: 'UTC-2(协调世界时间-02)',
        value: '-2',
        i18nKey: 'ECONFIG_FRONT_A0610'
    },
    {
        name: 'UTC-3(格陵兰)',
        value: '-3',
        i18nKey: 'ECONFIG_FRONT_A0611'
    },
    {
        name: 'UTC-4(圣地亚哥)',
        value: '-4',
        i18nKey: 'ECONFIG_FRONT_A0612'
    },
    {
        name: 'UTC-5(切图马尔)',
        value: '-5',
        i18nKey: 'ECONFIG_FRONT_A0613'
    },
    {
        name: 'UTC-6(中美洲)',
        value: '-6',
        i18nKey: 'ECONFIG_FRONT_A0614'
    },
    {
        name: 'UTC-7(亚利桑那)',
        value: '-7',
        i18nKey: 'ECONFIG_FRONT_A0615'
    },
    {
        name: 'UTC-8(下加利福尼亚州)',
        value: '-8',
        i18nKey: 'ECONFIG_FRONT_A0616'
    },
    {
        name: 'UTC-9(阿拉斯加)',
        value: '-9',
        i18nKey: 'ECONFIG_FRONT_A0617'
    },
    {
        name: 'UTC-10(夏威夷)',
        value: '-10',
        i18nKey: 'ECONFIG_FRONT_A0618'
    },
    {
        name: 'UTC-11(协调世界时-11)',
        value: '-11',
        i18nKey: 'ECONFIG_FRONT_A0619'
    },
    {
        name: 'UTC-12(国际日期变更线西)',
        value: '-12',
        i18nKey: 'ECONFIG_FRONT_A0620'
    }
];

// 上传文件签名算法
export const encrypt = plaintText => {
    const options = {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    };
    const key = CryptoJS.enc.Utf8.parse(CRYPTOJSKEY);
    const encryptedData = CryptoJS.AES.encrypt(plaintText, key, options);
    const encryptedBase64Str = encryptedData.toString();
    return CryptoJS.SHA256(encryptedBase64Str).toString(CryptoJS.enc.Hex);
};

export const findDepartmentById = (deparmentList, organId) => {
    let data;
    (deparmentList || []).forEach(department => {
        if (department.id === organId) {
            data = department;
        } else if (department.children) {
            const child = findDepartmentById(department.children, organId);
            if (child) {
                data = child;
            }
        }
        return;
    });
    return data;
};
