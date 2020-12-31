import React from 'react';
import { $http } from 'utils/http';
import urls, { getQueryString } from 'utils/urls';
import { Form, Input, Button, Modal, message } from 'antd';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import AuthPage from './authPage';
import { LoadingHoc } from 'src/component/LoadingHoc';
import {find} from 'lodash';

const TextArea = Input.TextArea;

@injectIntl
@LoadingHoc
class Invite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            operateData: {},
            emails: '',
            open: false,
            loading: false,
            userType: ''
        };
        this.authPage = React.createRef();
    }

    async componentWillMount() {
        try {
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
                console.log(operateData);
                const { userInfoDtos = [] } = operateData;
                const userInfo = JSON.parse(
                    window.sessionStorage.getItem('sso_loginInfo')
                );
                let userType = '';
                if (find(userInfo.userRoles, item => item.roleId === 'econfig_project_admin')) {
                    userType = 'projectUser';
                }
                this.setState({ operateData, open: true, userType });
                const emails = userInfoDtos.filter(item => item.message === undefined).map(item => {
                    if(item.email) {
                        if(item.userName) {
                            return `${item.email}(${item.userName})`;
                        }else if(item.accountName) {
                            return `${item.email}(${item.accountName})`;
                        } else {
                            return `${item.email}`;
                        }
                    } else if(item.userName && item.accountName) {
                        return `${item.accountName}(${item.userName})`;
                    } else if(item.userName) {
                        return `${item.userName}`;
                    } else if(item.accountName) {
                        return `${item.accountName}`;
                    }
                }).join(',');
                this.props.form.setFieldsValue({
                    emails
                });
            } else if (operateData && operateData.isValid) {
                this.nullOperateDataInfo(this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0517
                ), operateData.backUrl);
            } else {
                this.nullOperateDataInfo(this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0518
                ));
            }
        } catch (e) {
            this.nullOperateDataInfo(e.message);
        }
    }

    nullOperateDataInfo = title => {
        const _this = this;
        Modal.info({
            title,
            okText: _this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            onOk() {
                _this.props.history.goBack();
            }
        });
    };

    onSave = async () => {
        const { operateData } = this.state;
        const { userInfoDtos = [] } = operateData;
        const u = userInfoDtos.filter(item => item.message === undefined);
        try {
            this.props.toggleLoading();
            const operateId =
                getQueryString('operateId', window.location.href) || '';
            const authLayRoleInfnVos = this.authPage.current.getAuthDto();
            this.authPage.current.setOldAuthInfo();
            if (authLayRoleInfnVos) {
                const params = {
                    ...operateData,
                    authLayRoleInfnVos,
                    userInfoDtos: u,
                    operateId: getQueryString(
                        'operateId',
                        window.location.href
                    ),
                };
                delete params.appIds;
                delete params.applicationVos;
                this.setState({loading: true});
                await $http.post(urls.addUserInvite, params);
                message.success(
                    this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0229),
                    1,
                    () => {
                        if (operateData.backUrl) {
                            window.location.href =
                                operateData.backUrl.indexOf('?') > 0
                                    ? `${
                                        operateData.backUrl
                                    }&operateId=${operateId}`
                                    : `${
                                        operateData.backUrl
                                    }?operateId=${operateId}`;
                        }
                    }
                );
            }

        } catch (e) {
            message.error(e.message);
            this.props.toggleLoading();
        } finally {
            this.props.toggleLoading();
            this.setState({loading: false});
        }
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { formatMessage } = this.props.intl;
        const {
            operateData,
            operateData: { backUrl },
            open,
            loading
        } = this.state;
        const formItemLayout = {
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        };
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
        if (open) {
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        background: '#fff',
                        minHeight: '800px'
                    }}
                >
                    <Form
                        onSubmit={this.handleSubmit}
                        className="outUserInfoForm"
                    >
                        <div className="Font18 pLeft40 pTop25 BorderBottomD pBottom15">
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0343)}
                            <Button
                                className="Right mRight15"
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
                                {formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0094
                                )}
                            </Button>
                        </div>
                        <Form.Item
                            {...formItemLayout}
                            label={`${formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0503
                            )}`}
                            className="mTop20 pLeft40 pRight30"
                        >
                            {getFieldDecorator('emails')(
                                <TextArea
                                    disabled
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0332
                                    )}
                                    autosize={{ minRows: 4 }}
                                    // onBlur={this.onBlur}
                                />
                            )}
                        </Form.Item>
                    </Form>
                    <AuthPage
                        ref={this.authPage}
                        operateData={operateData}
                        intl={this.props.intl}
                        edit={true}
                        loginUserRole={loginUserRole}
                        userType={this.state.userType}
                    />
                    <div className="TxtCenter">
                        <Button
                            type="primary"
                            className="mBottom15 mTop15"
                            onClick={this.onSave}
                            loading={loading}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0504
                            )}
                        </Button>
                    </div>
                </div>
            );
        }
        return null;
    }
}

export default Form.create({})(Invite);
