
import urls, { getQueryString } from 'utils/urls';
import { message } from 'antd';
import { $http } from 'utils/http';

/**
 * 单页面统一登录跳转到sso页面
 * @param {用户} accountName 
 * @param {密码} accountPswd 
 */
export const asyncJumpLogin = async (accountName, accountPswd) => {
    try {
        const data = await $http.post(urls.userLogin, {
            accountName,
            accountPswd
        });
        message.success('登录成功!', 2);
        // 把状态记录进去
        localStorage.setItem('sso_loginInfo', JSON.stringify({
            expired: data.expired,
            data: []
        }), true);
        window.location.href = '/select';
    } catch (e) {
        message.error(e.message);
        window.location.href = '/login';
    }
};

/**
 * 发邮件页面统一校验用户名
 * @param {*} rule 
 * @param {*} value 
 * @param {*} callback 
 */
export const validatorName = async (rule, value, callback) => {
    const url = window.location.href;
    const email = getQueryString('email', url) || '';
    if (!!value) {
        try {
            const result = await $http.get(urls.checkAccountNameIsValid, {
                accountName: value,
                email
            });
            if (!result) {
                callback('用户名已经存在!');
            }
        } catch (e) {
            message.error(e.message);
        }
        callback();
    }
};

/**
 * 验证两次密码是否一致
 * @param {*} value 
 * @param {*} callback 
 */
export const validatorPassWord = (form) => {
    return function(rule, value, callback) {
        const { getFieldValue } = form;
        if (getFieldValue('accountPswd') !== getFieldValue('accountPswdTo')) {
            callback('两次输入不一致！');
        }
        callback();
    };
};

/**
 * 密码策略统一校验
 * @param {*} info 
 * @param {*} form 
 */
export const doPwdStrategy = (info, form) => {
    return function (rule, value, callback) {
        const { getFieldValue } = form;
        const arr = Object.keys(info);
        if (arr.length === 0) callback();
        if (/(^\s+)|(\s+$)|\s+/g.test(value)) callback('密码不能包含空格!');
        if (value && value !== '' && value !== undefined) {
            const regEn = /[.*?[!@#$%^*(){}:~\]+.*?]/im;
            const pw = value.split('') || [];
            const nonumbers = pw.filter(
                item => {
                    if (/^[a-zA-Z]+$/.test(item)) {
                        return item;
                    }
                }
            ).length;
            const numbers = pw.filter(
                item => {
                    if (/^[0-9]+$/.test(item)) {
                        return item;
                    }
                }
            ).length;
            if (info.containsUpperAndLower === 1 && (/^[0-9A-Z]*$/.test(value) || /^[0-9a-z]*$/.test(value))) {
                callback('必须同时含有大小写字符');
            } else if ((info.minCharacterContains !== 0) && (nonumbers < info.minCharacterContains)) {
                callback(`最少含有${info.minCharacterContains}个字符`);
            } else if (info.minNumContains !== 0 && numbers < info.minNumContains) {
                callback(`最少含有${info.minNumContains}个数字`);
            } else if (info.minPwdLength !== 0 && pw.length < info.minPwdLength) {
                callback(`最小密码长度为${info.minPwdLength}`);
            } else if ((info.specialCharacterContains === 1) && !regEn.test(value)) {
                callback(`密码必须包含特殊字符`);
            }
            if (getFieldValue('accountPswdTo') === undefined) {
                callback();
            } else {
                form.validateFields(['accountPswdTo'], {
                    force: true
                });
            }
            callback();
        } else {
            callback('密码不允许为空');
        }
    };
};