import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, message, Modal } from 'antd';
import { LoadingHoc } from 'component/LoadingHoc';
import { $http } from 'utils/http';
import urls, { parseApiUrl } from 'utils/urls';
import AuthPage from 'src/component/authPage';
import { getDataFromArea } from 'utils/functions';
import { fieldHasError } from 'utils/fieldHasError';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import NewInfo from './newInfo';
import InfoPage from './infoPage';
import { debounce } from 'lodash';

const confirm = Modal.confirm;
const FixedDiv = styled.div`
    position: fixed;
    top: 58px;
    right: 10px;
    left: 10px;
    height: 60px;
    line-height: 60px;
    z-index: 3;
    background: #fff;
`;
const ContextBox = styled.div`
    .userInfoForm {
        padding-top: 20px;
    }
    .userInfoForm > .ant-form-item {
        width: 33%;
        display: inline-block;
    }
`;

@injectIntl
@LoadingHoc
class UserInfo extends React.Component {
    static propTypes = {
        showUserList: PropTypes.func,
        updateReset: PropTypes.func,
        userInfo: PropTypes.object,
        currentMenu: PropTypes.string,
        // 从项目管理中邀请授权判断参数
        fromProjectManage: PropTypes.bool, // 是否从项目管理中邀请授权
        isInvite: PropTypes.bool, // true-邀请  false-编辑
        projectId: PropTypes.string // 项目Id
    };

    constructor(props) {
        super(props);
        this.NewInfo = React.createRef();
        this.InfoPage = React.createRef();
        this.state = {
            // edit: this.props.fromProjectManage && this.props.isInvite, // 从项目管理进入且为邀请功能时默认进入编辑状态
            edit: true, //默认为编辑状态
            userInfo: {},
            saveDisabled: false
        };
        this.authPage = React.createRef();
    }

    get isEdit() {
        // 当前是邀请项目用户，还是编辑项目用户
        return this.props.userInfo.userId || this.props.userInfo.inviteId;
    }

    isEmail = function(str) {
        const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*\.[\w-]+$/i;
        return emailReg.test(str);
    };

    componentDidMount() {
        if (this.isEdit) {
            // this.basicInfo.current.props.form.setFieldsValue({ emails: '12312313' });
        }
    }

