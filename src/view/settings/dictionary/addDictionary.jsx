import React from 'react';
import urls, { parseApiUrl } from 'utils/urls';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
import { Form, message } from 'antd';
import { SaveDom } from 'component/drawer';
import { i18nMessages } from 'src/i18n';
import { universalform } from 'src/component/universalForm';

@Form.create()
class AddDictionary extends React.Component {
    state = {
        buttonLoading: false,
        dictionaryInfo: {}
    };

    componentWillMount() {
        const { isAdd, dictionaryInfo } = this.props;
        if (isAdd) {
            this.setState({ dictionaryInfo: {} });
        } else {
            this.setState({ dictionaryInfo });
        }
    }

    FormElement = {
        name: {
            key: 'name',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0200
            ),
            type: 'input',
            require: true,
            span: 24,
            maxLength: 150
        }
    };

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({ buttonLoading: true });
                const {
                    isAdd,
                    dictionaryInfo,
                    dictItemInfo = {},
                    tableEvent,
                    onClose
                } = this.props;
                try {
                    if (isAdd) {
                        await $http.post(urls.addDictItem, {
                            dictTypeId: dictItemInfo.eventKey,
                            dictTypeName: dictItemInfo.children,
                            name: values.name,
                            refType: 'tenant'
                        });
                        message.success(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0262
                            )
                        );
                    } else {
                        await $http.put(
                            parseApiUrl(urls.updDictItem, {
                                dictItemId: dictionaryInfo.id
                            }),
                            {
                                dictTypeId: dictItemInfo.eventKey,
                                dictTypeName: dictItemInfo.children,
                                name: values.name,
                                refType: 'tenant'
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
                value: datas[item]
            });
        });
    };

    render() {
        const { buttonLoading, dictionaryInfo } = this.state;
        return (
            <Form layout="vertical">
                {this.getFormItem(dictionaryInfo)}
                <SaveDom
                    buttonLoading={buttonLoading}
                    intl={this.props.intl}
                    onHandleClick={this.handleSubmit}
                />
            </Form>
        );
    }
}

export default AddDictionary;
