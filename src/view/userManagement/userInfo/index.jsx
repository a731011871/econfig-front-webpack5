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
import { getBasicInfoAreaValues } from 'utils/functions';
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
        projectId: PropTypes.string, // 项目Id
        // 从授权查询进入人员详情
        fromAuthSearch: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.NewInfo = React.createRef();
        this.InfoPage = React.createRef();
        this.state = {
            // edit: !!props.fromProjectManage && !!props.isInvite, //如果是从项目管理中邀请外部用户，进入页面时候需要是编辑状态
            edit: true, //默认为编辑状态
            inviteEmails: '',
            saveDisabled: false
        };
        this.authPage = React.createRef();
    }

    get isEdit() {
        return (
            this.props.userInfo.userId ||
            this.props.userInfo.inviteId ||
            this.props.fromProjectManage
        );
    }

    isEmail = function(str) {
        const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*\.[\w-]+$/i;
        return emailReg.test(str);
    };

    componentDidMount() {
        if (this.isEdit) {
            // this.basicInfo.current.setFieldsValue({ emails: '12312313' });
        }
    }

    cancelReset = () => {
        this.InfoPage.current.props.form.setFieldsValue(
            Object.assign({}, this.props.userInfo, {
                area: getBasicInfoAreaValues(this.props.userInfo)
            })
        );
        this.authPage.current.cancelReset();
    };

    updateReset = userInfo => {
        this.props.updateReset(userInfo);
        this.authPage.current.cancelReset();
        this.setState({ edit: !this.state.edit });
    };

    saveUser = async isSave => {
        this.props.toggleLoading();
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
                    this.props.toggleLoading();
                } else {
                    try {
                        if (this.props.userInfo.inviteId) {
                            await $http.post(
                                `${urls.addUserInfo}?isCompanyUser=false&isSave=${isSave}`,
                                {
                                    emails: [userInfo.email],
                                    authLayRoleInfnVos,
                                    appIds: nullAppIds,
                                    inviteId: this.props.userInfo.inviteId
                                }
                            );
                        } else {
                            // 编辑人员信息时候删除sourceForm参数
                            const oldUserInfo = Object.assign(
                                {},
                                this.props.userInfo
                            );
                            delete oldUserInfo.sourceFrom;
                            await $http.post(
                                `${
                                    urls.updateUserInfo
                                }?isSave=${isSave}&projectId=${this.props
                                    .projectId || ''}`,
                                Object.assign(
                                    {},
                                    {
                                        userId: this.props.userInfo.userId,
                                        userManagementDto: Object.assign(
                                            {},
                                            oldUserInfo,
                                            userInfo,
                                            {
                                                userProperty: 'OutUser',
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
                        //如果是从项目管理中邀请外部用户，保存完需要返回列表
                        if (
                            this.props.fromProjectManage &&
                            this.props.isInvite
                        ) {
                            this.props.goBack();
                        } else {
                            this.updateReset(
                                Object.assign(
                                    {},
                                    this.props.userInfo,
                                    userInfo,
                                    {
                                        userProperty: 'OutUser'
                                    }
                                )
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
                        this.props.toggleLoading();
                    } else {
                        try {
                            await $http.post(
                                `${urls.addUserInfo}?isCompanyUser=false&isSave=${isSave}`,
                                { emails: email, authLayRoleInfnVos }
                            );
                            //如果是从项目管理中邀请新用户，保存完需要返回列表
                            if (this.props.fromProjectManage) {
                                this.props.goBack();
                            } else {
                                this.props.showUserList(this.props.currentMenu);
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
                } else {
                    message.error(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0244
                        )
                    );
                    this.props.toggleLoading();
                }
            }
        } else {
            this.props.toggleLoading();
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
                    okText: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0279
                    ),
                    cancelText: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0281
                    ),
                    // content: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0535),
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
                            if (_this.props.fromAuthSearch) {
                                _this.props.goBack(true);
                            } else {
                                _this.props.showUserList(
                                    this.props.currentMenu
                                );
                            }
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
                        userId: userId || ''
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
        let userName = '';
        const { inviteId, email } = this.props.userInfo;
        if (this.isEdit) {
            userName = inviteId ? email : this.props.userInfo.userName;
        } else {
            userName = this.state.inviteEmails;
        }
        console.log('userName-------------', userName);
        return (
            <ContextBox className="userInfo Relative pTop40">
                {this.isEdit ? (
                    <InfoPage
                        edit={this.state.edit}
                        wrappedComponentRef={this.InfoPage}
                        memberInfo={this.props.userInfo}
                    />
                ) : (
                    <NewInfo
                        changeInviteEmails={inviteEmails => {
                            this.setState({ inviteEmails });
                        }}
                        wrappedComponentRef={this.NewInfo}
                        disabledInput={this.isEdit && !this.state.edit}
                        changeSaveDisabled={this.changeSaveDisabled}
                    />
                )}
                <AuthPage
                    ref={this.authPage}
                    fromProjectManage={this.props.fromProjectManage}
                    appId={this.props.appId}
                    projectId={this.props.projectId}
                    email={this.props.userInfo.email}
                    userName={userName}
                    intl={this.props.intl}
                    edit={!this.isEdit || this.state.edit}
                    userId={
                        this.props.userInfo.inviteId
                            ? this.props.userInfo.inviteId
                            : this.props.userInfo.userId
                    }
                    userType="outUser"
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
                        {this.isEdit && !this.props.isInvite && (
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
                        {this.isEdit && !this.props.fromProjectManage && (
                            <Button
                                className="mRight15"
                                type="primary"
                                onClick={this.deleteConfirm}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0101
                                )}
                            </Button>
                        )}

                        <Button
                            className="mRight15"
                            onClick={() => {
                                if (
                                    !this.props.fromProjectManage &&
                                    !this.props.fromAuthSearch
                                ) {
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
                        (this.props.userInfo.inviteId && this.state.edit)) && (
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