    cancelReset = () => {
        this.InfoPage.current.props.form.setFieldsValue(
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
                this.props.userInfo
            )
        );
        this.authPage.current.cancelReset();
    };

    updateReset = userInfo => {
        this.props.updateReset(userInfo);
        this.authPage.current.cancelReset();
        this.setState({ edit: !this.state.edit });
    };

    saveUser = async isSave => {
        const authLayRoleInfnVos = this.authPage.current.getAuthDto();
        const nullAppIds = this.authPage.current.getAppIds();
        this.authPage.current.setOldAuthInfo();
        if (authLayRoleInfnVos) {
            if (this.isEdit) {
                const userInfo = this.InfoPage.current.props.form.getFieldsValue();
                const hasError = fieldHasError(
                    this.InfoPage.current.props.form.getFieldsError()
                );
                if (hasError) {
                    message.error(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0270
                        )
                    );
                } else {
                    this.props.toggleLoading();
                    try {
                        if (this.props.userInfo.inviteId) {
                            await $http.post(
                                `${urls.addProjectUserInfo}?isSave=${isSave}`,
                                {
                                    emails: [userInfo.email],
                                    authLayRoleInfnVos,
                                    appIds: nullAppIds,
                                    inviteId: this.props.userInfo.inviteId
                                }
                            );
                        } else {
                            // 编辑人员信息时候删除sourceForm参数
                            const oldUserInfo = Object.assign({}, userInfo);
                            delete oldUserInfo.sourceFrom;
                            await $http.post(
                                `${urls.updateUserInfo}?isProjectUser=true&isSave=${isSave}`,
                                Object.assign(
                                    {},
                                    {
                                        userId: this.props.userInfo.userId,
                                        userManagementDto: Object.assign(
                                            {},
                                            this.props.userInfo,
                                            oldUserInfo,
                                            {
                                                sourceOrganId: this.props
                                                    .userInfo.organIds
                                            },
                                            getDataFromArea(userInfo.area)
                                        ),
                                        appIds: nullAppIds,
                                        authLayRoleInfnVos,
                                        projectId: this.props.projectId || ''
                                    }
                                )
                            );
                        }
                        if (
                            this.props.fromProjectManage &&
                            this.props.isInvite
                        ) {
                            this.props.goBack();
                        } else {
                            this.updateReset(
                                Object.assign({}, this.props.userInfo, userInfo)
                            );
                        }
                        message.success(
                            isSave
                                ? this.props.intl.formatMessage(
                                      i18nMessages.ECONFIG_FRONT_A0261
                                  )
                                : this.props.intl.formatMessage(
                                      i18nMessages.ECONFIG_FRONT_A0359
                                  )
                        );
                    } catch (e) {
                        message.error(e.message);
                    } finally {
                        this.props.toggleLoading();
                    }
                }
            } else {
                const formEmail = this.NewInfo.current.props.form.getFieldsValue()
                    .emails;
                if (formEmail) {
                    const email = formEmail.split(';').filter(item => item);
                    const emailArr = email.filter(item => this.isEmail(item));
                    if (emailArr.length !== email.length) {
                        message.error(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0243
                            )
                        );
                    } else {
                        this.props.toggleLoading();
                        if (this.state.userInfo.userId) {
                            try {
                                // 编辑人员信息时候删除sourceForm参数
                                const oldUserInfo = Object.assign(
                                    {},
                                    this.state.userInfo
                                );
                                delete oldUserInfo.sourceFrom;
                                await $http.post(
                                    `${
                                        urls.updateUserInfo
                                    }?isProjectUser=true&projectId=${this.props
                                        .projectId || ''}`,
                                    {
                                        userId: this.state.userInfo.userId,
                                        authLayRoleInfnVos,
                                        appIds: nullAppIds,
                                        userManagementDto: oldUserInfo,
                                        projectId: this.props.projectId || ''
                                    }
                                );
                                if (this.props.fromProjectManage) {
                                    this.props.goBack();
                                } else {
                                    this.props.showUserList(
                                        this.props.currentMenu
                                    );
                                }
                                message.success(
                                    this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0229
                                    )
                                );
                            } catch (e) {
                                message.error(e.message);
                            } finally {
                                this.props.toggleLoading();
                            }
                        } else {
                            try {
                                await $http.post(
                                    `${urls.addProjectUserInfo}?isSave=${isSave}`,
                                    { emails: email, authLayRoleInfnVos }
                                );
                                if (this.props.fromProjectManage) {
                                    this.props.goBack();
                                } else {
                                    this.props.showUserList(
                                        this.props.currentMenu
                                    );
                                }
                                message.success(
                                    this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0229
                                    )
                                );
                            } catch (e) {
                                message.error(e.message);
                            } finally {
                                this.props.toggleLoading();
                            }
                        }
                    }
                } else {
                    message.error(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0244
                        )
                    );
                }
            }
        }
    };

    deleteConfirm = debounce(
        async () => {
            const _this = this;
            const { userId, inviteId, isAuth } = this.props.userInfo;
            const confirmFun = () => {
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
                            if (inviteId) {
                                await $http.get(
                                    `${urls.delNotActiveAdmin}?id=${inviteId}`
                                );
                            } else {
                                await $http.delete(
                                    `${urls.deleteUser}?userId=${userId}`
                                );
                            }
                            message.success(
                                this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0233
                                )
                            );
                            _this.props.showUserList(this.props.currentMenu);
                        } catch (e) {
                            message.error(e.message);
                        }
                    },
                    onCancel() {}
                });
            };

            if (inviteId) {
                confirmFun();
                return;
            } else {
                try {
                    const tips = await $http.get(urls.checkUserAuth, {
                        userId
                    });
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
                                            apps: tips
                                                .map(t => t.appName)
                                                .join(',')
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
                        confirmFun();
                    }
                } catch (e) {
                    message.error(e.message);
                }
            }
        },
        500,
        { leading: true, trailing: false }
    );

    changeSaveDisabled = () => {
        this.setState({ saveDisabled: !this.state.saveDisabled });
    };

    render() {
        return (
            <ContextBox className="userInfo Relative pTop40">
                {this.isEdit ? (
                    <InfoPage
                        edit={this.state.edit}
                        // ref={(InfoPage) => this.InfoPage = InfoPage}
                        wrappedComponentRef={this.InfoPage}
                        memberInfo={this.props.userInfo}
                    />
                ) : (
                    <NewInfo
                        // ref={NewInfo => this.NewInfo = NewInfo}
                        wrappedComponentRef={this.NewInfo}
                        disabledInput={this.isEdit && !this.state.edit}
                        setUserInfo={userInfo => {
                            this.setState({ userInfo });
                            this.authPage.current.cancelReset();
                        }}
                        changeSaveDisabled={this.changeSaveDisabled}
                        toggleLoading={this.props.toggleLoading}
                        // getAuth={() => { this.setState({ editAuth: true }); }}
                    />
                )}
                <AuthPage
                    ref={this.authPage}
                    fromProjectManage={this.props.fromProjectManage}
                    appId={this.props.appId}
                    projectId={this.props.projectId}
                    email={this.props.userInfo.email}
                    userName={this.props.userInfo.userName}
                    intl={this.props.intl}
                    edit={!this.isEdit || this.state.edit}
                    userId={
                        this.state.userInfo.userId
                            ? this.state.userInfo.userId
                            : this.props.userInfo.inviteId
                            ? this.props.userInfo.inviteId
                            : this.props.userInfo.userId
                    }
                    userType="projectUser"
                    userProperty={this.props.userInfo.userProperty}
                    isActive={!this.props.userInfo.inviteId}
                    isOutUser
                />
                <FixedDiv>
                    {this.isEdit && (
                        <div
                            className="mLeft40 Font18 InlineBlock"
                            style={{ color: '#18b0e6' }}
                        >
                            {this.props.userInfo.userName}
                        </div>
                    )}
                    <div className="Right InlineBlock">
                        {this.isEdit && (
                            <Button
                                className="mRight15"
                                type="primary"
                                onClick={() => {
                                    if (this.state.edit) {
                                        this.cancelReset();
                                    }
                                    this.setState({
                                        edit: !this.state.edit
                                    });
                                }}
                            >
                                {this.state.edit
                                    ? this.props.intl.formatMessage(
                                          i18nMessages.ECONFIG_FRONT_A0281
                                      )
                                    : this.props.intl.formatMessage(
                                          i18nMessages.ECONFIG_FRONT_A0098
                                      )}
                            </Button>
                        )}
                        <Button
                            className="mRight15"
                            onClick={() => {
                                if (!this.props.fromProjectManage) {
                                    this.props.showUserList(
                                        this.props.currentMenu
                                    );
                                } else {
                                    this.props.goBack();
                                }
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0094
                            )}
                        </Button>
                    </div>
                </FixedDiv>

                <div className="TxtCenter">
                    {(!this.isEdit || this.state.edit) && (
                        <Button
                            type="primary"
                            className="mRight15 mBottom15 mTop15"
                            onClick={() => {
                                this.saveUser(true);
                            }}
                            disabled={this.state.saveDisabled}
                        >
                            {/*{this.props.intl.formatMessage(*/}
                            {/*this.props.userInfo.inviteId || !this.isEdit*/}
                            {/*? i18nMessages.ECONFIG_FRONT_A0360*/}
                            {/*: i18nMessages.ECONFIG_FRONT_A0062*/}
                            {/*)}*/}
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0062
                            )}
                        </Button>
                    )}

                    {(!this.isEdit ||
                        (this.props.userInfo.inviteId && this.state.edit)) &&
                        !this.state.userInfo.userId && (
                            <Button
                                type="primary"
                                className="mRight15 mBottom15 mTop15"
                                onClick={() => {
                                    this.saveUser(false);
                                }}
                                disabled={this.state.saveDisabled}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0271
                                )}
                            </Button>
                        )}
                </div>
            </ContextBox>
        );
    }
}
export default UserInfo;
