import React from 'react';
import urls, { parseApiUrl } from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, isArray } from 'lodash';
import { Form, message, Spin } from 'antd';
import { i18nMessages } from 'src/i18n';
import { SaveDom } from 'component/drawer';
import { universalform } from 'src/component/universalForm';
import { getCurrentLanguage } from 'utils/utils';

@Form.create()
class EditCenter extends React.Component {
    state = {
        buttonLoading: false,
        craPersonList: [], // CRA
        piPersonList: [], // PI
        departmentList: [], // 科室列表
        centerInfo: {},
        spinning: true,
        originDepartmentList: []
    };

    componentWillMount() {
        const { centerInfo = {}, isEdit } = this.props;
        const language = getCurrentLanguage();
        if (isEdit) {
            // 去空
            const ids = [centerInfo.mainCraId, centerInfo.mainPiId].filter(
                item => !!item
            );
            this.onPersonSearch(ids, '', centerInfo);
        } else {
            this.onPersonSearch('', '', {
                ...centerInfo,
                siteName:
                    language === 'zh_CN'
                        ? centerInfo.name || centerInfo.localeNameEn || ''
                        : centerInfo.localeNameEn || centerInfo.name || '',
                aliasName:
                    language === 'zh_CN'
                        ? centerInfo.name || centerInfo.localeNameEn || ''
                        : centerInfo.localeNameEn || centerInfo.name || '',
                address: centerInfo.address || ''
            });
        }
        this.getProfession();
    }

