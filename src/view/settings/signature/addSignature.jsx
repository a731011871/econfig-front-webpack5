import React from 'react';
import { debounce } from 'lodash';
import urls, { parseApiUrl } from 'utils/urls';
import { $http } from 'utils/http';
import { Form, message } from 'antd';
import { i18nMessages } from 'src/i18n';
import { SaveDom } from 'component/drawer';
import { universalform } from 'src/component/universalForm';

@Form.create()
class AddSignature extends React.Component {
    state = {
        buttonLoading: false
    };

    componentWillMount() {}

    FormElement = {
        oid: {
            key: 'oid',
            label: 'OID',
            type: 'input',
            require: true,
            rules: [
                {
                    max: 50,
                    message: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0314
                    )
                },
                {
                    pattern: /^[a-zA-Z0-9_-]*$/,
                    message: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0316
                    )
                }
            ]
        },
        signName: {
            key: 'signName',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0117
            ),
            type: 'input',
            require: true,
            rules: {
                max: 150,
                message: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0315
                )
            }
        },
        signMethod: {
            key: 'signMethod',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0118
            ),
            type: 'single_dropdown',
            value: '0',
            selectList: [
                {
                    name: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0592
                    ),
                    value: '0'
                },
                {
                    name: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0593
                    ),
                    value: '1'
                }
            ]
        },
        responsibilityDeclare: {
            key: 'responsibilityDeclare',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0119
            ),
            type: 'input',
            require: true,
            maxLength: 500
            // rules: {
            //     max: 500,
            //     message: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0315)
            // }
        },
        status: {
            key: 'status',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0120
            ),
            type: 'single_dropdown',
            value: '1',
            selectList: [
                {
                    name: '禁用',
                    value: '0'
                },
                {
                    name: '启用',
                    value: '1'
                }
            ]
        }
    };

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                console.log(this.props);
                this.setState({ buttonLoading: true });
                const {
                    isAdd,
                    signatureInfo = {},
                    tableEvent,
                    onClose
                } = this.props;
                try {
                    if (isAdd) {
                        await $http.post(urls.addSign, values);
                        message.success(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0262
                            )
                        );
                    } else {
                        await $http.put(
                            parseApiUrl(urls.updateSign, {
                                signid: `${signatureInfo.id}`
                            }),
                            {
                                ...values
                            }
                        );
                        message.success(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0230
                            )
                        );
                    }
                } catch (e) {
                    message.error(e.message);
                } finally {
                    this.setState({ buttonLoading: false });
                    onClose();
                    tableEvent.fetchData({ pageNo: 1, pageSize: 50 });
                }
            }
        });
    }, 500);

    // 获取与设置FORM
    getFormItem = datas => {
        const { getFieldDecorator } = this.props.form;
        const FormElements = Object.keys(this.FormElement);
        return FormElements.map(item => {
            return universalform({
                ...this.FormElement[item],
                getFieldDecorator,
                value: datas[item] || this.FormElement[item].value || '',
                span: 24
            });
        });
    };

    render() {
        const { buttonLoading } = this.state;
        const { signatureInfo = {} } = this.props;
        return (
            <Form layout="vertical">
                {this.getFormItem(signatureInfo)}
                <SaveDom
                    buttonLoading={buttonLoading}
                    onHandleClick={this.handleSubmit}
                    intl={this.props.intl}
                />
            </Form>
        );
    }
}

export default AddSignature;
