
import React from 'react';
import md5 from 'blueimp-md5';
import urls, { getQueryString } from 'utils/urls';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
// import { clearAllCache } from 'utils/utils';
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
class PhoneValidate extends React.PureComponent {

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
        mobile: {
            key: 'mobile',
            label: '手机',
            type: 'input',
            size: 'large',
            disabled: true,
            customFormItemLayout: formItemLayout,
            require: true,
            span: 24,
            maxLength: 50,
            rules: [{
                pattern: /^[0-9]*$/,
                message: '请输入正确的手机号码'
            }]
        },
        verificationCode: {
            key: 'verificationCode',
            label: '验证码',
            customFormItemLayout: formItemLayout,
            type: 'input',
        },
        accountPswd: {
            key: 'accountPswd',
            label: '密码',
            type: 'password',
            size: 'large',
            customFormItemLayout: formItemLayout,
            require: true,
            span: 24,
            maxLength: 150
        },
        accountPswdTo: {
            key: 'accountPswdTo',
            label: '确认密码',
            type: 'password',
            size: 'large',
            customFormItemLayout: formItemLayout,
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
        // const tenantId = getQueryString('tenantId', url) || '';
        const areaCode = getQueryString('areaCode', url) || '';
        const { getFieldValue } = this.props.form;
        const mobile = getFieldValue('mobile') || {};
        // if(!mobile.phone) {
        //     message.info('请输入手机号');
        //     return;
        // }
        if(!/^[0-9]*$/.test(mobile)) {
            message.info('请输入正确的手机号');
            return;
        }
        try{
            // await $http.post(urls.verifications, {
            //     existUser: false,
            //     sendTarget: mobile,
            //     sendWay: 'sms',
            //     tenantId
            // });
            await $http.post(urls.getCodeGlobal, {
                target: mobile,
                sendMode: 1,
                sendWay: 'sms',
                areaCode
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
                console.log('Received values of form: ', values);
                const url = window.location.href;
                const accountId = getQueryString('accountId', url) || '';
                const mobile = getQueryString('mobile', url) || '';
                this.setState({buttonLoading: true});
                delete values.accountPswdTo;
                try{
                    await $http.put(urls.updPswdPinCode, {
                        operType: 0,
                        accountPswd: md5(values.accountPswd),
                        pinCodeValue: values.verificationCode,
                        userId: accountId,
                        toUserId: mobile
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
        const mobile = getQueryString('mobile', url) || '';
        const { buttonLoading } = this.state;
        return (
            <Form>
                {
                    this.getFormItem({mobile})
                }
                <Col span={6} />
                <Col span={18} className="email-page-content-button">
                    <Button type="primary" loading={buttonLoading} size="large" onClick={this.handleSubmit}>确定</Button>
                </Col>
            </Form>
        );
    }
}

export default PhoneValidate;