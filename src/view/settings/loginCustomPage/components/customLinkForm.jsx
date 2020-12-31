import React from 'react';
import { Form, Input } from 'antd';
import { i18nMessages } from 'src/i18n';
import { SaveAndCancelDom } from 'component/drawer';

@Form.create()
class CustomLinkForm extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { loginUrlName1 = '', loginUrl1 = '', loginUrlName2 = '', loginUrl2 = '',loginUrlName3 = '', loginUrl3 = '' } = this.props.customDatas;
        return (
            <Form layout="vertical">
                <div style={{ borderBottom: '0px'}}>
                    <p style={{fontSize:'16px'}}>Link1:</p>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0441)} className="mBottom0">
                        {getFieldDecorator('loginUrlName1', {
                            rules: [
                                {
                                    max: 10,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '10'),
                                }    
                            ],
                            initialValue: loginUrlName1
                        })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0452)} />)}
                    </Form.Item>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0465)} className="mBottom0">
                        {getFieldDecorator('loginUrl1', {
                            rules: [
                                {
                                    max: 500,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '500'),
                                },
                                {
                                    pattern: /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0454),
                                }       
                            ],
                            initialValue: loginUrl1
                        })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0453)} />)}
                    </Form.Item>
                </div>
                <div className="costom-line" />
                <div style={{ borderBottom: '0px'}}>
                    <p style={{fontSize:'16px'}}>Link2:</p>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0441)} className="mBottom0">
                        {getFieldDecorator('loginUrlName2', {
                            rules: [
                                {
                                    max: 10,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '10'),
                                }
                            ],
                            initialValue: loginUrlName2
                        })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0452)} />)}
                    </Form.Item>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0465)} className="mBottom0">
                        {getFieldDecorator('loginUrl2', {
                            rules: [
                                {
                                    max: 500,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '500'),
                                },
                                {
                                    pattern: /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0454),
                                }
                            ],
                            initialValue: loginUrl2
                        })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0453)} />)}
                    </Form.Item>
                </div>
                <div className="costom-line" />
                <div style={{ }}>
                    <p style={{fontSize:'16px'}}>Link3:</p>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0441)} className="mBottom0">
                        {getFieldDecorator('loginUrlName3', {
                            rules: [
                                {
                                    max: 10,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '10'),
                                }
                            ],
                            initialValue: loginUrlName3
                        })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0452)} />)}
                    </Form.Item>
                    <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0465)} className="mBottom0">
                        {getFieldDecorator('loginUrl3', {
                            rules: [
                                {
                                    max: 500,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '500'),
                                },
                                {
                                    pattern: /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/,
                                    message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0454),
                                }
                            ],
                            initialValue: loginUrl3
                        })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0453)} />)}
                    </Form.Item>
                </div>
                <SaveAndCancelDom intl={this.props.intl} onCancelClick={this.onCancelClick} onHandleClick={this.handleSubmit} />
            </Form>
        );
    }

    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log(values);
                this.props.onPolymerization(values);
                this.props.onClose();
            }
        });
    }

    onCancelClick = () => {
        const { loginUrlName1 = '', loginUrl1 = '', loginUrlName2 = '', loginUrl2 = '',loginUrlName3 = '', loginUrl3 = '' } = this.props.originCustomDatas;
        this.props.form.setFieldsValue({ 
            loginUrlName1, loginUrl1, loginUrlName2, loginUrl2, loginUrlName3, loginUrl3
        });
    }
}

export default CustomLinkForm;