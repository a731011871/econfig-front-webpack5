import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { i18nMessages } from 'src/i18n';
import { $http } from 'utils/http';
import md5 from 'blueimp-md5';
import { getRequiredRule } from 'utils/validateRules';
import { ModalBox } from './styled';

const formItemLayout = {
    labelCol: {
        xs: { span: 5 },
        sm: { span: 5 }
    },
    wrapperCol: {
        xs: { span: 15 },
        sm: { span: 15 }
    }
};

const PwdComponent = props => {
    const userInfo = JSON.parse(
        window.sessionStorage.getItem('sso_loginInfo') || '{}'
    );
    const { accountName } = userInfo;
    const { visible, onOk, onClose, form, mask = false, intl } = props;
    const { getFieldDecorator } = form;
    // const [visible, setVisible] = useState(props.visible);
    const onSubmit = () => {
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            try {
                await $http.post('/api/csp-service/users/authByNamePswd', {
                    accountName,
                    accountPswd: md5(values.password)
                });
                // message.success(localMessage('loginSuccess'));
                onOk();
            } catch (error) {
                message.error(error.message);
            }
        });
    };

    return (
        <ModalBox
            title={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0760)}
            visible={visible}
            width={700}
            mask={mask}
            footer={null}
            // okText={localMessage('ok')}
            // cancelText={localMessage('cancel')}
            // onOk={onSubmit}
            onCancel={onClose}
        >
            <div className="desc">
                {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0761)}
            </div>
            <Form>
                {/* <Form.Item
                    label={localMessage('accountName')}
                    {...formItemLayout}
                >
                    {getFieldDecorator('accountName', {
                        initialValue:
                            `${accountName}${
                                userName ? `(${userName})` : ''
                            }` || '',
                        rules: []
                    })(<Input disabled />)}
                </Form.Item> */}
                <Form.Item
                    label={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0130)}
                    {...formItemLayout}
                >
                    {getFieldDecorator('password', {
                        initialValue: '',
                        rules: [
                            getRequiredRule(
                                intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0130
                                ),
                                intl.formatMessage
                            )
                        ]
                    })(
                        <Input
                            className="security"
                            onPaste={e => e.preventDefault()}
                            autoComplete="off"
                        />
                    )}
                </Form.Item>
                <div style={{ textAlign: 'right' }}>
                    <Button style={{ marginRight: 16 }} onClick={onClose}>
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0281)}
                    </Button>
                    <Button type="primary" onClick={onSubmit}>
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279)}
                    </Button>
                </div>
            </Form>
        </ModalBox>
    );
};
export default Form.create()(PwdComponent);
