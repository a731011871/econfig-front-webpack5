import React from 'react';
import PropTypes from 'prop-types';
import { debounce, find } from 'lodash';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { i18nMessages } from 'src/i18n';
import { Form, message } from 'antd';
import { getBasicInfoAreaValues, getDataFromArea } from 'utils/functions';
import { SaveDom } from 'component/drawer';
import { universalform } from 'src/component/universalForm';

@Form.create()
class SponsorInfo extends React.Component {
    static propTypes = {
        intl: PropTypes.object.isRequired,
        languagetType: PropTypes.string //中英文  ch中文  en英文
    };

    constructor(props) {
        super(props);
        this.state = {
            buttonLoading: false,
            sponsorList: [],
            selectedSponsor: {}
        };
    }

    componentDidMount() {
        if (this.props.sponsorInfo.id) {
            this.props.form.setFieldsValue({
                area: getBasicInfoAreaValues({
                    ...this.props.sponsorInfo,
                    county: this.props.sponsorInfo.countyId
                })
            });
        }
    }

    // 主要研究者查找
    searchSponsorList = debounce(async name => {
        if (name.trim()) {
            try {
                const result = await $http.get(urls.getAllEnterpriseList, {
                    type: 'enterprise_sponsor',
                    name,
                    pageIndex: 1,
                    pageSize: 10
                });
                this.setState({
                    sponsorList:
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
        const selectObj = find(this.state.sponsorList, item => item.id === id);
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
        this.setState({ selectedSponsor: selectObj });
        this.props.form.setFieldsValue(setValueObj);
    };

    changeName = value => {
        // 新增时，清空名称，需要吧之前带出来的信息也清空掉(只清空带出来的信息，别的手填的不清空)
        const selectObj = find(
            this.state.sponsorList,
            item => item.id === this.props.form.getFieldValue('name')
        );
        if (!this.props.sponsorInfo.id && !value && selectObj) {
            const setObj = {};
            if (selectObj.socialCreditCode) {
                setObj.socialCreditCode = '';
            }
            if (selectObj.contryId) {
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

    chFormElement = {
        name: {
            key: 'name',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0702
            ),
            type: this.props.sponsorInfo.id ? 'input' : 'single_dropdown',
            onSearch: this.searchSponsorList,
            filterOption: false,
            onChange: this.props.sponsorInfo.id ? null : this.changeName,
            onSelect: this.setSelectInfo,
            onBlur: this.props.sponsorInfo.id ? this.blurName : null,
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
                i18nMessages.ECONFIG_FRONT_A0688
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
                                i18nMessages.ECONFIG_FRONT_A0022
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
        }
    };

    enFormElement = {
        localeNameEn: {
            key: 'localeNameEn',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0687
            ),
            type: this.props.sponsorInfo.id ? 'input' : 'single_dropdown',
            onSearch: this.searchSponsorList,
            onChange: this.props.sponsorInfo.id ? () => {} : this.changeName,
            onSelect: this.setSelectInfo,
            onBlur: this.props.sponsorInfo.id ? this.blurName : null,
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
                i18nMessages.ECONFIG_FRONT_A0688
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
                                i18nMessages.ECONFIG_FRONT_A0022
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
        }
    };

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (errors, values) => {
            if (errors) {
                return;
            }
            console.log(values);
            const { sponsorInfo = {} } = this.props;
            const { selectedSponsor } = this.state;
            const params = Object.assign(
                {},
                sponsorInfo,
                {
                    ...values,
                    name: sponsorInfo.id
                        ? values.name || sponsorInfo.name
                        : selectedSponsor.name,
                    localeNameEn: sponsorInfo.id
                        ? values.localeNameEn || sponsorInfo.localeNameEn
                        : selectedSponsor.localeNameEn,
                    masterDataId: sponsorInfo.masterDataId
                        ? sponsorInfo.masterDataId
                        : selectedSponsor.masterDataId || ''
                },
                getDataFromArea(values.area),
                { countyId: getDataFromArea(values.area).county }
            );
            console.log(params);
            try {
                if (params.id) {
                    await $http.put(urls.updateEnterprise, params);
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0331
                        )
                    );
                } else {
                    await $http.post(urls.updateEnterprise, {
                        ...params,
                        type: 'enterprise_sponsor'
                    });
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0262
                        )
                    );
                }
                this.props.onClose();
                this.props.getSponsorList();
            } catch (e) {
                message.error(e.message);
            }
        });
    }, 500);

    // 获取与设置FORM
    getFormItem = datas => {
        const { getFieldDecorator } = this.props.form;
        const { sponsorList } = this.state;
        const { languagetType } = this.props;
        const FormElements =
            languagetType === 'ch'
                ? Object.keys(this.chFormElement)
                : Object.keys(this.enFormElement);
        this.chFormElement['name'].selectList = sponsorList.map(item => ({
            value: item.id,
            name: item.name || item.localeNameEn
        }));
        this.enFormElement['localeNameEn'].selectList = sponsorList.map(
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
        const { sponsorInfo = {} } = this.props;
        return (
            <Form layout="vertical">
                {this.getFormItem(sponsorInfo)}
                <SaveDom
                    buttonLoading={buttonLoading}
                    onHandleClick={this.handleSubmit}
                    intl={this.props.intl}
                />
            </Form>
        );
    }
}

export default SponsorInfo;
