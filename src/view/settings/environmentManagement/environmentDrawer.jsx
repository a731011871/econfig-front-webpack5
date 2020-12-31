import React from 'react';
import { Form, message, Input, Button, Select } from 'antd';
import PropTypes from 'prop-types';
import { getRequiredRule, whitespaceRule } from 'utils/validateRules';
import { fieldHasError } from 'utils/fieldHasError';
import styled from 'styled-components';

import {injectIntl} from 'react-intl';
import { i18nMessages } from 'src/i18n';

const Option = Select.Option;

const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
`;

@injectIntl
@Form.create()
class EnvironmentDrawer extends React.Component {
    static propTypes = {
        addEnv: PropTypes.func,
        environmentInfo: PropTypes.object,
        updateEnv: PropTypes.func,
        hideDrawer: PropTypes.func
    };

    componentDidMount() {
        if (this.props.environmentInfo.id) {
            this.props.form.setFieldsValue(
                Object.assign({}, this.props.environmentInfo, {
                    envType: this.props.environmentInfo.envType.toString()
                })
            );
        }
        this.props.form.validateFields();
    }

    get isEdit() {
        return !!this.props.environmentInfo.id;
    }

    handleSubmit = e => {
        e.preventDefault();
        e.stopPropagation();
        const { form } = this.props;
        const _this = this;
        form.validateFields(error => {
            if (error) {
                return;
            }
            const dto = form.getFieldsValue();
            try {
                if (_this.isEdit) {
                    this.props.updateEnv(dto);
                } else {
                    this.props.addEnv(dto);
                }
                _this.props.hideDrawer();
            } catch (e) {
                message.error(e.message);
            }
        });
    };

    render() {
        const { getFieldDecorator, getFieldsError } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        };
        return (
            <Form
                onSubmit={this.handleSubmit}
                className="environmentInfoDrawerForm"
                style={{ height: '100%' }}
            >
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0122)} {...formItemLayout}>
                    {getFieldDecorator('name', {
                        initialValue: '',
                        rules: [
                            getRequiredRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0122),this.props.intl.formatMessage),
                            whitespaceRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0122),this.props.intl.formatMessage)
                        ]
                    })(<Input maxLength={100} />)}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0123)} {...formItemLayout}>
                    {getFieldDecorator('envType', {
                        initialValue: '2',
                        rules: [getRequiredRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0123),this.props.intl.formatMessage)]
                    })(
                        <Select
                            children={[<Option key="2">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0354)}</Option>]}
                        />
                    )}
                </Form.Item>
                <Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0253)} {...formItemLayout}>
                    {getFieldDecorator('status', {
                        initialValue: '1',
                        rules: [getRequiredRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0253),this.props.intl.formatMessage)]
                    })(
                        <Select
                            children={[
                                <Option key="1">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0144)}</Option>,
                                <Option key="0">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0353)}</Option>
                            ]}
                        />
                    )}
                </Form.Item>
                <AbsoluteDiv>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom10 mTop10"
                        disabled={fieldHasError(getFieldsError())}
                    >
                        {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </Form>
        );
    }
}

export default EnvironmentDrawer;
