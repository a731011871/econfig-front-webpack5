import React from 'react';
import { pickBy } from 'lodash';
import { DEFAULT_PAGE_DATAS } from 'utils/utils';
import { Form, Input } from 'antd';
import { i18nMessages } from 'src/i18n';
import { SaveAndCancelDom } from 'component/drawer';

@Form.create()
class CustomTitleForm extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { appName = DEFAULT_PAGE_DATAS.appName } = this.props.customDatas;
        console.log(this.props.customDatas);
        return (
            <Form layout="vertical">
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0439)} className="mBottom1">
                    {getFieldDecorator('appName', {
                        rules: [
                            {
                                required: true,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0451),
                            },
                            {
                                max: 20,
                                message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0206).replace('xx', '20'),
                            }
                        ],
                        initialValue: appName
                    })(<Input placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0451)} />)}
                </Form.Item>
                <span className="title-tip-ccc">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0457)}</span>
                <SaveAndCancelDom intl={this.props.intl} onCancelClick={this.onCancelClick} onHandleClick={this.handleSubmit} />
            </Form>
        );
    }

    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.onPolymerization(pickBy({appName: values.appName}, d => d !== ''));
                this.props.onClose();
            }
        });
    }

    onCancelClick = () => {
        const { appName = DEFAULT_PAGE_DATAS.appName } = this.props.originCustomDatas;
        this.props.form.setFieldsValue({ 
            appName
        });
    }
}

export default CustomTitleForm;