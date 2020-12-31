import React from 'react';
import styled from 'styled-components';
import urls from 'utils/urls';
import { debounce } from 'lodash';
import { $http } from 'utils/http';
import { Form, Button, message } from 'antd';
import { universalform, formItemLayoutTop } from 'src/component/universalForm';
import {injectIntl} from 'react-intl';
import { i18nMessages } from 'src/i18n';

const PassWordContainer = styled.div`
    padding: 0 15px;
    .password-header {
        line-height: 60px;
        height: 60px;
        display: flex;
        margin-bottom: 30px;
        border-bottom: 1px solid rgba(216, 216, 216, 1);
        justify-content: space-between;
        align-items: center;
        > h3 {
            display: inline-block;
            margin-top: auto;
        }
    }
`;

@injectIntl
@Form.create()
class PassWord extends React.Component {

    state = {
        buttonLoading: false,
        paddwordInfo: {}
    }

    componentWillMount() {
        this.getSecurity();
    }

    // 初始化表单信息
    getSecurity = async () => {
        try{
            const paddwordInfo = await $http.get(urls.getSecurity);
            this.setState({paddwordInfo});
        }catch(e) {
            message.error(e.message);
        }
    }

    // 表单构建
    FormElement = {
        minNumContains: {
            key: 'minNumContains',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0105),
            type: 'input',
            require: true,
            customFormItemLayout: formItemLayoutTop,
            rules: {
                pattern: /^[0-9]{0,3}$/,
                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0201)
            }
        },
        containsUpperAndLower: {
            key: 'containsUpperAndLower',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0106),
            type: 'single_dropdown',
            require: true,
            value: '1',
            customFormItemLayout: formItemLayoutTop,
            selectList: [
                {
                    name: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0590),
                    value: '1'
                },
                {
                    name: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0591),
                    value: '0'
                },
            ]
        },
        pwdExpiredTimeSpace: {
            key: 'pwdExpiredTimeSpace',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0107),
            type: 'input',
            require: true,
            customFormItemLayout: formItemLayoutTop,
            rules: {
                pattern: /^[0-9]{0,3}$/,
                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0201)
            }
        },
        minPwdLength: {
            key: 'minPwdLength',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0108),
            type: 'input',
            require: true,
            customFormItemLayout: formItemLayoutTop,
            rules:  {
                pattern: /^[0-9]{0,3}$/,
                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0201)
            }
        },
        pwdHistoryNum: {
            key: 'pwdHistoryNum',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0109),
            type: 'input',
            require: true,
            customFormItemLayout: formItemLayoutTop,
            rules:  {
                pattern: /^[0-9]{0,3}$/,
                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0201)
            }
        },
        minCharacterContains: {
            key: 'minCharacterContains',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0110),
            type: 'input',
            require: true,
            customFormItemLayout: formItemLayoutTop,
            rules: {
                pattern: /^[0-9]{0,3}$/,
                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0201)
            }
        },
        pwdErrorCount: {
            key: 'pwdErrorCount',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0111),
            type: 'input',
            require: true,
            customFormItemLayout: formItemLayoutTop,
            rulse: {
                pattern: /^[0-9]{0,3}$/,
                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0201)
            }
        },
        specialCharacterContains: {
            key: 'specialCharacterContains',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0112),
            require: true,
            type: 'single_dropdown',
            value: '1',
            customFormItemLayout: formItemLayoutTop,
            selectList: [
                {
                    name: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0590),
                    value: '1'
                },
                {
                    name: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0591),
                    value: '0'
                },
            ]
        },
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({
                    buttonLoading: true
                });
                try{
                    await $http.put(urls.updateSecurity, values);
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0219));
                }catch(e) {
                    message.error(e.message);
                }finally{
                    this.setState({
                        buttonLoading: false
                    });
                }
            }
        });
    }, 500)

    // 获取与设置FORM
    getFormItem = (datas) => {
        const { getFieldDecorator } = this.props.form;
        const FormElements = Object.keys(this.FormElement);
        return FormElements.map(
            item => {
                return universalform({...this.FormElement[item], getFieldDecorator, value: `${datas[item]}` || `${this.FormElement[item].value}` || '0'});
            }
        );
    }

    render() {

        const { buttonLoading, paddwordInfo = {} } = this.state;
        
        return (
            <PassWordContainer>
                <div className="password-header">
                    <h3>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0041)}</h3>
                    <Button onClick={this.handleSubmit} type="primary" loading={buttonLoading}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}</Button>
                </div>
                <Form layout="vertical" className="custom-col">
                    {
                        this.getFormItem(paddwordInfo)
                    }
                </Form>
            </PassWordContainer>
        );
    }
}

export default PassWord;