    getProfession = async () => {
        try {
            const { centerInfo, isEdit } = this.props;

            const result =
                (await $http.get(urls.restEnterpriseSearch, {
                    type: 'enterprise_institution',
                    id: isEdit
                        ? centerInfo.cspHospitalId || centerInfo.hospitalId
                        : centerInfo.id
                })) || {};
            const departmentList = result?.data?.[0]?.extendData?.map(item => {
                return {
                    value: item.id,
                    name: item.professionalName
                };
            });
            this.setState({
                departmentList,
                originDepartmentList: departmentList
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    // 主要研究者查找
    onPersonSearch = debounce(async (value, type, centerInfo) => {
        try {
            // listCompanyAndRelationUserPage getListByQueryParam
            const result = await $http.post(
                urls.listCompanyAndRelationUserPage,
                Object.assign(
                    {},
                    {
                        pageIndex: 1,
                        pageSize: 10
                    },
                    isArray(value) ? { ids: value } : { keyword: value }
                )
            );
            const personList =
                (result &&
                    result.data &&
                    result.data.map(item => {
                        return {
                            value: item.userId,
                            // name: item.email ? `${item.userName}(${item.email})` : `${item.userName}`,
                            name:
                                item.email && item.userName
                                    ? `${item.userName}(${item.email})`
                                    : item.userName || item.email
                        };
                    })) ||
                [];
            if (type === 'cra') {
                this.setState({
                    craPersonList: personList
                });
            } else if (type === 'pi') {
                this.setState({
                    piPersonList: personList
                });
            } else {
                this.setState({
                    craPersonList: personList,
                    piPersonList: personList,
                    centerInfo: {
                        ...centerInfo,
                        professionId:
                            centerInfo.professionId && centerInfo.professionName
                                ? {
                                      key: centerInfo.professionId,
                                      label: centerInfo.professionName
                                  }
                                : '',
                        mainCraId:
                            personList.length > 0 ? centerInfo.mainCraId : '',
                        mainPiId:
                            personList.length > 0 ? centerInfo.mainPiId : ''
                    }
                });
            }
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({
                spinning: false
            });
        }
    }, 500);

    professionOnsearch = (name = '') => {
        if (name.trim()) {
            const { departmentList = [] } = this.state;
            const d = departmentList.filter(
                item =>
                    item.name?.toLowerCase().indexOf(name.toLowerCase()) >= 0
            );
            this.setState({
                departmentList: d.length > 0 ? d : [{ value: 'custom', name }]
            });
        }
    };

    professionOnchange = e => {
        const { originDepartmentList = [] } = this.state;
        if (!e) {
            this.setState({
                departmentList: originDepartmentList
            });
        }
    };

    FormElement = {
        siteName: {
            key: 'siteName',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0213
            ),
            type: 'input',
            span: 24,
            disabled: true,
            maxLength: 200
        },
        secondaryCode: {
            key: 'secondaryCode',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0218
            ),
            type: 'input',
            span: 24,
            maxLength: 200
        },
        professionId: {
            key: 'professionId',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0210
            ),
            type: 'single_dropdown',
            span: 24,
            labelInValue: true,
            disabled: this.props.isEdit,
            onSearch: name => this.professionOnsearch(name),
            onChange: this.professionOnchange,
            filterOption: false
        },
        aliasName: {
            key: 'aliasName',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0214
            ),
            type: 'input',
            span: 24,
            require: true
        },
        countryName: {
            key: 'countryName',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0154
            ),
            type: 'input',
            disabled: true,
            span: 24
        },
        address: {
            key: 'address',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0091
            ),
            type: 'input',
            span: 24
        },
        isTest: {
            key: 'isTest',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0215
            ),
            type: 'radio',
            span: 24,
            require: true,
            value: 0,
            selectList: [
                {
                    name: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0590
                    ),
                    value: 1
                },
                {
                    name: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0591
                    ),
                    value: 0
                }
            ]
        },
        mainCraId: {
            key: 'mainCraId',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0216
            ),
            type: 'single_dropdown',
            placeholder:
                this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0269
                ) +
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0216),
            onSearch: name => this.onPersonSearch(name, 'cra'),
            filterOption: false,
            span: 24
        },
        mainPiId: {
            key: 'mainPiId',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0217
            ),
            type: 'single_dropdown',
            placeholder:
                this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0269
                ) +
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0217),
            onSearch: name => this.onPersonSearch(name, 'pi'),
            filterOption: false,
            span: 24
        }
    };

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const { centerInfo = {} } = this.state;
                const {
                    match: {
                        params: { id, appId }
                    },
                    searchValue = '',
                    pageIndex = 1,
                    pageSize = 10
                } = this.props;
                // const { departmentName = '' } = this.state;
                this.setState({ buttonLoading: true });
                const {
                    onClose,
                    usedCenterEvent,
                    usedFetchData,
                    isEdit
                } = this.props;
                try {
                    const profession = {};
                    if (values.professionId) {
                        if (values.professionId.key === 'custom') {
                            profession.professionName =
                                values.professionId.label;
                        } else {
                            profession.professionId = values.professionId.key;
                            profession.professionName =
                                values.professionId.label;
                        }
                    }
                    if (isEdit) {
                        const params = {
                            ...values,
                            softId: appId,
                            mainCraId: values.mainCraId || '',
                            mainPiId: values.mainPiId || ''
                        };
                        delete params.professionId;
                        await $http.put(
                            parseApiUrl(urls.oldUpdateSite, {
                                projectSiteId: centerInfo.id
                            }),
                            {
                                ...params,
                                ...profession
                            }
                        );
                        message.success(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0219
                            )
                        );
                        onClose();
                        usedFetchData({ pageIndex, pageSize, searchValue });
                        // allUsedCenterEvent.fetchData();
                    } else {
                        const language = getCurrentLanguage();
                        const params = {
                            ...centerInfo,
                            ...values,
                            cspHospitalId: centerInfo.id,
                            hospitalId: centerInfo.masterDataId,
                            softId: appId,
                            projectId: id,
                            siteCode: centerInfo.code,
                            siteName:
                                language === 'zh_CN'
                                    ? centerInfo.name || centerInfo.localeNameEn
                                    : centerInfo.localeNameEn ||
                                      centerInfo.name,
                            siteNameUsed: centerInfo.oldName,
                            siteLevelId: centerInfo.levelCode,
                            siteLevelName: centerInfo.levelName,
                            memoTxt: centerInfo.remark,
                            hospitalStatus: centerInfo.status,
                            hospitalType: centerInfo.type,
                            bedsNumbers: centerInfo.bedNumber
                        };
                        if (!centerInfo.tenantId) {
                            params.hospitalId = centerInfo.id;
                            delete params.cspHospitalId;
                        }
                        delete params.id;
                        delete params.extendData;
                        delete params.professionId;
                        await $http.post(urls.addSite, {
                            ...params,
                            ...profession
                        });
                        message.success(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0219
                            )
                        );
                        onClose();
                        usedCenterEvent.fetchData({});
                        this.props.fetchData();
                    }
                } catch (e) {
                    message.error(e.message);
                } finally {
                    this.setState({ buttonLoading: false });
                }
            }
        });
    }, 500);

    // 获取与设置FORM
    getFormItem = datas => {
        const { getFieldDecorator } = this.props.form;
        const {
            craPersonList = [],
            piPersonList = [],
            departmentList = []
        } = this.state;
        const FormElements = Object.keys(this.FormElement);

        this.FormElement['mainPiId'].selectList = piPersonList;
        this.FormElement['mainCraId'].selectList = craPersonList;
        this.FormElement['professionId'].selectList = departmentList;

        return FormElements.map(item => {
            return universalform({
                ...this.FormElement[item],
                getFieldDecorator,
                value: datas[item] || this.FormElement[item].value
            });
        });
    };

    render() {
        const { buttonLoading, centerInfo = {}, spinning } = this.state;
        return (
            <Form layout="vertical">
                <Spin spinning={spinning}>{this.getFormItem(centerInfo)}</Spin>
                <SaveDom
                    intl={this.props.intl}
                    buttonLoading={buttonLoading}
                    onHandleClick={this.handleSubmit}
                />
            </Form>
        );
    }
}

export default EditCenter;
