import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
import { Form, Modal, Input, Button, Col, message, Checkbox } from 'antd';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

@injectIntl
@Form.create()
class CheckModalForm extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    state = {
        okLoading: false,
        notCertified: true,
        verificationNum: 60,
        verificationDisabled: false,
        verificationLoading: false
    }

    onOk = () => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                const userInfo = JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}');
                try{
                    this.setState({okLoading: true});
                    const result = await $http.post(urls.usersCheck, {
                        toUserId: userInfo.accountId,
                        pincodeValue: values.code,
                    });
                    if(!result) {
                        message.info(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0411));
                        this.setState({okLoading: false});
                        return;
                    }
                    this.onAddMark('1', this.state.notCertified ? '1' : '0');
                    this.props.loadApp();
                }catch(e) {
                    this.setState({okLoading: false});
                    message.info(e.message);
                }
            }
        });
    }

    onAddMark = async (auth, isPitch = '0') => {
        try {
            await $http.post(urls.addMark, {
                auth,
                isPitch
            });
        } catch (e) {
            console.log(e);
        } 
    };

    onVerification = debounce(async () => {
        let { verificationNum } = this.state;
        const { info: { areaCode = '' }, language = 'zh_CN' } = this.props;
        const userInfo = JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}');
        try{
            if(!userInfo.mobile) {
                message.info('手机号为空,请绑定手机号!');
                return;
            }
            this.setState({ verificationLoading: true, verificationDisabled: true});
            // await $http.post(urls.sendEconfigCode, {
            //     toUserId: userInfo.accountId,
            //     tenantId: userInfo.tenantId,
            //     sendWay: 'sms',
            // });
            await $http.post(urls.getCodeGlobal, {
                accountId: userInfo.accountId,
                sendMode: 2,
                sendWay: 'sms',
                tenantId: userInfo.tenantId,
                areaCode
            }, {
                headers: {
                    'TM-Header-Locale': language
                }
            });
            this.setState({ verificationLoading: false });
            message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0410));
            const timer = setInterval(() => {
                this.setState({ 
                    verificationNum: (--verificationNum),
                    verificationDisabled: true,
                }, () => {
                    if (verificationNum === 0) {
                        clearInterval(timer);
                        this.setState({
                            verificationNum: 60,
                            verificationDisabled: false,
                        });
                    }
                });
            }, 1000);
        }catch(e) {
            this.setState({ verificationLoading: false, verificationDisabled: false });
            message.info(e.message);
        }
    }, 300)

    onBindPhone = async () => {
        try{
            // const that = this;
            const userInfo = JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}');
            await $http.get(urls.sendMobileEmail, {
                accountId: userInfo.accountId,
                tenantId: userInfo.tenantId
            });
            Modal.info({
                icon: null,
                className: 'checkTip',
                content: (
                    <div className="checkTipText">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0412)}</div>
                ),
                okText: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0413),
                okType: 'default',
                onOk(){
                    window.location.href = '/select';
                }
            });
        }catch(e) {
            message.info(e.message);
        }
       
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const userInfo = JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}');
        const { verificationDisabled, verificationNum, verificationLoading, okLoading } = this.state;
        return (
            <Modal
                title={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0401)}
                width="400px"
                destroyOnClose={true}
                wrapClassName="checkModal"
                visible={true}
                onOk={this.onOk}
                maskClosable={false}
                onCancel={() => {
                    window.location.href = '/select';
                }}
                okButtonProps={{loading: okLoading}}
                // okText={intl.get('check_login_determine')}
                // cancelText={intl.get('check_login_cancel')}
            >
                <div className="checkModalForm">
                    <Form layout="vertical">
                        <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0402)} required>
                            {getFieldDecorator('phone', {
                                initialValue: userInfo.mobile,
                                rules: [
                                    { 
                                        required: true, 
                                        message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0403)
                                    },
                                    {
                                        pattern: /^[0-9]*$/,
                                        message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0404)
                                    }
                                ]
                            })(
                                <Input disabled={true} placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0402)} />
                            )}
                        </Form.Item>
                        <Form.Item>
                            <Col span={24}>
                                <Col span={15}>
                                    {getFieldDecorator('code', {
                                        rules: [{ required: true, message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0405) }]
                                    })(
                                        <Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0405)} />
                                    )}
                                </Col>
                                <Col span={9} className="getCode">
                                    <Button block loading={verificationLoading}  disabled={verificationDisabled} onClick={this.onVerification}>{verificationNum === 60 ? this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0406) : `${verificationNum}${this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0407) }`}</Button>
                                </Col>
                            </Col>
                        </Form.Item>
                    </Form>
                    <div className="checkModalCheckbox"><Checkbox checked={this.state.notCertified} onChange={() => { this.setState({ notCertified: !this.state.notCertified }); }} /><span className="text">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0489)}</span></div>
                    {/* <div className="checkModalFormTip">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0408)}<a onClick={this.onBindPhone} href="javascript:void(0)">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0409)}</a> </div> */}
                </div>
            </Modal>
        );
    }

}

export default CheckModalForm;