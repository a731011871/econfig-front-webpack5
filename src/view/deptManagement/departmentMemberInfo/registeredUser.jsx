import React, { Component } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { i18nMessages } from 'src/i18n';

const { Option } = Select;

@Form.create()
class RegisteredUser extends Component {

    state = {
        userList: []
    }

    emailKey = ''

    onSubmit = () => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const key = values.account.key;
                const email = key.split('---')[1];
                try {
                    const data = await $http.get(
                        `${urls.getUserInfoByEmail}?email=${email}`
                    );
                    if(data && data.accountId) {
                        this.props.onRegisteredUser(data);
                    }
                } catch (e) {
                    message.error(e.message);
                }
            }
        });
    }

    handleBlur = async () => {
        const { getFieldValue, resetFields } = this.props.form;
        const key = getFieldValue('key') || '';
        if(key && (key !== this.emailKey)) {
            try{
                resetFields(['account']);
                const result = await $http.post(urls.getUserInfoByEmailOrMobile, { key });
                this.setState({userList: result});
                this.emailKey = key;
            }catch(e) {
                message.error(e.message);
            }
        }
    }

    render() {
        const { userList } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Form>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0561)}>
                    {getFieldDecorator('key', {
                        initialValue: '',
                        rules: [
                            { required: true, message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0565) },
                        ],
                    })(
                        <Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0565)} onBlur={this.handleBlur} style={{width: 350}} />,
                    )}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0562)}>
                    {getFieldDecorator('account', {
                        rules: [{ required: true, message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0566) }],
                    })(
                        <Select labelInValue style={{width: 350}}  placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0566)}>
                            {
                                userList.map(item => (
                                    <Option key={`${item.id}---${item.email}`} value={`${item.id}---${item.email}`}>{item.accountName}{item.userName ? `(${item.userName})` : ''}</Option>
                                ))
                            }
                        </Select>,
                    )}
                </Form.Item>
                <div style={{textAlign: 'right'}}>
                    <Button onClick={() => this.props.onVisibleClose()}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0281)}</Button>
                    <Button style={{marginLeft: 10}} onClick={this.onSubmit} type="primary">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279)}</Button>
                </div>
            </Form>
        );
    }

}

export default RegisteredUser;