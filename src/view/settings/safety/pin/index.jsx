import React from 'react';
import styled from 'styled-components';
import urls from 'utils/urls';
import { debounce } from 'lodash';
import { $http } from 'utils/http';
import { Form, Button, message } from 'antd';
import { universalform, formItemLayoutTop } from 'src/component/universalForm';
import {injectIntl} from 'react-intl';
import { i18nMessages } from 'src/i18n';

const PinContainer = styled.div`
    clear: both;
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
class Pin extends React.Component {

    state = {
        buttonLoading: false,
        pinInfo: {}
    }

    componentWillMount() {
        this.getPin();
    }

    // 初始化表单信息
    getPin = async () => {
        try{
            const pinInfo = await $http.get(urls.getPin);
            this.setState({ pinInfo });
        }catch(e) {
            message.error(e.message);
        }
    }

    // 表单构建
    FormElement = {
        // pinStrategy: {
        //     key: 'pinStrategy',
        //     label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0113),
        //     type: 'single_dropdown',
        //     require: true,
        //     value: 'Digit',
        //     customFormItemLayout: formItemLayoutTop,
        //     selectList: [
        //         {
        //             name: '数字',
        //             value: 'Digit'
        //         },
        //         {
        //             name: '大写字符',
        //             value: 'UpperCharacter'
        //         },
        //         {
        //             name: '小写字符',
        //             value: 'LowerCharacter'
        //         },
        //         {
        //             name: '大小写字符',
        //             value: 'UpperAndLowerCharacter'
        //         },
        //         {
        //             name: '大写+数字',
        //             value: 'UpperCharacterAndDigit'
        //         },
        //         {
        //             name: '小写+数字',
        //             value: 'LowerCharacterAndDigit'
        //         },
        //         {
        //             name: '大小写+数字',
        //             value: 'UpperAndLowerCharacterAndDigit'
        //         },
        //     ]
        // },
        // pinLength: {
        //     key: 'pinLength',
        //     label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0114),
        //     type: 'input',
        //     require: true,
        //     customFormItemLayout: formItemLayoutTop,
        //     rules: [{
        //         pattern: /^[0-9]{0,2}$/,
        //         message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0317),
        //     }]
        // },
        // pinNoticeType: {
        //     key: 'pinNoticeType',
        //     label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0115),
        //     type: 'single_dropdown',
        //     require: true,
        //     customFormItemLayout: formItemLayoutTop,
        //     selectList: [
        //         {
        //             value: 'mail',
        //             name: '邮箱'
        //         },
        //         {
        //             value: 'sms',
        //             name: '短信'
        //         }
        //     ]
        // },
        pinExpiredTime: {
            key: 'pinExpiredTime',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0116),
            type: 'input',
            require: true,
            customFormItemLayout: formItemLayoutTop,
            rules:  {
                pattern: /^[1-9][0-9]{0,2}$/,
                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0201)
            }
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
                    await $http.put(urls.updatePin, values);
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
                return universalform({...this.FormElement[item], getFieldDecorator, value: `${datas[item]}`});
            }
        );
    }

    render() {
        const { buttonLoading, pinInfo = {} } = this.state;
        return (
            <PinContainer>
                <div className="password-header">
                    <h3>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0113)}</h3>
                    <Button onClick={this.handleSubmit} type="primary" loading={buttonLoading}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}</Button>
                </div>
                <Form layout="vertical" className="custom-col">
                    {
                        this.getFormItem(pinInfo)
                    }
                </Form>
            </PinContainer>
        );
    }
}

export default Pin;