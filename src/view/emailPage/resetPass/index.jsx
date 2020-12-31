
import React from 'react';
import md5 from 'blueimp-md5';
import { EmailPageContainer } from 'container/layout';
import urls, { getQueryString } from 'utils/urls';
import { Form, Col, Button, message, Modal } from 'antd';
import { $http } from 'utils/http';
import { clearAllCache } from 'utils/utils';
import { debounce } from 'lodash';
import { universalform } from 'src/component/universalForm';
import { validatorPassWord, doPwdStrategy } from 'utils/asyncSingleValidator';

import banner from 'assets/images/banner.jpg';

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
class ResetPass extends React.PureComponent {

    state = {
        isFailure: false,
        buttonLoading: false,
        strategy: {}, // 密码规则
    }

    async componentWillMount() {
        const url = window.location.href;
        const valid = getQueryString('valid', url) || '';
        const tenantId = getQueryString('tenantId', url) || '';
        try{
            const result = await $http.get(urls.verifyValid, {
                token: valid
            });
            const strategy = await $http.get(urls.doPwdStrategyGetByTenantId, {
                tenantId
            });
            this.setState({
                strategy,
                isFailure: !result
            });
            if(!result) {
                document.title = '当前链接已失效!';
            }
        }catch(e) {
            message.error(e.message);
            this.setState({
                isFailure: false
            });
            document.title = '当前链接已失效!';
        }
    }

    FormElement = {
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
            size: 'large',
            require: true,
            customFormItemLayout: formItemLayout,
            span: 24,
            maxLength: 150
        },
    }

    // 获取与设置FORM
    getFormItem = (datas) => {
        const { getFieldDecorator } = this.props.form;
        const FormElements = Object.keys(this.FormElement);
        const { strategy } = this.state;
        
        this.FormElement['accountPswd'].rules = {
            validator: doPwdStrategy(strategy, this.props.form),
        };
        this.FormElement['accountPswdTo'].rules = {
            validator: validatorPassWord(this.props.form),
        };

        return FormElements.map(
            item => {
                return universalform({...this.FormElement[item], getFieldDecorator, value: datas[item]});
            }
        );
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                const url = window.location.href;
                const userId = getQueryString('userId', url) || '';
                const valid = getQueryString('valid', url) || '';
                this.setState({buttonLoading: true});
                delete values.accountPswdTo;
                try{
                    await $http.put(urls.updPswd, {
                        operType: 0,
                        accountPswd: md5(values.accountPswd),
                        accountPswdNew: md5(values.accountPswd),
                        userId,
                        valid
                    });
                    Modal.success({
                        title: '提示',
                        content: '密码修改成功!',
                        okText: '确定',
                        onOk(){
                            clearAllCache();
                            window.location.href = '/login';
                        }
                    });
                }catch(e) {
                    message.error(e.message);
                }finally{
                    this.setState({buttonLoading: false});
                }
            }
        });
    }, 500)

    render() {

        const { isFailure, buttonLoading } = this.state;

        if(isFailure) {
            return (
                <EmailPageContainer>
                    <div className="email-page-banner" style={{backgroundImage: `url(${banner})`}} />
                    <div className="email-page-content">
                        <span>当前链接已失效!</span>
                    </div>
                </EmailPageContainer>
            );
        } else {
            return (
                <EmailPageContainer>
                    <div className="email-page-banner" style={{backgroundImage: `url(${banner})`}} />
                    <div className="email-page-content">
                        <div className="email-page-content-con">
                            <div className="email-page-content-title">重置密码</div>
                        </div>
                        <div className="email-page-content-form">
                            <Form>
                                {
                                    this.getFormItem({})
                                }
                                <Col span={6} />
                                <Col span={18} className="email-page-content-button">
                                    <Button type="primary" loading={buttonLoading} size="large" onClick={this.handleSubmit}>确定</Button>
                                </Col>
                            </Form>
                        </div>
                    </div>
                </EmailPageContainer>
            );
        }

        
    }

}

export default ResetPass;