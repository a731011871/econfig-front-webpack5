
import React from 'react';
import md5 from 'blueimp-md5';
import urls, { getQueryString } from 'utils/urls';
import { $http } from 'utils/http';
import { validatorPassWord } from 'utils/asyncSingleValidator';
import { clearAllCache } from 'utils/utils';
import { debounce } from 'lodash';
import { Form, Col, Button, message, Modal } from 'antd';
import { universalform } from 'src/component/universalForm';

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
class CcpActive extends React.PureComponent {

    state = {
        buttonLoading: false
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
            customFormItemLayout: formItemLayout,
            size: 'large',
            require: true,
            span: 24,
            maxLength: 150
        },
    }

    newValidatorPassWord = (rule, value, callback) => {
        const { getFieldValue } = this.props.form;
        if (getFieldValue('accountPswdTo') === undefined) {
            callback();
        } else {
            this.props.form.validateFields(['accountPswdTo'], {
                force: true
            });
        }
        callback();
    }

    // 获取与设置FORM
    getFormItem = (datas) => {
        const { getFieldDecorator } = this.props.form;
        const FormElements = Object.keys(this.FormElement);

        this.FormElement['accountPswd'].rules = {
            validator: this.newValidatorPassWord,
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
                console.log('Received values of form: ', values);
                const url = window.location.href;
                const inviteId = getQueryString('inviteId', url) || '';
                const userId = getQueryString('userId', url) || '';
                try{
                    this.setState({buttonLoading: true});
                    await $http.post(urls.activePersonalUser, {
                        accountPswd: md5(values.accountPswd),
                        inviteId,
                        userId
                    });
                    Modal.success({
                        title: '提示',
                        content: '激活成功!',
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
        const { buttonLoading } = this.state;
        return (
            <React.Fragment>
                <div className="email-page-content-con">
                    <div className="email-page-content-title">用户激活</div>
                </div>
                <div className="email-page-content-form">
                    <Form>
                        {
                            this.getFormItem({})
                        }
                        <Col span={6} />
                        <Col span={18} className="email-page-content-button">
                            <Button type="primary" size="large" loading={buttonLoading} onClick={this.handleSubmit}>确定</Button>
                        </Col>
                    </Form>
                </div>
            </React.Fragment>
        );
    }
}

export default CcpActive;