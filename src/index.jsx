// 解决第三方包引用startsWith等方法
// import '@babel/polyfill';
// 解决ie10 intl无法解析的问题
import 'intl-polyfill';
import React from 'react';
import PropTypes from 'prop-types';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { render } from 'react-dom';
import App from 'src/view/app';
import CheckModalForm from 'src/view/checkModalForm';
import { ConfigProvider, message } from 'antd';
// import zh_CN from 'antd/lib/locale-provider/zh_CN';
// import en_US from 'antd/lib/locale-provider/en_US';
import zh_CN from 'antd/es/locale/zh_CN';
import en_US from 'antd/es/locale/en_US';
import { IntlProvider, addLocaleData } from 'react-intl';
// import { SpinContainer } from 'container/layout';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import { PopoContainer } from 'src/model';
import { getCurrentLanguage } from 'utils/utils';
import moment from 'moment';
// import skynet from '@tms/skynet-sdk';
// import pkg from '../package.json';
import { finishLaunch } from '@tms/common-perf/lib/launch-loading/index';

addLocaleData([...en, ...zh]);

import 'moment/locale/zh-cn';
moment.locale('zh-cn');

// if (process.env.BUILD_ENV === 'test') {
//     skynet({
//         appId: 'econfig',
//         appSecret: '7f3c6629b87b8f0affa48773e7bf5171',
//         record: 'false',
//         appVer: pkg.version,
//         httpEvent: true
//         // gateway: '/api/skynet-gateway',
//     });
// }

class Root extends React.Component {
    constructor(props) {
        super(props);
        // econfig语言跟你trialos来决定
        let currentLanguage = '';
        if (localStorage.getItem('econfigLanguage')) {
            currentLanguage =
                localStorage.getItem('econfigLanguage') ||
                (
                    JSON.parse(
                        localStorage.getItem('sso_loginAccountInfo') || '{}'
                    ).selectLanguage || {}
                ).key ||
                'zh_CN';
        } else {
            currentLanguage =
                (
                    JSON.parse(
                        localStorage.getItem('sso_loginAccountInfo') || '{}'
                    ).selectLanguage || {}
                ).key || 'zh_CN';
        }
        this.state = {
            open: false, // 页面是否渲染
            messagesData: {}, // 国际化内容
            currentUserMenu: [], // 当前用户菜单
            currentLanguage, // 当前语言
            phoneCheckModal: false,
            phoneCheckInfo: {},
            globalization: false, // 是否为国际化域名
            isMaintain: false, // 是否展示维护页
            maintainHtml: '' // 维护页HTML
        };
    }

    // 语言对应的Map
    langMap = {
        zh_CN: {
            intl: 'zh',
            locale: zh_CN
        },
        en_US: {
            intl: 'en',
            locale: en_US
        }
    };

    async componentWillMount() {
        const pathname = window.location.pathname;
        const { currentLanguage } = this.state;
        const tenantId =
            JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}')
                .tenantId || '';
        try {
            const notice =
                (await $http.post(urls.getMaintainPage, '/econfig')) || [];
            const content = notice?.pop();
            const startTime = new Date(content?.startTime).getTime();
            const endTime = new Date(content?.endTime).getTime();
            const currentTime = new Date().valueOf();
            if (currentTime >= startTime && currentTime <= endTime) {
                this.setState({
                    isMaintain: true,
                    maintainHtml: content.content || ''
                });
                return;
            }
        } catch (e) {
            message.error(e.message);
        }

