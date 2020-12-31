import React, { Suspense, lazy } from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { getCookie } from 'utils/utils';
import { injectIntl } from 'react-intl';
import { Icon, message, Dropdown, Menu, Popover } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
// import fakeMenuList from 'src/router/fakeMenuList';
import { NavLink, Switch, Router, Route, Redirect } from 'react-router-dom';
import { history } from '../router';
import { permissionRouters } from '../router/permission';
import {
    EConfigContainer,
    EConfigHeader,
    EConfigHeaderMenu,
    EConfigSwitch
} from 'container/layout';
import { i18nMessages } from 'src/i18n';
// import { getNewMenus } from 'src/utils/menuChange';
const EmailPage = lazy(() => import('./emailPage'));
const ResetPass = lazy(() => import('./emailPage/resetPass'));
const AuthUser = lazy(() => import('./authUser'));
const AuthPlugin = lazy(() => import('./authPlugin'));
const Test = lazy(() => import('./baseInfo/indexcssign'));
const SignRedirect = lazy(() => import('./signredirect/index'));
const PdfPreviewPage = lazy(() => import('./pdfPreviewPage/index'));
// import 'antd/dist/antd.less';
import 'assets/style/index.less';
import 'assets/style/basic.css';

// import returnSvg from 'assets/images/return.svg';

