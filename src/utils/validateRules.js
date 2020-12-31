import { i18nMessages } from 'src/i18n';

export function getRequiredRule(fieldName, intl) {
    return {
        required: true,
        message: intl(i18nMessages.ECONFIG_FRONT_A0325).replace(
            'xxx',
            fieldName
        )
    };
}
export function whitespaceRule(fieldName, intl) {
    return {
        whitespace: true,
        message: intl(i18nMessages.ECONFIG_FRONT_A0326).replace(
            'xxx',
            fieldName
        )
    };
}

export function emailRule(fieldName, intl) {
    return {
        type: 'email',
        message: intl(i18nMessages.ECONFIG_FRONT_A0327).replace(
            'xxx',
            fieldName
        )
    };
}

export function isEmail (str) {
    const emailReg = /^[\w-]+(\.[\w-]+)*\.?@[\w-]+(\.[\w-]+)*\.[\w-]+$/i;
    return emailReg.test(str);
}

export function isName (name) {
    const nameReg = /^[A-Za-z0-9\u4e00-\u9fa5\-\.\_]+$/;
    return nameReg.test(name);
}
