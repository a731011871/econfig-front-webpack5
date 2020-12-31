import React from 'react';
import PropTypes from 'prop-types';
import { debounce, find, uniq, includes } from 'lodash';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { i18nMessages } from 'src/i18n';
import { Form, message, Select, Col } from 'antd';
import { getBasicInfoAreaValues, getDataFromArea } from 'utils/functions';
import { SaveDom } from 'component/drawer';
import { universalform } from 'src/component/universalForm';
const { Option } = Select;

@Form.create()
class InstitutionInfo extends React.Component {
    static propTypes = {
        intl: PropTypes.object.isRequired,
        languagetType: PropTypes.string //中英文  ch中文  en英文
    };

    constructor(props) {
        super(props);
        this.state = {
            buttonLoading: false,
            institutionList: [],
            departmentList: [], // 专业
            selectedInstitution: {}
        };
    }

    componentDidMount() {
        if (this.props.institutionInfo.id) {
            // const result = await $http.get(urls.updateEnterprise, {
            //     type: 'enterprise_institution',
            //     enterpriseId: this.props.institutionInfo.id
            // }) || {};
            const departmentList = this.props.institutionInfo.extendData
                ? this.props.institutionInfo.extendData.map(item => {
                    return {
                        value: item.id,
                        name: item.professionalName
                    };
                })
                : [];
            console.log(departmentList);
            this.setState({ departmentList });
            this.props.form.setFieldsValue({
                area: getBasicInfoAreaValues({
                    ...this.props.institutionInfo,
                    county: this.props.institutionInfo.countyId
                }),
                extendData: departmentList.map(item => item.value)
            });
        }
    }

    // 主要研究者查找
    searchCroList = debounce(async name => {
        if (name.trim()) {
            try {
                const result = await $http.get(urls.getAllEnterpriseList, {
                    type: 'enterprise_institution',
                    name,
                    pageIndex: 1,
                    pageSize: 10
                });
                this.setState({
                    institutionList:
                        result.data.length > 0
                            ? result.data
                            : [
                                {
                                    name:
                                          this.props.languagetType === 'ch'
                                              ? name
                                              : '',
                                    localeNameEn:
                                          this.props.languagetType === 'en'
                                              ? name
                                              : '',
                                    id: new Date().getTime()
                                }
                            ]
                });
            } catch (e) {
                message.error(e.message);
            }
        }
    }, 500);

    setSelectInfo = id => {
        const selectObj = find(
            this.state.institutionList,
            item => item.id === id
        );
        // 需要重新赋值的对象
        const setValueObj = {
            socialCreditCode: selectObj.socialCreditCode || '',
            area: selectObj.countryId
                ? getBasicInfoAreaValues({
                    ...selectObj,
                    county: selectObj.countyId
                })
                : [],
            address: selectObj.address || '',
            localeAddressEn: selectObj.localeAddressEn || '',
            masterDataName: selectObj.masterDataName || '',
            localeMasterNameEn: selectObj.localeMasterNameEn || ''
        };
        // 专业列表
        if (selectObj.extendData) {
            const departmentList = selectObj.extendData.map(item => ({
                value: item.id,
                name: item.professionalName
            }));
            this.setState({ departmentList });
            setValueObj.extendData = selectObj.extendData.map(item => item.id);
        }
        this.setState({ selectedInstitution: selectObj });
        this.props.form.setFieldsValue(setValueObj);
    };

    changeName = value => {
        // 新增时，清空名称，需要吧之前带出来的信息也清空掉(只清空带出来的信息，别的手填的不清空)
        const selectObj = find(
            this.state.institutionList,
            item => item.id === this.props.form.getFieldValue('name')
        );
        if (!this.props.institutionInfo.id && !value && selectObj) {
            const setObj = {};
            if (selectObj.socialCreditCode) {
                setObj.socialCreditCode = '';
            }
            if (selectObj.countryId) {
                setObj.area = [];
            }
            if (selectObj.address) {
                setObj.address = '';
            }
            if (selectObj.localeAddressEn) {
                setObj.localeAddressEn = '';
            }
            if (selectObj.masterDataName) {
                setObj.masterDataName = '';
            }
            if (selectObj.localeMasterNameEn) {
                setObj.localeMasterNameEn = '';
            }
            if (selectObj.extendData) {
                setObj.extendData = [];
            }
            this.props.form.setFieldsValue(setObj);
        }
    };

