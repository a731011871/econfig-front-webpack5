import React from 'react';
import { Form, message, Input, Button } from 'antd';
import PropTypes from 'prop-types';
import { getRequiredRule, whitespaceRule } from 'utils/validateRules';
import { fieldHasError } from 'utils/fieldHasError';
import styled from 'styled-components';
import AreaSelect from 'src/component/areaSelect';

import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

// const Option = Select.Option;
const TextArea = Input.TextArea;

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
class WarehouseDrawer extends React.Component {
    static propTypes = {
        addWareHouse: PropTypes.func,
        wareHouseInfo: PropTypes.object,
        updateWareHouse: PropTypes.func,
        hideDrawer: PropTypes.func
    };

    componentDidMount() {
        if (this.props.wareHouseInfo.id) {
            const { wareHouseInfo } = this.props;
            const area = [];
            if (wareHouseInfo.country) area.push(wareHouseInfo.country);
            if (wareHouseInfo.province) area.push(wareHouseInfo.province);
            if (wareHouseInfo.city) area.push(wareHouseInfo.city);
            if (wareHouseInfo.county) area.push(wareHouseInfo.county);
            const dto = Object.assign({}, this.props.wareHouseInfo, { area });
            setTimeout(() => {
                this.props.form.setFieldsValue(dto);
            }, 300);
        }
        this.props.form.validateFields();
    }

    get isEdit() {
        return !!this.props.wareHouseInfo.id;
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
            const formData = form.getFieldsValue();
            const dto = Object.assign({}, formData, {
                country: formData.area[0] || '',
                province: formData.area[1] || '',
                city: formData.area[2] || '',
                county: formData.area[3] || '',
                id: this.props.wareHouseInfo.id || ''
            });
            try {
                if (_this.isEdit) {
                    _this.props.updateWareHouse(dto);
                } else {
                    _this.props.addWareHouse(dto);
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
                className="wareHouseInfoDrawerForm"
                style={{ height: '100%' }}
            >
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0124
                    )}
                    {...formItemLayout}
                >
                    {getFieldDecorator('storeroomName', {
                        initialValue: '',
                        rules: [
                            getRequiredRule(
                                this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0124
                                ),
                                this.props.intl.formatMessage
                            ),
                            whitespaceRule(
                                this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0124
                                ),
                                this.props.intl.formatMessage
                            )
                        ]
                    })(<Input />)}
                </Form.Item>
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0254
                    )}
                    {...formItemLayout}
                >
                    {getFieldDecorator('area', {
                        initialValue: '',
                        rules: []
                    })(<AreaSelect type={1} />)}
                </Form.Item>
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0125
                    )}
                    {...formItemLayout}
                >
                    {getFieldDecorator('contact', {
                        initialValue: '',
                        rules: []
                    })(<Input />)}
                </Form.Item>
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0263
                    )}
                    {...formItemLayout}
                >
                    {getFieldDecorator('phone', {
                        initialValue: '',
                        rules: []
                    })(<Input />)}
                </Form.Item>
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0126
                    )}
                    {...formItemLayout}
                >
                    {getFieldDecorator('cycle', {
                        initialValue: '',
                        rules: []
                    })(<Input maxLength={10} />)}
                </Form.Item>
                {/*<Form.Item label={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0086)} {...formItemLayout}>*/}
                {/*{getFieldDecorator('status', {*/}
                {/*initialValue: '1',*/}
                {/*rules: [getRequiredRule(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0086),this.props.intl.formatMessage)]*/}
                {/*})(*/}
                {/*<Select children={[*/}
                {/*<Option key="1">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0144)}</Option>,*/}
                {/*<Option key="0">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0353)}</Option>*/}
                {/*]}*/}
                {/*/>*/}
                {/*)}*/}
                {/*</Form.Item>*/}
                <Form.Item
                    label={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0255
                    )}
                    {...formItemLayout}
                >
                    {getFieldDecorator('region', {
                        initialValue: '',
                        rules: []
                    })(<TextArea />)}
                </Form.Item>
                <AbsoluteDiv>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom10 mTop10"
                        disabled={fieldHasError(getFieldsError())}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0062
                        )}
                    </Button>
                </AbsoluteDiv>
            </Form>
        );
    }
}

export default WarehouseDrawer;
