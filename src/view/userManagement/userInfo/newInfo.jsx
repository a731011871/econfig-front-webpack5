import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal } from 'antd';
import { injectIntl } from 'react-intl';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { i18nMessages } from 'src/i18n';
// import { uniq } from 'lodash';
import { getRequiredRule, isEmail } from 'utils/validateRules';
import { uniq } from 'lodash';

const TextArea = Input.TextArea;
const { confirm } = Modal;

@injectIntl
class UserInfo extends React.Component {
    static propTypes = {
        disabledInput: PropTypes.bool,
        userInfo: PropTypes.object,
        changeInviteEmails: PropTypes.func, // 邮箱输入完成以后传到父组件使用
        changeSaveDisabled: PropTypes.func
    };

    handleBlur = async (rule, value, callback) => {
        const _this = this;
        _this.props.changeSaveDisabled();
        const emails = uniq(
            value.match(/[\w-]+(\.[\w-]+)*\.?@[\w-]+(\.[\w-]+)+/g)
        );
        console.log(emails);
        const { setFieldsValue } = this.props.form;
        const { formatMessage } = this.props.intl;
        try {
            const errorEmails = [];
            emails.forEach(item => {
                if (!isEmail(item)) {
                    errorEmails.push(item);
                    // throw new Error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0327).replace('xxx', item));
                }
            });
            const cfEmails =
                (await $http.post(urls.checkEmailToOutUser, emails)) || [];
            if (errorEmails.length > 0 || cfEmails.length > 0) {
                confirm({
                    title: `${formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0423
                    )}?`,
                    content: (
                        <div>
                            {cfEmails.length > 0 && (
                                <React.Fragment>
                                    <h5 style={{ margin: '20px 0 0 0' }}>
                                        {formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0424
                                        )}
                                        :
                                    </h5>
                                    <div>
                                        {cfEmails.map((item, index) => (
                                            <div key={index}>{item}</div>
                                        ))}
                                    </div>
                                </React.Fragment>
                            )}
                            {errorEmails.length > 0 && (
                                <React.Fragment>
                                    <h5 style={{ margin: '20px 0 0 0' }}>
                                        {formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0425
                                        )}
                                        :
                                    </h5>
                                    <div>
                                        {errorEmails.map((item, index) => (
                                            <div key={index}>{item}</div>
                                        ))}
                                    </div>
                                </React.Fragment>
                            )}
                        </div>
                    ),
                    cancelText: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0281
                    ),
                    okText: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0279
                    ),
                    onOk() {
                        const rightEmails =
                            emails
                                .filter(
                                    item =>
                                        cfEmails.indexOf(item) < 0 &&
                                        errorEmails.indexOf(item) < 0
                                )
                                .join(';') || [];
                        setFieldsValue({ emails: rightEmails });
                        _this.props.changeInviteEmails(rightEmails);
                    }
                });
            } else {
                this.props.changeInviteEmails(emails.join(';'));
                setFieldsValue({ emails: emails.join(';') });
            }
            if (errorEmails.length > 0) {
                throw new Error(
                    `${errorEmails.join(';')}${formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0426
                    )}`
                );
            }
            if (cfEmails.length > 0) {
                throw new Error(
                    `${cfEmails.join(';')}${formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0427
                    )}`
                );
            }
        } catch (e) {
            callback(e.message);
        } finally {
            _this.props.changeSaveDisabled();
        }
        callback();
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { formatMessage } = this.props.intl;
        const formItemLayout = {
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        };
        return (
            <Form onSubmit={this.handleSubmit} className="outUserInfoForm">
                <div className="Font18 pLeft40 mTop24 BorderBottomD pBottom15">
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0150)}
                </div>
                <Form.Item
                    {...formItemLayout}
                    label={`${formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0150
                    )}(${formatMessage(i18nMessages.ECONFIG_FRONT_A0495)})`}
                    className="mTop20 pLeft40"
                >
                    {getFieldDecorator('emails', {
                        initialValue: '',
                        rules: [
                            getRequiredRule(
                                formatMessage(i18nMessages.ECONFIG_FRONT_A0150),
                                formatMessage
                            ),
                            {
                                validator: this.handleBlur
                            }
                        ],
                        validateFirst: true,
                        validateTrigger: 'onBlur'
                    })(
                        <TextArea
                            placeholder={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0332
                            )}
                            autosize={{ minRows: 4 }}
                            onBlur={this.onBlur}
                        />
                    )}
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({})(UserInfo);