        if (
            pathname.indexOf('/econfig/authuser') >= 0 ||
            pathname.indexOf('/econfig/authplugin') >= 0 ||
            pathname.indexOf('/econfig/resetpassword') >= 0 ||
            pathname.indexOf('/econfig/emailpage') >= 0
        ) {
            try {
                const locale = currentLanguage || 'zh_CN';
                const messagesData = await $http.post(urls.getI18nValues, {
                    locale,
                    appId: 'econfig',
                    tenantId
                });
                this.setState({
                    messagesData,
                    open: true
                });
            } catch (e) {
                message.error(e.message);
            }
        } else {
            try {
                const userId = JSON.parse(
                    sessionStorage.getItem('sso_loginInfo') || '{}'
                ).userId;
                // const  = await ;
                // const  = await ;
                const locale = currentLanguage || 'zh_CN';
                // const  = await ;
                /**
                 * 获取是否为国际化域名
                 * (是) 返回要返回到edc
                 * (否) 返回要返回到trialos
                 */
                const [
                    phoneCheckModal,
                    currentUserMenu,
                    messagesData,
                    systemConfig
                ] = await Promise.all([
                    $http.post(
                        `${urls.checkTwofactorAuthentication}?userId=${userId}`
                    ),
                    $http.post(urls.getCurrentUserMenu),
                    $http.post(urls.getI18nValues, {
                        locale,
                        appId: 'econfig',
                        tenantId
                    }),
                    $http.get(urls.getSystemConfig)
                ]);

                const globalization =
                    (systemConfig.internationalAddress || '')
                        .split(',')
                        .indexOf(window.location.origin) > -1;
                if (
                    currentUserMenu === undefined ||
                    currentUserMenu.length === 0
                ) {
                    message.error('接口返回菜单数据为空!');
                    return;
                }
                this.setState({
                    globalization,
                    messagesData,
                    currentUserMenu,
                    phoneCheckModal: phoneCheckModal.admin,
                    phoneCheckInfo: phoneCheckModal,
                    open: true
                });
            } catch (e) {
                message.error(e.message);
            }
        }
    }

    componentDidUpdate() {
        if (this.state.isMaintain || this.state.open) {
            setTimeout(() => {
                finishLaunch(true);
            }, 200); //让接口先请求 200ms, 避免进来又出现 loading
        }
    }

    // 点击app里面的中/英文切换渲染页面
    changeLanguage = async currentLanguage => {
        const tenantId =
            JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}')
                .tenantId || '';
        try {
            this.setState({
                open: false
            });
            const messagesData = await $http.post(urls.getI18nValues, {
                appId: 'econfig',
                locale: currentLanguage,
                tenantId
            });
            localStorage.setItem('econfigLanguage', currentLanguage);
            $http.defaults.headers['TM-Header-Locale'] = getCurrentLanguage();

            /**
             * 设置sso_loginAccountInfo
             * ******************
             */
            let loginAccountInfo = localStorage.getItem('sso_loginAccountInfo');
            loginAccountInfo = JSON.parse(loginAccountInfo) || {};
            loginAccountInfo['selectLanguage'] = {
                name: currentLanguage === 'en_US' ? 'English' : '简体中文',
                key: currentLanguage
            };
            localStorage.setItem(
                'sso_loginAccountInfo',
                JSON.stringify(loginAccountInfo)
            );
            // *******************
            this.setState({
                messagesData,
                currentLanguage,
                open: true
            });
        } catch (e) {
            message.error(e.message);
        }

        try {
        } catch (e) {
            console.log(e);
        }
    };

    loadApp = () => {
        this.setState({
            phoneCheckModal: false
        });
    };

    render() {
        const {
            messagesData,
            currentLanguage = 'zh_CN',
            open,
            phoneCheckModal,
            phoneCheckInfo,
            isMaintain,
            maintainHtml
        } = this.state;

        if (isMaintain) {
            return (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: maintainHtml }} />
                </div>
            );
        }

        if (open) {
            return (
                <ConfigProvider locale={this.langMap[currentLanguage].locale}>
                    <IntlProvider
                        locale={this.langMap[currentLanguage].intl}
                        messages={messagesData}
                    >
                        <PopoContainer>
                            {phoneCheckModal ? (
                                <CheckModalForm
                                    info={phoneCheckInfo}
                                    loadApp={this.loadApp}
                                    language={currentLanguage}
                                />
                            ) : (
                                <App />
                            )}
                        </PopoContainer>
                    </IntlProvider>
                </ConfigProvider>
            );
        }

        return (
            <div
                style={{ width: '100%', height: '100%', background: '#fff' }}
            />
        );
    }

    // 通过context下发当前的语言类型,菜单,切换语言方法
    static childContextTypes = {
        currentLanguage: PropTypes.string,
        changeLanguage: PropTypes.func,
        currentUserMenu: PropTypes.array,
        globalization: PropTypes.boolean
    };

    getChildContext() {
        return {
            currentLanguage: this.state.currentLanguage,
            changeLanguage: this.changeLanguage,
            currentUserMenu: this.state.currentUserMenu,
            globalization: this.state.globalization
        };
    }

    // 组件即将销毁
    componentWillUnmount() {
        localStorage.removeItem('econfigLanguage');
    }
}

render(<Root />, document.getElementById('root'));

module.hot && module.hot.accept();