@injectIntl
class Authority extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        econfigMenu: [], // 接口加载的菜单数据
        secondaryMenu: [], // 二级菜单
        verManual: {}
    };

    componentWillMount() {
        const { currentUserMenu = [] } = this.context;
        // 老菜单
        const econfigMenu = this.menuDataChange(currentUserMenu[0].children);
        // 新菜单
        // const m = getNewMenus(currentUserMenu[0].children);
        // const econfigMenu = this.menuDataChange(m);

        this.initRoute(econfigMenu);
        this.getVerManual();
        this.setState({
            econfigMenu
        });
    }

    getVerManual = async () => {
        try {
            const verManual = await $http.get(
                `${urls.getVerManual}?appId=econfig`
            );
            this.setState({ verManual });
        } catch (error) {
            message.error(error.message);
        }
    };

    // 初始化或者刷新页面的时候重新加载二级路由
    initRoute = (econfigMenu = []) => {
        const {
            location: { pathname }
        } = this.props;
        if (pathname === '/') {
            this.secondaryMenuEvent(econfigMenu[0]);
            return;
        }
        econfigMenu.map(item => {
            if (pathname.indexOf(item.code) === 1) {
                this.secondaryMenuEvent(item);
            }
        });
    };

    // 菜单数据重组
    menuDataChange = trialosList => {
        const list = trialosList.map(one => {
            if (one.children && one.children.length > 0) {
                one.children.map(two => {
                    two.parentCode = one.code;
                    return two;
                });
            }
            return one;
        });
        return list;
    };

    // 二级菜单加载
    secondaryMenuEvent = item => {
        this.setState({
            secondaryMenu: item.children || []
        });
    };

    // 路由切换
    getRouters = econfigMenu => {
        // 包装一级路由
        const routes = econfigMenu.map(item => (
            <Route
                key={item.code}
                path={`/${item.code}`}
                render={props => {
                    const Component = permissionRouters[item.code];
                    return <Component {...props} />;
                }}
            />
        ));
        // 包装二级路由
        const secondaryRouters = this.getSecondaryRouters(econfigMenu);
        // 路由重定向
        const redirectArr = [
            <Redirect
                exact
                key={`index`}
                path={`/`}
                to={`${econfigMenu[0].code}`}
            />
        ];

        return [...secondaryRouters, ...routes, ...redirectArr];
    };

    // 获取二级路由的Route已经重定向
    getSecondaryRouters = fakeMenuList => {
        let routers = [],
            redirectArr = [];
        fakeMenuList &&
            fakeMenuList.forEach(item => {
                if (item.children && item.children.length > 0) {
                    const menu = item.children;
                    const menuRouters = menu.map(c => {
                        return (
                            <Route
                                key={`${c.parentCode}/${c.code}`}
                                path={`/${c.parentCode}/${c.code}`}
                                render={props => {
                                    const Component = permissionRouters[c.code];
                                    return <Component {...props} />;
                                }}
                            />
                        );
                    });
                    const redorectMenuRouters = menu.map(c => {
                        return (
                            <Redirect
                                exact
                                key={`${c.code}`}
                                path={`/${c.parentCode}`}
                                to={`/${c.parentCode}/${c.code}`}
                            />
                        );
                    });
                    routers = routers.concat(menuRouters);
                    redirectArr = redirectArr.concat(redorectMenuRouters);
                }
            });
        return [...routers, ...redirectArr];
    };

    showPdfPreview = fileId => {
        window.open(`/econfig/pdfPreview?fileId=${fileId || ''}`);
    };

    render() {
        const { econfigMenu = [], secondaryMenu = [] } = this.state;
        const sso_loginInfo =
            JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}') || {};

        const menu = (
            <Menu>
                <Menu.Item>
                    <a
                        onClick={() => {
                            localStorage.removeItem('econfigLanguage');
                        }}
                        className="return-button-item"
                        rel="noopener noreferrer"
                        href={
                            this.context.globalization
                                ? '/edc/#/international'
                                : '/'
                        }
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0646
                        )}
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a
                        className="return-button-item"
                        rel="noopener noreferrer"
                        onClick={async () => {
                            try {
                                await $http.post(urls.loginOut);
                            } catch (e) {
                            } finally {
                                localStorage.removeItem('sso_loginInfo');
                                localStorage.removeItem('environmentToken');
                                localStorage.removeItem('econfigLanguage');
                                sessionStorage.removeItem('sso_loginInfo');
                                sessionStorage.removeItem('environmentToken');
                                sessionStorage.removeItem('econfigLanguage');
                                window.location.href = '/login/';
                            }
                        }}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0647
                        )}
                    </a>
                </Menu.Item>
            </Menu>
        );

        return (
            <EConfigContainer>
                <EConfigHeader>
                    <div className="e_config_header_left">
                        <div className="e_config_logo">
                            <span className="e_config_logo_text">eConfig</span>
                        </div>
                        <ul>
                            {econfigMenu.map(item => {
                                return (
                                    <li key={item.code}>
                                        <NavLink
                                            onClick={() =>
                                                this.secondaryMenuEvent(item)
                                            }
                                            to={`/${item.code}`}
                                            activeClassName="active"
                                        >
                                            {this.props.intl.formatMessage(
                                                i18nMessages[item.i18nKey] ||
                                                    i18nMessages[
                                                        'ECONFIG_FRONT_A0729'
                                                    ]
                                            )}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="e_config_header_right">
                        <ul>
                            {sso_loginInfo.userName ? (
                                <li>
                                    <a
                                        href="javascript:void(0)"
                                        title={`Hi,${sso_loginInfo.userName ||
                                            ''}`}
                                    >
                                        Hi,{sso_loginInfo.userName || ''}{' '}
                                        <Icon type="user" />
                                    </a>
                                </li>
                            ) : null}
                            {sso_loginInfo.tenantName ? (
                                <li className="tenant_name">
                                    <a
                                        href="javascript:void(0)"
                                        title={sso_loginInfo.tenantName || ''}
                                    >
                                        {this.context.currentLanguage ===
                                        'en_US'
                                            ? sso_loginInfo.enTenantName ||
                                              sso_loginInfo.tenantName ||
                                              ''
                                            : sso_loginInfo.tenantName || ''}
                                    </a>
                                </li>
                            ) : null}
                            <li>
                                <a
                                    href="javascript:void(0)"
                                    onClick={this.onChangeLanguage}
                                >
                                    {this.context.currentLanguage === 'zh_CN'
                                        ? 'English'
                                        : '中文'}
                                </a>
                            </li>
                            <li
                                className="return TxtCenter"
                                style={{
                                    width: 36,
                                    borderLeft: '1px solid #fff',
                                    marginLeft: 16,
                                    paddingLeft: 16
                                }}
                            >
                                <Popover
                                    placement="bottomRight"
                                    title={null}
                                    content={
                                        <div
                                            style={{
                                                width: 320,
                                                height: 250,
                                                overflow: 'auto'
                                            }}
                                        >
                                            <a
                                                style={{ maxWidth: 270 }}
                                                title={
                                                    this.state.verManual.fileVo
                                                        ?.fileName || ''
                                                }
                                                className="overflow_ellipsis mTop12 mBottom24"
                                                onClick={() =>
                                                    this.showPdfPreview(
                                                        this.state.verManual
                                                            .fileVo?.fileId
                                                    )
                                                }
                                            >
                                                {this.state.verManual.fileVo
                                                    ?.fileName || ''}
                                            </a>
                                            <ul className="">
                                                {this.state.verManual.versionVO?.map(
                                                    item => (
                                                        <li
                                                            key={
                                                                item.fileVos[0]
                                                                    ?.fileId
                                                            }
                                                        >
                                                            <span
                                                                style={{
                                                                    width: 50
                                                                }}
                                                                className="overflow_ellipsis mRight12"
                                                                title={
                                                                    item?.versionName
                                                                }
                                                            >
                                                                {
                                                                    item?.versionName
                                                                }
                                                            </span>
                                                            <a
                                                                style={{
                                                                    width: 150
                                                                }}
                                                                title={
                                                                    item
                                                                        .fileVos[0]
                                                                        ?.fileName
                                                                }
                                                                className="overflow_ellipsis mBottom12 mRight12 TxtMiddle"
                                                                onClick={() =>
                                                                    this.showPdfPreview(
                                                                        item
                                                                            .fileVos[0]
                                                                            ?.fileId
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    item
                                                                        .fileVos[0]
                                                                        ?.fileName
                                                                }
                                                            </a>
                                                            <span
                                                                style={{
                                                                    width: 70
                                                                }}
                                                                className="overflow_ellipsis"
                                                                title={
                                                                    item.publishTime
                                                                        ? moment(
                                                                              item.publishTime
                                                                          ).format(
                                                                              'YYYY-MM-DD'
                                                                          )
                                                                        : ''
                                                                }
                                                            >
                                                                {item.publishTime
                                                                    ? moment(
                                                                          item.publishTime
                                                                      ).format(
                                                                          'YYYY-MM-DD'
                                                                      )
                                                                    : ''}
                                                            </span>
                                                        </li>
                                                    )
                                                ) || null}
                                            </ul>
                                        </div>
                                    }
                                    trigger="click"
                                >
                                    {/* <Tooltip
                                        placement="bottom"
                                        title="用户指南"
                                    > */}
                                    <Icon
                                        className="pointer"
                                        type="question-circle"
                                        style={{
                                            color: '#fff',
                                            fontSize: 17,
                                            marginTop: 18
                                        }}
                                    />
                                    {/* </Tooltip> */}
                                </Popover>
                            </li>
                            {/* <li>
                                <a
                                    onClick={() => {
                                        localStorage.removeItem(
                                            'econfigLanguage'
                                        );
                                    }}
                                    href={ this.context.globalization ? '/edc/#/international' : '/' }
                                >
                                    {this.context.currentLanguage === 'en_US'
                                        ? 'Return'
                                        : '返回'}
                                </a>
                            </li> */}
                            <li
                                className="return TxtCenter mRight25"
                                style={{ width: 20 }}
                            >
                                <Dropdown
                                    overlay={menu}
                                    overlayClassName="return-button"
                                >
                                    <Icon
                                        className="pointer"
                                        type="logout"
                                        style={{
                                            fontSize: 17,
                                            color: '#fff',
                                            marginTop: 18
                                        }}
                                    />
                                    {/* <a href="javascript:void(0)">
                                        <img src={returnSvg} />
                                    </a> */}
                                </Dropdown>
                            </li>
                        </ul>
                    </div>
                </EConfigHeader>
                {secondaryMenu.length !== 0 ? (
                    <EConfigHeaderMenu>
                        <ul>
                            {secondaryMenu.map(item => {
                                if (item.code === 'question_manage') {
                                    return (
                                        <li key={item.code}>
                                            <a
                                                href="/query/authorityList"
                                                target="_blank"
                                            >
                                                {this.props.intl.formatMessage(
                                                    i18nMessages[item.i18nKey]
                                                )}
                                            </a>
                                        </li>
                                    );
                                }
                                return (
                                    <li key={item.code}>
                                        <NavLink
                                            to={`/${item.parentCode}/${item.code}`}
                                            activeClassName="active"
                                        >
                                            {this.props.intl.formatMessage(
                                                i18nMessages[item.i18nKey] ||
                                                    i18nMessages[
                                                        'ECONFIG_FRONT_A0729'
                                                    ]
                                            )}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </EConfigHeaderMenu>
                ) : null}
                <EConfigSwitch
                    className={
                        secondaryMenu.length !== 0
                            ? 'econfig-switch-top100'
                            : 'econfig-switch-top50'
                    }
                >
                    <Suspense fallback={null}>
                        <Switch>{this.getRouters(econfigMenu)}</Switch>
                    </Suspense>
                </EConfigSwitch>
            </EConfigContainer>
        );
    }

    onChangeLanguage = async () => {
        const token = getCookie('token');
        const lanaguageType =
            this.context.currentLanguage === 'zh_CN' ? 'en_US' : 'zh_CN';
        try {
            await $http.post(urls.resetLanguage, {
                lanaguageType,
                token
            });
            this.context.changeLanguage(lanaguageType);
        } catch (e) {
            message.error(e.message);
        }
    };

    static contextTypes = {
        currentLanguage: PropTypes.string,
        changeLanguage: PropTypes.func,
        currentUserMenu: PropTypes.array,
        globalization: PropTypes.boolean
    };
}

class App extends React.Component {
    render() {
        return (
            <Router history={history}>
                <Suspense fallback={null}>
                    <Switch>
                        <Route path="/test" component={Test} />
                        <Route path="/pdfPreview" component={PdfPreviewPage} />
                        <Route path="/signredirect" component={SignRedirect} />
                        <Route path="/resetpassword" component={ResetPass} />
                        <Route path="/emailpage" component={EmailPage} />
                        <Route path="/authuser" component={AuthUser} />
                        <Route path="/authplugin" component={AuthPlugin} />
                        <Route path="/" component={Authority} />
                    </Switch>
                </Suspense>
            </Router>
        );
    }
}

export default App;