    blurName = e => {
        e.persist();
        if (e.target.value && e.target.value.trim()) {
            setTimeout(() => {
                this.props.form.setFieldsValue({
                    name: e.target.value.trim(),
                    localeNameEn: e.target.value.trim()
                });
            }, 100);
        }
    };

    selectExtendData = () => {
        // 选择完成后进行数据的空格去除，去除选项的前后空格，去除只有空格的选项
        // 编辑专业时，要先取到当前已经选择过的专业，然后判断新选择的选项在不在已选择专业内，如果名称重复，不可添加
        const currentExtendData = this.props.form.getFieldValue('extendData');
        const filterDeptNameArr = this.state.departmentList
            .filter(item => includes(currentExtendData, item.value))
            .map(item => item.name);
        setTimeout(() => {
            this.props.form.setFieldsValue({
                extendData: uniq(
                    this.props.form
                        .getFieldValue('extendData')
                        .filter(
                            item =>
                                item.trim() &&
                                !includes(filterDeptNameArr, item.trim())
                        )
                        .map(item => item.trim())
                )
            });
        }, 100);
    };

    chFormElement = {
        name: {
            key: 'name',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0689
            ),
            type: this.props.institutionInfo.id ? 'input' : 'single_dropdown',
            onSearch: this.searchCroList,
            filterOption: false,
            onChange: this.props.institutionInfo.id ? null : this.changeName,
            onSelect: this.setSelectInfo,
            onBlur: this.props.institutionInfo.id ? this.blurName : null,
            rules: [
                {
                    validator: (rule, value, callback) => {
                        if (value && !value.trim()) {
                            callback(
                                this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0326
                                    )
                                    .replace(
                                        'xxx',
                                        this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0691
                                        )
                                    )
                            );
                        }
                        callback();
                    }
                }
            ],
            require: true
        },
        socialCreditCode: {
            key: 'socialCreditCode',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0690
            ),
            type: 'input',
            // require: true,
            bottomText: (
                <div style={{ color: 'red', marginTop: 3 }}>
                    {this.props.intl
                        .formatMessage(i18nMessages.ECONFIG_FRONT_A0685)
                        .replace(
                            'xxx',
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0677
                            )
                        )}
                </div>
            )
        },
        masterDataName: {
            key: 'masterDataName',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0053
            ),
            type: 'input',
            disabled: true
        },
        area: {
            key: 'area',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0060
            ),
            type: 'areaselect',
            placeholder: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0051
            )
        },
        address: {
            key: 'address',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0061
            ),
            type: 'input'
        },
        extendData: {
            key: 'extendData',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0210
            ),
            type: 'multiple_input'
        }
    };

    enFormElement = {
        localeNameEn: {
            key: 'localeNameEn',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0686
            ),
            type: this.props.institutionInfo.id ? 'input' : 'single_dropdown',
            onSearch: this.searchCroList,
            onChange: this.props.institutionInfo.id ? null : this.changeName,
            onSelect: this.setSelectInfo,
            onBlur: this.props.institutionInfo.id ? this.blurName : null,
            rules: [
                {
                    validator: (rule, value, callback) => {
                        if (value && !value.trim()) {
                            callback(
                                this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0326
                                    )
                                    .replace(
                                        'xxx',
                                        this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0691
                                        )
                                    )
                            );
                        }
                        callback();
                    }
                }
            ],
            filterOption: false,
            require: true
        },
        socialCreditCode: {
            key: 'socialCreditCode',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0690
            ),
            type: 'input',
            // require: true,
            bottomText: (
                <div style={{ color: 'red', marginTop: 3 }}>
                    {this.props.intl
                        .formatMessage(i18nMessages.ECONFIG_FRONT_A0685)
                        .replace(
                            'xxx',
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0677
                            )
                        )}
                </div>
            )
        },
        localeMasterNameEn: {
            key: 'localeMasterNameEn',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0683
            ),
            type: 'input',
            disabled: true
        },
        area: {
            key: 'area',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0060
            ),
            type: 'areaselect',
            placeholder: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0051
            )
        },
        localeAddressEn: {
            key: 'localeAddressEn',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0684
            ),
            type: 'input'
        },
        extendData: {
            key: 'extendData',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0210
            ),
            type: 'multiple_input'
        }
    };

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (errors, values) => {
            if (errors) {
                return;
            }
            console.log(values);
            const { institutionInfo = {} } = this.props;
            const { departmentList, selectedInstitution } = this.state;
            const params = Object.assign(
                {},
                institutionInfo,
                {
                    ...values,
                    name: institutionInfo.id
                        ? values.name || institutionInfo.name
                        : selectedInstitution.name,
                    localeNameEn: institutionInfo.id
                        ? values.localeNameEn || institutionInfo.localeNameEn
                        : selectedInstitution.localeNameEn,
                    masterDataId: institutionInfo.masterDataId
                        ? institutionInfo.masterDataId
                        : selectedInstitution.masterDataId || ''
                },
                getDataFromArea(values.area),
                { countyId: getDataFromArea(values.area).county }
            );

            console.log(params);
            try {
                if (params.id) {
                    // 新增的专业类型
                    params.extendData =
                        values.extendData &&
                        values.extendData.map(item => {
                            const name = (
                                departmentList.find(i => i.value === item) || {}
                            ).name;
                            if (name) {
                                return {
                                    id: item,
                                    professionalName: name
                                };
                            }
                            return { professionalName: item };
                        });
                    await $http.put(urls.updateEnterprise, params);
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0331
                        )
                    );
                } else {
                    // 新增的专业类型
                    params.extendData =
                        values.extendData &&
                        values.extendData.map(professionalName => {
                            return {
                                professionalName
                            };
                        });
                    await $http.post(urls.updateEnterprise, {
                        ...params,
                        type: 'enterprise_institution'
                    });
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0262
                        )
                    );
                }
                this.props.onClose();
                this.props.getInstitutionList();
            } catch (e) {
                message.error(e.message);
            }
        });
    }, 500);

    // 获取与设置FORM
    getFormItem = datas => {
        const { getFieldDecorator } = this.props.form;
        const { institutionList, departmentList } = this.state;
        const { languagetType } = this.props;
        const FormElements =
            languagetType === 'ch'
                ? Object.keys(this.chFormElement)
                : Object.keys(this.enFormElement);
        this.chFormElement['name'].selectList = institutionList.map(item => ({
            value: item.id,
            name: item.name || item.localeNameEn
        }));
        this.enFormElement['localeNameEn'].selectList = institutionList.map(
            item => ({
                value: item.id,
                name: item.localeNameEn || item.name
            })
        );
        //如果有masterDataId 和主数据关联，那么社会信用代码不可更改，
        if (datas.masterDataId) {
            this.chFormElement['socialCreditCode'].disabled = true;
            this.enFormElement['socialCreditCode'].disabled = true;
        }
        // 处理区域信息赋值
        return FormElements.map(item => {
            if (item === 'extendData') {
                return (
                    <Col span={24} key={item}>
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0210
                            )}
                        >
                            {getFieldDecorator(item, {
                                rules: []
                            })(
                                <Select
                                    allowClear={true}
                                    mode="tags"
                                    onSelect={this.selectExtendData}
                                    tokenSeparators={[',']}
                                    placeholder={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                >
                                    {departmentList.map(item => (
                                        <Option key={item.value}>
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                );
            }
            return universalform({
                ...(languagetType === 'ch'
                    ? this.chFormElement[item]
                    : this.enFormElement[item]),
                getFieldDecorator,
                value:
                    datas[item] ||
                    (languagetType === 'ch'
                        ? this.chFormElement[item].value
                        : this.enFormElement[item].value) ||
                    '',
                span: 24
            });
        });
    };

    render() {
        const { buttonLoading } = this.state;
        const { institutionInfo = {} } = this.props;
        return (
            <Form layout="vertical">
                {this.getFormItem(institutionInfo)}
                <SaveDom
                    buttonLoading={buttonLoading}
                    onHandleClick={this.handleSubmit}
                    intl={this.props.intl}
                />
            </Form>
        );
    }
}

export default InstitutionInfo;
