
import React from 'react';
import md5 from 'blueimp-md5';
import urls, { getQueryString } from 'utils/urls';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
import { Form, Col, Button, Input, message } from 'antd';
import { universalform } from 'src/component/universalForm';
import { validatorPassWord, doPwdStrategy } from 'utils/asyncSingleValidator';

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    },
};
@Form.create()
class EmailValidate extends React.PureComponent {

    state = {
        verificationNum: 60,
        verificationDisabled: false,
        strategy: {},
        buttonLoading: false,
    }

    
    async componentWillMount() {
        const url = window.location.href;
        const accountId = getQueryString('accountId', url) || '';
        try{
            const strategy = await $http.get(urls.doPwdStrategyGetByUserId, {
                accountId
            });
            this.setState({
                strategy
            });
        }catch(e) {
            message.error(e.message);
        }
    }

    FormElement = {
        email: {
            key: 'email',
            label: '邮箱',
            type: 'input',
            size: 'large',
            disabled: true,
            require: true,
            span: 24,
            customFormItemLayout: formItemLayout,
            maxLength: 150
        },
        verificationCode: {
            key: 'verificationCode',
            label: '验证码',
            type: 'input',
            customFormItemLayout: formItemLayout,
        },
        accountPswd: {
            key: 'accountPswd',
            label: '密码',
            type: 'password',
            size: 'large',
            require: true,
            customFormItemLayout: formItemLayout,
            span: 24,
            maxLength: 150
        },
        accountPswdTo: {
            key: 'accountPswdTo',
            label: '确认密码',
            type: 'password',
            customFormItemLayout: formItemLayout,
            size: 'large',
            require: true,
            span: 24,
            maxLength: 150
        },
    }

    // 获取与设置FORM
    getFormItem = (datas) => {
        const { getFieldDecorator } = this.props.form;
        const FormElements = Object.keys(this.FormElement);
        const { verificationNum, verificationDisabled, strategy } = this.state;
        
        this.FormElement['accountPswd'].rules = {
            validator: doPwdStrategy(strategy, this.props.form),
        };
        this.FormElement['accountPswdTo'].rules = {
            validator: validatorPassWord(this.props.form),
        };

        return FormElements.map(
            item => {
                if(item === 'verificationCode') {
                    return (
                        <Col span={24} key={'verificationCode'}>
                            <Form.Item
                                {...formItemLayout}
                                label={'验证码'}
                            >
                                {getFieldDecorator(this.FormElement[item].key, 
                                    Object.assign({}, {
                                        rules: [
                                            {
                                                required: true,
                                                message: `${this.FormElement[item].label}是必填项!`,
                                            },
                                        ],
                                    })
                                )(
                                    <div>
                                        <Col span={15}>
                                            <Input size="large" className="input-verification" placeholder={`请输入${this.FormElement[item].label}`} rows={4} />
                                        </Col>
                                        <Col span={9}>
                                            <Button className="botton-verification" disabled={verificationDisabled} onClick={this.onVerification} size="large">{verificationNum === 60 ? '发送验证码' : `${verificationNum}秒`}</Button>
                                        </Col>
                                    </div>
                                
                                )}
                            </Form.Item>
                        </Col>
                    );
                }else {
                    return universalform({...this.FormElement[item], getFieldDecorator, value: datas[item]});
                }
            }
        );
    }

    onVerification = debounce(async () => {
        let { verificationNum } = this.state;
        const url = window.location.href;
        const tenantId = getQueryString('tenantId', url) || '';
        const { getFieldValue } = this.props.form;
        const email = getFieldValue('email') || '';
        if(!email) {
            message.info('请输入邮箱');
            return;
        }
        
        try{
            await $http.post(urls.verifications, {
                existUser: false,
                sendTarget: email,
                sendWay: 'mail',
                tenantId
            });
            message.success('发送成功!');
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
            message.info(e.message);
            return;
        }
    }, 300)

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                const url = window.location.href;
                const email = getQueryString('email', url) || '';
                const accountId = getQueryString('accountId', url) || '';
                this.setState({buttonLoading: true});
                delete values.accountPswdTo;
                try{
                    await $http.put(urls.updPswdPinCode, {
                        operType: 0,
                        accountPswd: md5(values.accountPswd),
                        pinCodeValue: values.verificationCode,
                        userId: accountId,
                        toUserId: email
                    });
                    message.success('密码修改成功');
                    this.props.goBack();
                    // Modal.success({
                    //     title: '提示',
                    //     content: '密码修改成功!',
                    //     okText: '确定',
                    //     onOk(){
                    //         clearAllCache();
                    //         window.location.href = '/login';
                    //     }
                    // });
                }catch(e) {
                    message.error(e.message);
                }finally{
                    this.setState({buttonLoading: false});
                }
            }
        });
    }, 500)

    render() {
        const url = window.location.href;
        const email = getQueryString('email', url) || '';
        const { buttonLoading } = this.state;
        return (
            <Form>
                {
                    this.getFormItem({email})
                }
                <Col span={6} />
                <Col span={18} className="email-page-content-button">
                    <Button type="primary" loading={buttonLoading} size="large" onClick={this.handleSubmit}>确定</Button>
                </Col>
            </Form>
        );
    }
}

export default EmailValidate;