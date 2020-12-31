import React from 'react';
import { Base64 } from 'js-base64';
// import { isNumber } from 'lodash';
import { Form, Button, message, Input, Radio } from 'antd';
import {
    getRequiredRule,
    whitespaceRule,
    emailRule
} from 'utils/validateRules';
import { fieldHasError } from 'utils/fieldHasError';
import { $http } from 'utils/http';
import { LoadingHoc } from 'src/component/LoadingHoc';
import urls from 'utils/urls';
import {injectIntl} from 'react-intl';
import { i18nMessages } from 'src/i18n';

const RadioGroup = Radio.Group;

@LoadingHoc
@injectIntl
@Form.create()
class EmailSetting extends React.Component {
    componentDidMount = async () => {

        this.props.toggleLoading();
        try {
            const formData = await $http.get(urls.getEmailConfig);
            if (formData) {
                this.props.form.setFieldsValue(formData);
                this.setState({ oldPassword: formData.serverPassword });
            }
        } catch (e) {
            message.error(e.message);
        }
        this.props.toggleLoading();
        this.props.form.validateFields();
    };

    state = {
        showModal: false,
        oldPassword: '',
    };

    handleSubmit = e => {
        e.preventDefault();
        e.stopPropagation();
        const { form } = this.props;
        form.validateFields(async error => {
            if (error) {
                return;
            }
            const formData = form.getFieldsValue();
            formData.emailServerType = '1';
            formData.emailFromName = formData.emailFromName;
            formData.emailFromAddress = formData.serverAccount;
            if (formData.serverPassword !== this.state.oldPassword) {
                formData.serverPassword = Base64.encode(
                    formData.serverPassword
                );
            } else {
                formData.serverPassword = '';
            }
            try {
                await $http.post(urls.saveEmailConfig, formData);
                message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0261));
            } catch (e) {
                message.error(e.message);
            }
        });
    };

    sendEmailMessage = () => {
        const { form } = this.props;
        form.validateFields(async error => {
            if (error) {
                return;
            }
            const formData = form.getFieldsValue();
            const newData = {
                // appId: 'econfig',
                // messageChannelEnum: 'EMAIL',
                // messageTargetList: [formData.messageTarget],
                // messageTriggerTypeEnum: 'TRIGGER',
                emailContent: '您好！您设置的邮件发送配置已成功发送该邮件',
                emailTitle: '测试邮件',
                smtpSendServer: formData.smtpSendServer,
                smtpSendPort: formData.smtpSendPort,
                smtpIsSsl: formData.smtpIsSsl,
                serverAccount: formData.serverAccount,
                emailFromName: formData.emailFromName,
                emailFromAddress: formData.serverAccount,
                serverPassword:
                    formData.serverPassword !== this.state.oldPassword
                        ? Base64.encode(formData.serverPassword)
                        : ''
            };
            try {
                await $http.post(urls.sendEmailMessage, newData);
                message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0235));
            } catch (e) {
                if (e.code === '401') {
                    message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0350));
                } else {
                    message.error(e.message || this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0351));
                }
            }
        });
    };

    clearEmailConfig = async () => {
        try {
            await $http.delete(urls.deleteEmailConfig);
            this.props.form.resetFields();
            this.props.form.validateFields();
            message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0352));
        } catch (e) {
            message.error(e.message);
        }
    };

    render() {
        const { getFieldDecorator, getFieldsError } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        };
        return (
            <Form
                className="emailSetting"
                onSubmit={this.handleSubmit}
                aotucomplete="new-password"
                style={{
                    height: '100%',
                    width: 600,
                    paddingLeft: 45,
                    paddingTop: 24
                }}
            >
                {/*{this.state.showModal && (*/}
                {/*<Modal*/}
                {/*title="发送邮箱"*/}
                {/*visible={this.state.showModal}*/}
                {/*onOk={this.sendEmailMessage}*/}
                {/*onCancel={() => {*/}
                {/*this.setState({ showModal: false }, () => {*/}
                {/*this.props.form.validateFields();*/}
                {/*});*/}
                {/*}}*/}
                {/*>*/}
                {/*<Form.Item label="发送邮箱" {...formItemLayout}>*/}
                {/*{getFieldDecorator('messageTarget', {*/}
                {/*initialValue: '',*/}
                {/*rules: [*/}
                {/*getRequiredRule('发送邮箱'),*/}
                {/*emailRule('发送邮箱')*/}
                {/*]*/}
                {/*})(<Input />)}*/}
                {/*</Form.Item>*/}
                {/*</Modal>*/}
                {/*)}*/}
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0127)} {...formItemLayout}>
                    {getFieldDecorator('smtpSendServer', {
                        initialValue: '',
                        rules: [
                            getRequiredRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0127),this.props.intl.formatMessage),
                            whitespaceRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0127),this.props.intl.formatMessage)
                        ]
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="SSL" {...formItemLayout}>
                    {getFieldDecorator('smtpIsSsl', {
                        initialValue: '1',
                        rules: []
                    })(
                        <RadioGroup
                            options={[
                                { label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0346), value: '1' },
                                { label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0347), value: '0' }
                            ]}
                        />
                    )}
                </Form.Item>

                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0128)} {...formItemLayout}>
                    {getFieldDecorator('smtpSendPort', {
                        initialValue: '',
                        rules: [{
                            validator: (rule, value, callback) => {
                                if (!value) {
                                    callback(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0348));
                                } else if (!Number(value) || Number(value)< 0 || Number(value) > 65535) {
                                    callback(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0349));
                                }
                                callback();
                            }
                        }],
                        validateTrigger: 'onBlur'
                    })(<Input />)}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0464)} {...formItemLayout}>
                    {getFieldDecorator('emailFromName', {
                        initialValue: '',
                        rules: [
                            {
                                required: true,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0325).replace('xxx', this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0464))
                            },
                            {
                                max: 100,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '100')
                            }
                        ],
                        validateTrigger: 'onBlur'
                    })(<Input />)}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0129)} {...formItemLayout}>
                    {getFieldDecorator('serverAccount', {
                        initialValue: '',
                        rules: [
                            getRequiredRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0129),this.props.intl.formatMessage),
                            emailRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0129),this.props.intl.formatMessage)
                        ]
                    })(<Input />)}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0130)} {...formItemLayout} >
                    {getFieldDecorator('serverPassword', {
                        initialValue: '',
                        rules: [getRequiredRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0130),this.props.intl.formatMessage)]
                    })(<Input.Password autocomplete="new-password" maxLength={100} />)}
                </Form.Item>
                <div className="btnBox TxtCenter mTop15">
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 InlineBlock"
                        disabled={fieldHasError(getFieldsError())}
                    >
                        {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                    <Button
                        type="primary"
                        htmlType="button"
                        className="mRight15 InlineBlock"
                        disabled={fieldHasError(getFieldsError())}
                        onClick={this.sendEmailMessage}
                    >
                        {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0131)}
                    </Button>
                    <Button
                        type="primary"
                        htmlType="reset"
                        className="mRight15 InlineBlock"
                        onClick={this.clearEmailConfig}
                    >
                        {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0132)}
                    </Button>
                </div>
            </Form>
        );
    }
}

export default EmailSetting;
