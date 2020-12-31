import React from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import { message, Button, Modal } from 'antd';
import { fieldHasError } from 'utils/fieldHasError';
import { LoadingHoc } from 'component/LoadingHoc';
import { $http } from 'utils/http';
import urls, { getQueryString, parseApiUrl } from 'utils/urls';
import { getBasicInfoAreaValues, getDataFromArea } from 'utils/functions';
import { find, debounce } from 'lodash';
import AuthPage from './authPage';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import BasicInfo from './basicInfo';
import { deptService } from 'src/service/deptService';

const FixedDiv = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: 60px;
    line-height: 60px;
    z-index: 3;
    background: #fff;
`;
const confirm = Modal.confirm;
const info = Modal.info;

@injectIntl
@LoadingHoc
class userInfo extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
        this.state = {
            deptInfo: {},
            edit: false,
            userInfo: {},
            operateData: {}, // 根据operateId 取到的数据
            selectUserInfo: {}, //根据邮箱查到的人员信息
            userType: ''
        };
        this.BasicInfo = React.createRef();
        this.authPage = React.createRef();
    }

    componentDidMount = async () => {
        try {
            this.props.toggleLoading();
            if (!window.sessionStorage.getItem('environmentToken')) {
                this.nullOperateDataInfo('无权限操作，返回上一页');
                return;
            }
            const operateId =
                getQueryString('operateId', window.location.href) || '';
            const operateData = await $http.get(
                `${urls.getOperateData}?operateId=${operateId}`
            );
            if (operateData && !operateData.isValid) {
                console.log('operateData', operateData);
                const userInfo = await deptService.getCspMemberInfo(
                    operateData.userId
                );
                userInfo.area = getBasicInfoAreaValues(userInfo);
                const loginUserInfo = JSON.parse(
                    window.sessionStorage.getItem('sso_loginInfo')
                );
                let userType = '';
                if (
                    find(
                        loginUserInfo.userRoles,
                        item => item.roleId === 'econfig_project_admin'
                    )
                ) {
                    userType = 'projectUser';
                }
                this.setState({
                    userInfo,
                    operateData,
                    userType
                });
            } else if (operateData && operateData.isValid) {
                this.nullOperateDataInfo(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0517
                    ),
                    operateData.backUrl
                );
            } else {
                this.nullOperateDataInfo(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0518
                    )
                );
            }
        } catch (e) {
            this.nullOperateDataInfo(e.message);
        } finally {
            this.props.toggleLoading();
        }
    };

    nullOperateDataInfo = (title, backUrl) => {
        const _this = this;
        info({
            title,
            okText: _this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            onOk() {
                if (backUrl) {
                    window.location.href = backUrl;
                } else {
                    _this.props.history.goBack();
                }
            }
        });
    };

    updateReset = async () => {
        try {
            const userInfo = await deptService.getCspMemberInfo(
                this.state.operateData.userId
            );
            this.authPage.current.cancelReset();
            this.setState({ userInfo, edit: !this.state.edit });
        } catch (e) {
            message.error(e.message);
        }
    };

    cancelReset = () => {
        this.BasicInfo.current.props.form.setFieldsValue(
            Object.assign(
                {
                    address: '',
                    mobile: '',
                    timeZone: '',
                    email: '',
                    userName: '',
                    enName: '',
                    jobNumber: '',
                    position: '',
                    area: []
                },
                this.state.userInfo,
                {
                    userProperty:
                        this.state.userInfo.userProperty === 'TMUser'
                            ? ''
                            : this.state.userInfo.userProperty
                }
            )
        );
        this.authPage.current.cancelReset();
    };

    saveUser = async isSave => {
        const userInfoFormDto = this.BasicInfo.current.props.form.getFieldsValue();
        const { userInfo } = this.state;
        const hasError = fieldHasError(
            this.BasicInfo.current.props.form.getFieldsError()
        );
        if (hasError) {
            message.error(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0270)
            );
        } else {
            const authLayRoleInfnVos = this.authPage.current.getAuthDto();
            const nullAppIds = this.authPage.current.getAppIds();
            this.authPage.current.setOldAuthInfo();
            if (authLayRoleInfnVos) {
                try {
                    this.props.toggleLoading();
                    // 编辑人员信息时候删除sourceForm参数
                    const oldUserInfo = Object.assign({}, userInfo);
                    delete oldUserInfo.sourceFrom;
                    await $http.post(`${urls.updateAuthUser}`, {
                        userId: this.state.userInfo.userId || '',
                        source: this.state.operateData.source,
                        userManagementDto: Object.assign(
                            {},
                            { projectId: this.props.projectId || '' },
                            oldUserInfo,
                            userInfoFormDto,
                            {
                                userProperty:
                                    userInfo.userProperty === 'TMUser'
                                        ? 'TMUser'
                                        : userInfoFormDto.userProperty
                            },
                            getDataFromArea(userInfoFormDto.area)
                        ),
                        appIds: nullAppIds,
                        authLayRoleInfnVos,
                        operateId: getQueryString(
                            'operateId',
                            window.location.href
                        ),
                        projectId: this.props.projectId || ''
                    });
                    message.success(
                        isSave
                            ? this.props.intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0261
                              )
                            : this.props.intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0359
                              )
                    );
                    this.updateReset();
                } catch (e) {
                    message.error(e.message);
                }
                this.props.toggleLoading();
            }
        }
    };

    deleteConfirm = debounce(
        async () => {
            const _this = this;
            const { userId, isAuth } = this.state.userInfo;
            const { backUrl } = this.state.operateData;
            try {
                const tips = await $http.get(urls.checkUserAuth, { userId });
                if (tips.length > 0) {
                    Modal.info({
                        title: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0202
                        ),
                        content: (
                            <div style={{ wordBreak: 'break-all' }}>
                                {parseApiUrl(
                                    this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0661
                                    ),
                                    {
                                        apps: tips.map(t => t.appName).join(',')
                                    }
                                )}
                            </div>
                        ),
                        okText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        ),
                        onOk() {}
                    });
                } else {
                    confirm({
                        title: (
                            <div style={{ color: '#FF0000' }}>
                                {`${
                                    isAuth
                                        ? this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0318
                                          )
                                        : this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0228
                                          )
                                },${this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0535
                                )}`}
                            </div>
                        ),
                        // content: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0535),
                        okText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        ),
                        cancelText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0281
                        ),
                        onOk: async () => {
                            try {
                                await $http.delete(
                                    `${
                                        urls.cspDelUserInfo
                                    }?userId=${userId}&operateId=${getQueryString(
                                        'operateId',
                                        window.location.href
                                    )}`
                                );
                                message.success(
                                    _this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0233
                                    )
                                );
                                const operateId =
                                    getQueryString(
                                        'operateId',
                                        window.location.href
                                    ) || '';
                                window.location.href = `${backUrl}${
                                    backUrl.indexOf('?') > -1
                                        ? `&operateId=${operateId}`
                                        : `?operateId=${operateId}`
                                }`;
                            } catch (e) {
                                message.error(e.message);
                            }
                        },
                        onCancel() {}
                    });
                }
            } catch (e) {
                message.error(e.message);
            }
        },
        500,
        { leading: true, trailing: false }
    );

    selectUserByEmail = userInfo => {
        this.setState({ selectUserInfo: userInfo });
    };

    changeUserInfo = userInfo => {
        this.setState({ userInfo });
    };

    render() {
        const { backUrl } = this.state.operateData;
        const formatMessage = this.props.intl.formatMessage;
        const ssoLoginInfo = JSON.parse(
            window.sessionStorage.getItem('sso_loginInfo')
        );
        let loginUserRole = '';
        if (
            find(
                ssoLoginInfo.userRoles,
                item => item.roleId === 'econfig_project_admin'
            )
        ) {
            loginUserRole = 'projectAdmin';
        }
        return (
            <div className="deptMemberInfoPage pTop40 Relative WhiteBG">
                <FixedDiv style={{ top: this.props.fromAuthSearch && 50 }}>
                    <div
                        className="mLeft40 Font18 InlineBlock"
                        style={{ color: '#18b0e6' }}
                    >
                        {ssoLoginInfo.tenantName}-{this.state.userInfo.userName}
                    </div>
                    <div className="Right InlineBlock">
                        <Button
                            className=" mRight15"
                            type="primary"
                            onClick={() => {
                                if (this.state.edit) {
                                    this.cancelReset();
                                }
                                this.setState({ edit: !this.state.edit });
                            }}
                        >
                            {this.state.edit
                                ? this.props.intl.formatMessage(
                                      i18nMessages.ECONFIG_FRONT_A0281
                                  )
                                : formatMessage(
                                      i18nMessages.ECONFIG_FRONT_A0098
                                  )}
                        </Button>
                        {this.state.operateData.isDeleteUser === '1' &&
                            loginUserRole !== 'projectAdmin' && (
                                <Button
                                    className="mRight15"
                                    type="primary"
                                    onClick={this.deleteConfirm}
                                >
                                    {formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0070
                                    )}
                                </Button>
                            )}
                        <Button
                            className=" mRight15"
                            onClick={() => {
                                // if (this.props.fromAuthSearch) {
                                //     this.props.goBack();
                                // } else {
                                //     // 如果返回列表需要记录之前的搜索状态，使用push，把搜索参数传回去
                                //     if (this.props.location.searchObj) {
                                //         this.props.history.push({
                                //             pathname: '/department_manage',
                                //             searchObj: this.props.location
                                //                 .searchObj
                                //         });
                                //     } else {
                                //         this.props.history.goBack();
                                //     }
                                // }
                                const operateId =
                                    getQueryString(
                                        'operateId',
                                        window.location.href
                                    ) || '';
                                window.location.href = `${backUrl}${
                                    backUrl.indexOf('?') > -1
                                        ? `&operateId=${operateId}`
                                        : `?operateId=${operateId}`
                                }`;
                            }}
                        >
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0094)}
                        </Button>
                    </div>
                </FixedDiv>
                {this.state.userInfo.userId && (
                    <BasicInfo
                        wrappedComponentRef={this.BasicInfo}
                        edit={this.state.edit}
                        selectUserByEmail={this.selectUserByEmail}
                        memberInfo={this.state.userInfo}
                        operateData={this.state.operateData}
                        changeUserInfo={this.changeUserInfo}
                    />
                )}
                {this.state.userInfo.userId && (
                    <AuthPage
                        ref={this.authPage}
                        operateData={this.state.operateData}
                        intl={this.props.intl}
                        userId={this.state.userInfo.userId}
                        userProperty={this.state.userInfo.userProperty}
                        loginUserRole={loginUserRole}
                        edit={this.state.edit}
                        userType={this.state.userType}
                    />
                )}

                <div className="TxtCenter">
                    {this.state.edit && (
                        <Button
                            type="primary"
                            className="mRight15 mBottom15 mTop15"
                            onClick={() => {
                                this.saveUser(true);
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0062
                            )}
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}

export default userInfo;
