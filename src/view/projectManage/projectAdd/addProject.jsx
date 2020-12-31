import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, cloneDeep, isEmpty, isArray } from 'lodash';
import {
    Form,
    message,
    Col,
    Input,
    Select,
    Spin,
    Popover,
    Icon,
    Button,
    Tooltip
} from 'antd';
import { i18nMessages } from 'src/i18n';
import { SaveDom } from 'component/drawer';
import { universalform, formItemLayout } from 'src/component/universalForm';
import QuotePrject, { projectTableColumns } from './quoteProject';
import { modalFun } from 'src/component/modal';
import CommonTable from 'tms-common-table1x';
import { getCurrentLanguage } from 'utils/utils';

// 这五个系统添加项目的时候，治疗领域自动设置为其他
const apps = ['site', '06', 'evigi', 'ejc', 'esae'];

@Form.create()
class AddProject extends React.Component {
    state = {
        buttonLoading: false,
        projectInfo: {},
        companyList: [], // 申办方list
        stagingList: [], // 项目分期
        testList: [], // 试验类型
        personList: [], // 主要研究者
        croList: [], // CRO
        treatmentList: [], // 治疗领域
        candidateList: [], // 选择的申办方LIST
        chooseCroList: {}, // 选择的croLIST
        candidateLoading: false, // 为了解决申办方多次点击，控制异步流程问题
        quoteVisible: false, // 引用项目弹层
        selectedRowKeys: [] // 选择引用项目
    };

    language = getCurrentLanguage(); // 当前语言

    chooseProjectList = []; // 添加当前的可选择项目列表

    currentIsDataCandidateInfo = {}; // 当前有数据的申办方信息

    componentWillMount() {
        this.onCompanySearch('');
        this.onCroSearch();
        this.onPersonSearch();
        this.onStaging();
    }

    // 主要研究者查找
    onPersonSearch = debounce(async value => {
        try {
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
                            name:
                                item.email && item.userName
                                    ? `${item.userName}(${item.email})`
                                    : item.userName || item.email
                        };
                    })) ||
                [];
            this.setState({
                personList
            });
        } catch (e) {
            message.error(e.message);
        }
    }, 500);

    // 申办方查找
    onCompanySearch = debounce(async (name, callback) => {
        try {
            const result =
                (await $http.post(
                    urls.searchCompany,
                    Object.assign(
                        {},
                        {
                            type: 'SPONSOR',
                            manualEntry: true
                        },
                        isArray(name)
                            ? { ids: name || [] }
                            : { name: name.trim() || '' }
                    )
                )) || [];
            const companyList = result.map(item => {
                return {
                    name:
                        this.language === 'en_US'
                            ? item.localeNameEn || item.name
                            : item.name || item.localeNameEn,
                    value: item.id,
                    sourceData: item
                };
            });
            this.setState({ companyList }, () => {
                if (callback) callback(companyList);
            });
        } catch (e) {
            message.error(e.message);
        }
    }, 500);

    // CRO查找
    onCroSearch = debounce(async (name = '', callback) => {
        try {
            const result =
                (await $http.post(
                    urls.searchCompany,
                    Object.assign(
                        {},
                        {
                            type: 'CRO',
                            manualEntry: true
                        },
                        isArray(name)
                            ? { ids: name || [] }
                            : { name: name.trim() || '' }
                    )
                )) || [];
            const croList = result.map(item => {
                return {
                    name:
                        this.language === 'en_US'
                            ? item.localeNameEn || item.name
                            : item.name || item.localeNameEn,
                    value: item.id,
                    sourceData: item
                };
            });
            this.setState({ croList }, () => {
                if (callback) callback(croList);
            });
        } catch (e) {
            message.error(e.message);
        }
    }, 500);

    // 获取数据字典的内容
    onStaging = async () => {
        try {
            const { appId } = this.props;
            const stagingOriginList = await $http.get(
                `${
                    urls.findEnumTemplate
                }?categoryCode=project&fieldName=${encodeURI('研究分期')}`,
                {},
                {
                    headers: {
                        'TM-Header-AppId': appId
                    }
                }
            );
            const stagingList = stagingOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            });
            const treatmentOriginList = await $http.get(
                `${
                    urls.findEnumTemplate
                }?categoryCode=project&fieldName=${encodeURI('治疗领域')}`
            );
            const treatmentList = treatmentOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            });
            const testOriginList = await $http.get(
                `${
                    urls.findEnumTemplate
                }?categoryCode=project&fieldName=${encodeURI('试验类型')}`
            );
            const testList = testOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            });

            // 这五个系统添加项目的时候，治疗领域自动设置为其他
            const treatmentQitaId =
                treatmentList.find(item => item.fieldCode === 'OTHER').value ||
                '';
            if (apps.indexOf(appId) >= 0)
                this.FormElement['therapyAreaId'].value = treatmentQitaId;

            this.setState({ stagingList, testList, treatmentList });
        } catch (e) {
            message.error(e.message);
        }
    };

    /**
     * 项目分期改变
     * 根据选择的分期判断试验类型是否有下拉菜单
     * BE，必填项，试验类型包括预试验、正式试验、餐前预试验、餐后预试验、餐前正式试验、餐后正式试验；支持多选
     * I期：预试验、正式试验
     */
    onExperimentTypeSelect = ({}, { props: { item } }) => {
        const { testList = [] } = this.state;
        const { resetFields } = this.props.form;
        if (item.fieldCode === 'RESEARCH_PERIOD_BE') {
            // BE期
            this.FormElement['experimentType'].display = true;
            resetFields(['experimentType']);
            this.FormElement['experimentType'].selectList = testList;
        } else if (item.fieldCode === 'NARESEARCH_PERIOD_FIRST') {
            // I期
            this.FormElement['experimentType'].display = true;
            resetFields(['experimentType']);
            this.FormElement['experimentType'].selectList = testList.filter(
                item => {
                    if (
                        item.fieldCode === 'TAKE_TEST' ||
                        item.fieldCode === 'PRO_TEST' ||
                        item.fieldCode === 'NA'
                    ) {
                        return item;
                    }
                }
            );
        } else {
            this.FormElement['experimentType'].display = false;
        }
        this.forceUpdate();
    };

    // 申办方change，保存所有申办方信息
    onCandidateChange = (item, candidateList) => {
        this.setState({
            candidateList
        });
    };

    onCandidateSelect = (value, item) => {
        this.setState({ candidateLoading: true }, () => {
            this.validatorProjectIsPresence(item.props);
        });
    };

    // 选择CRO
    onCroSelect = (item, chooseCroList) => {
        this.setState({
            chooseCroList
        });
    };

    onCandidateDeselect = value => {
        const { setFieldsValue } = this.props.form;
        const { candidateList = [] } = this.state;
        try {
            // 如果删除当前带出的申办方列表中的一个，则删除所有带出的申办方
            if (
                !isEmpty(this.chooseProjectList) &&
                this.chooseProjectList.length === 1
            ) {
                // 当前带出的申办方list
                const current = this.chooseProjectList[0].candidateId.split(
                    ','
                );
                if (current.indexOf(value) >= 0) {
                    // 找出当前选择的申办方和带出申办方的合集
                    const h = candidateList.map(item => item.props.value);
                    const b = h && h.filter(item => current.indexOf(item) < 0);
                    this.formAssignment({});
                    setFieldsValue({
                        candidateId: b
                    });
                    this.setState({
                        candidateList: candidateList.filter(
                            item => b.indexOf(item.props.value) >= 0
                        )
                    });
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    FormElement = {
        programCode: {
            key: 'programCode',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0264
            ),
            type: 'input',
            require: true,
            span: 24,
            maxLength: 200
        },
        candidateId: {
            key: 'candidateId',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0022
            ),
            type: 'single_dropdown',
            onSearch: value => this.onCompanySearch(value),
            value: '',
            span: 24,
            require: true
        },
        croId: {
            key: 'croId',
            label: 'CRO',
            type: 'single_dropdown',
            onSearch: this.onCroSearch,
            onSelect: this.onCroSelect,
            value: '',
            span: 24
        },
        projectName: {
            key: 'projectName',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0019
            ),
            type: 'input',
            require: true,
            span: 24,
            maxLength: 500
        },
        studyStageId: {
            key: 'studyStageId',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0025
            ),
            type: 'single_dropdown',
            span: 24,
            require: true,
            filterOption: true,
            onSelect: this.onExperimentTypeSelect,
            onSearch: () => {}
        },
        experimentType: {
            key: 'experimentType',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0026
            ),
            type: 'multiple_input',
            filterOption: true,
            span: 24,
            mode: 'multiple',
            display: false,
            require: true
        },
        projectManagerId: {
            key: 'projectManagerId',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0157
            ),
            type: 'multiple_input',
            onSearch: this.onPersonSearch,
            filterOption: false,
            span: 24
        },
        therapyAreaId: {
            key: 'therapyAreaId',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0310
            ),
            require: true,
            type: 'single_dropdown',
            filterOption: true,
            span: 24,
            onSearch: () => {}
        },
        abbreviatedName: {
            key: 'abbreviatedName',
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0651
            ),
            type: 'input',
            span: 24,
            maxLength: 200
        },
        projectDesc: {
            key: 'projectDesc',
            span: 24,
            label: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0158
            ),
            type: 'textarea',
            maxLength: 1000,
            customFormItemLayout: formItemLayout
        }
    };

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const { candidateList = [], chooseCroList = {} } = this.state;
                const { appId, getProjectList, onClose } = this.props;
                const cloneValues = cloneDeep(values);
                delete cloneValues.experimentType;
                let formValue = {};
                const candidateNameList = candidateList.map(
                    item => item.props.children
                );

                /**
                 * 传入的数据是根据选择的分期来判断,分期不同,传入的字段不同
                 * 项目的新增和编辑传入和传出的数组都转为字符串
                 */
                if (
                    values.experimentType &&
                    this.FormElement['experimentType'].mode === 'multiple'
                ) {
                    formValue = {
                        ...cloneValues,
                        experimentTypeId: values.experimentType.join(',')
                    };
                } else {
                    formValue = {
                        ...cloneValues
                    };
                }

                try {
                    this.setState({ buttonLoading: true });
                    console.log(candidateList);
                    const params = {
                        appId,
                        ...formValue,
                        candidateId: values.candidateId.join(','),
                        candidate: candidateNameList.join(';'),
                        id:
                            this.isCopyProjectId !== ''
                                ? this.isCopyProjectId
                                : '',
                        syncSponsorEnterpriseDtos: candidateList
                            .map(item => item.props.sourceData)
                            .filter(item => !!item),
                        relateProjectOrigin:
                            (this.chooseProjectList &&
                                this.chooseProjectList[0] &&
                                this.chooseProjectList[0]
                                    .relateProjectOrigin) ||
                            '0'
                    };
                    if (values.projectManagerId) {
                        params.projectManagerId = values.projectManagerId.join(
                            ','
                        );
                    }
                    console.log(params);
                    if (values.croId) {
                        params.syncCroEnterpriseDtos = (
                            [chooseCroList.props.item.sourceData] || []
                        ).filter(item => !!item);
                        params.cro =
                            (chooseCroList.props &&
                                chooseCroList.props.children) ||
                            '';
                    }
                    await $http.post(urls.addProject, params);
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0262
                        )
                    );
                    onClose();
                    getProjectList({});
                } catch (e) {
                    message.error(e.message);
                } finally {
                    this.setState({ buttonLoading: false });
                }
            }
        });
    }, 500);

    // 验证当前项目是否存在
    validatorProjectIsPresence = debounce(async (candidate = {}) => {
        const { getFieldValue, setFields, resetFields } = this.props.form;
        const { appId } = this.props;
        const { candidateList = [] } = this.state;
        const programCode = getFieldValue('programCode');
        // const formCandidateId = getFieldValue('candidateId');
        const _candidateId = candidate.value;
        // const _candidateId = candidate.value || (formCandidateId && formCandidateId[formCandidateId.length - 1]) || '';

        // ctms,edc3,iwrs,etmf 这4个系统不需要验证
        // if(apps.indexOf(appId) >= 0) return;

        if (!!programCode && !!_candidateId) {
            try {
                const result = await $http.post(urls.checkProjectData, {
                    appId,
                    id: this.isCopyProjectId || '',
                    candidateId: _candidateId,
                    candidate: candidate.name,
                    programCode
                });
                /**
                 * 如果项目不存在，不做操作或者重置字段
                 * 如果项目存在，判断存在项目个数
                 * (length === 1) 不显示选择项目，直接补全后面的字段值
                 * (length > 1) 显示选择项目，等用户选择再补全字段值
                 */

                // 方便下次找到能带数据的申办方信息
                this.currentIsDataCandidateInfo = candidate;

                if (!isEmpty(result)) {
                    // 判断两次的实验方案编号不一样
                    this.programCode = programCode;
                    // 当前带出的数据
                    this.chooseProjectList = result || [];

                    const rowSelection = {
                        type: 'radio',
                        onChange: (s1, s2) => {
                            this.setState({ selectedRowKeys: s2 });
                        }
                    };
                    const columns = projectTableColumns(this.props.intl);
                    modalFun({
                        title: (
                            <div style={{ display: 'flex' }}>
                                <div>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0568
                                    )}
                                    :
                                </div>
                                <div style={{ fontSize: 14, color: '#999' }}>
                                    （
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0569
                                    )}
                                    ）
                                </div>
                            </div>
                        ),
                        width: 1000,
                        compontent: tProps => (
                            <div>
                                <CommonTable
                                    rowSelection={rowSelection}
                                    columns={columns}
                                    dataSource={result || []}
                                    pagination={false}
                                    outerFilter={false}
                                    scroll={{ x: 2500 }}
                                />
                                <div
                                    style={{
                                        textAlign: 'right',
                                        marginTop: 20
                                    }}
                                >
                                    <Button
                                        style={{ marginRight: 15 }}
                                        onClick={() => {
                                            tProps.onClose();
                                        }}
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0281
                                        )}
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            if (
                                                this.state.selectedRowKeys
                                                    .length > 0
                                            ) {
                                                tProps.onClose();
                                                this.formAssignment({
                                                    projectInfo: this.state
                                                        .selectedRowKeys[0],
                                                    unReset: true,
                                                    quote: true
                                                });
                                            } else {
                                                message.info(
                                                    this.props.intl.formatMessage(
                                                        i18nMessages.ECONFIG_FRONT_A0341
                                                    )
                                                );
                                            }
                                        }}
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0279
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )
                    });
                    this.setState({
                        candidateLoading: false
                    });
                    this.currentIsDataCandidateInfo = {};
                    resetFields();
                } else {
                    // 没带出来数据，判断实验方案编号是否有修改，如果有，清空除方案编号之外所有数据
                    if (this.programCode && this.programCode !== programCode) {
                        this.programCode = programCode;
                        this.formAssignment({});
                        setFields({
                            candidateId: {
                                value: []
                            }
                        });
                    }
                    this.setState({ candidateLoading: false });
                }
            } catch (e) {
                message.error(e.message);
                if (candidateList.length > 0 && candidate.value) {
                    setFields({
                        candidateId: {
                            value: candidateList
                                .filter(
                                    item => item.props.value !== candidate.value
                                )
                                .map(item => item.props.value)
                            // errors: [new Error(e.message)],
                        }
                    });
                    this.setState({
                        candidateList: candidateList.filter(
                            item => item.props.value !== candidate.value
                        )
                    });
                } else {
                    this.formAssignment({});
                }
                this.setState({ candidateLoading: false });
            }
        } else if (!!!programCode && !!_candidateId) {
            this.currentIsDataCandidateInfo = candidate;
            this.setState({ candidateLoading: false });
        }
    }, 300);

    /**
     * 给创建项目的表单进行赋值或者重置
     * (添加父项目，实验类型可以选择多个，子项目是从父项目中选择一个)
     * (在老数据中，如果不存在实验类型，并且分期为be而且实验类型为必填，若无实验类型，则选择NA)
     */
    formAssignment = ({ unReset = false, projectInfo = {}, quote = false }) => {
        const { setFieldsValue, resetFields } = this.props.form;

        if (unReset) {
            const { testList = [] } = this.state;
            this.onPersonSearch(
                projectInfo.projectManagerId &&
                    projectInfo.projectManagerId.split(',')
            );
            this.onExperimentTypeSelect(
                {},
                {
                    props: {
                        item: { fieldCode: projectInfo.researchstageFieldCode }
                    }
                }
            );
            // 如果带过来的信息没有治疗领域，治疗领域不禁用
            this.FormElement[
                'therapyAreaId'
            ].disabled = !!projectInfo.therapyAreaId;
            this.FormElement['studyStageId'].disabled = true;
            this.FormElement['experimentType'].disabled = true;
            this.FormElement['croId'].disabled = true;

            this.FormElement['studyStageId'].require = false;
            this.FormElement['experimentType'].require = false;

            // 获取实验类型中的NA
            const na =
                (testList.find(item => item.fieldCode === 'NA') || {}).value ||
                '';
            // 如果项目存在，需要传projectId
            this.isCopyProjectId = projectInfo.id;
            // 需要在forceUpdate中进行回调，否则当元素没有被render的时候，setFieldsValue是不起作用的，适用于显示/隐藏表单字段
            this.forceUpdate(() => {
                setFieldsValue({
                    projectName: projectInfo.projectName || '',
                    studyStageId: projectInfo.studyStageId || '',
                    projectDesc: projectInfo.projectDesc || '',
                    abbreviatedName: projectInfo.abbreviatedName || '',
                    therapyAreaId: projectInfo.therapyAreaId || '',
                    projectManagerId:
                        projectInfo.projectManagerId &&
                        projectInfo.projectManagerId.split(','),
                    experimentType: (projectInfo.experimentTypeId &&
                        projectInfo.experimentTypeId.split(',')) || [na]
                });
                this.FormElement['projectName'].title =
                    projectInfo.projectName || '';
            });
            if (quote) {
                this.setState({ candidateLoading: true });
                // 显示带出项目中的申办方
                this.onCompanySearch(
                    projectInfo.candidateId.split(','),
                    companyList => {
                        // 显示带出项目中的cro
                        this.onCroSearch(
                            projectInfo.croId ? [projectInfo.croId] : '',
                            croList => {
                                const ids = projectInfo.candidateId.split(',');
                                const names = projectInfo.candidate.split(';');
                                const company = companyList
                                    .filter(
                                        item => ids.indexOf(item.value) > -1
                                    )
                                    .map(item => item.sourceData);
                                const cro =
                                    croList.find(
                                        item => item.value === projectInfo.croId
                                    ) || {};
                                this.setState({
                                    candidateList:
                                        ids.map((item, i) => {
                                            return {
                                                props: {
                                                    children: names[i],
                                                    value: item,
                                                    sourceData: company[i]
                                                }
                                            };
                                        }) || [],
                                    chooseCroList: {
                                        props: {
                                            children: projectInfo.cro,
                                            item: {
                                                sourceData: cro.sourceData
                                            }
                                        }
                                    },
                                    candidateLoading: false
                                });
                                this.chooseProjectList = [projectInfo] || [];
                                setFieldsValue({
                                    programCode: projectInfo.programCode,
                                    candidateId: projectInfo.candidateId.split(
                                        ','
                                    ),
                                    croId: projectInfo.croId || ''
                                });
                            }
                        );
                    }
                );
            }
        } else {
            this.FormElement['studyStageId'].require = true;
            this.FormElement['experimentType'].require = true;

            this.FormElement['therapyAreaId'].disabled = false;
            this.FormElement['studyStageId'].disabled = false;
            this.FormElement['experimentType'].disabled = false;
            this.FormElement['projectManagerId'].disabled = false;
            this.FormElement['croId'].disabled = false;

            this.chooseProjectList = [];
            this.currentIsDataCandidateInfo = {};
            // 如果项目存在，需要传projectId
            this.isCopyProjectId = '';
            this.forceUpdate(() => {
                resetFields([
                    'projectName',
                    'studyStageId',
                    'projectDesc',
                    'projectManagerId',
                    'experimentType',
                    'croId',
                    'therapyAreaId'
                ]);
            });
        }
    };

    // 获取与设置FORM
    getFormItem = datas => {
        const {
            companyList = [],
            stagingList = [],
            personList = [],
            croList = [],
            treatmentList = [],
            candidateLoading
        } = this.state;
        const { getFieldDecorator } = this.props.form;
        const econfigLanguage =
            localStorage.getItem('econfigLanguage') ||
            (
                JSON.parse(localStorage.getItem('sso_loginAccountInfo') || '{}')
                    .selectLanguage || {}
            ).key;
        const FormElements = Object.keys(this.FormElement);

        this.FormElement['candidateId'].selectList = companyList;
        this.FormElement['studyStageId'].selectList = stagingList;
        this.FormElement['projectManagerId'].selectList = personList;
        this.FormElement['croId'].selectList = croList;
        this.FormElement['therapyAreaId'].selectList = treatmentList;

        return FormElements.map(item => {
            if (item === 'experimentType') {
                if (this.FormElement[item].display === false) {
                    return;
                }
            }
            if (item === 'programCode') {
                return (
                    <Col
                        span={this.FormElement[item].span}
                        key={this.FormElement[item].key}
                    >
                        <Form.Item
                            label={
                                <React.Fragment>
                                    {this.FormElement[item].label}
                                    <span className="title-tip">
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0376
                                        )}
                                    </span>
                                </React.Fragment>
                            }
                        >
                            {getFieldDecorator(this.FormElement[item].key, {
                                rules: [
                                    {
                                        required: this.FormElement[item]
                                            .require,
                                        message: `${
                                            this.FormElement[item].label
                                        }${
                                            econfigLanguage === 'zh_CN'
                                                ? '是必填项'
                                                : ' is required'
                                        }!`
                                    },
                                    {
                                        max: this.FormElement[item].maxLength,
                                        message:
                                            econfigLanguage === 'zh_CN'
                                                ? `不允许超过${this.FormElement[item].maxLength}个字符!`
                                                : `programCode cannot be longer than ${this.FormElement[item].maxLength} characters`
                                    }
                                ]
                            })(
                                <Input
                                    onBlur={() =>
                                        this.validatorProjectIsPresence(
                                            this.currentIsDataCandidateInfo ||
                                                {}
                                        )
                                    }
                                    placeholder={`${
                                        econfigLanguage === 'zh_CN'
                                            ? '请输入'
                                            : 'Please enter '
                                    }${this.FormElement[item].label}`}
                                    disabled={this.FormElement[item].disabled}
                                    rows={4}
                                />
                            )}
                        </Form.Item>
                    </Col>
                );
            } else if (item === 'candidateId') {
                return (
                    <Col
                        span={this.FormElement[item].span}
                        key={this.FormElement[item].key}
                    >
                        <Form.Item
                            label={
                                <React.Fragment>
                                    {this.FormElement[item].label}
                                    <span className="title-tip">
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0377
                                        )}
                                    </span>
                                </React.Fragment>
                            }
                        >
                            {getFieldDecorator(this.FormElement[item].key, {
                                rules: [
                                    {
                                        required: this.FormElement[item]
                                            .require,
                                        message: `${
                                            this.FormElement[item].label
                                        }${
                                            econfigLanguage === 'zh_CN'
                                                ? '是必填项'
                                                : ' is required'
                                        }!`
                                    }
                                ]
                            })(
                                <Select
                                    mode="multiple"
                                    value={[]}
                                    disabled={this.FormElement[item].disabled}
                                    placeholder={`${
                                        econfigLanguage === 'zh_CN'
                                            ? '请选择'
                                            : 'Please choose '
                                    }${this.FormElement[item].label}`}
                                    showSearch={true}
                                    filterOption={false}
                                    loading={candidateLoading}
                                    onSearch={this.FormElement[item].onSearch}
                                    onChange={this.onCandidateChange}
                                    onSelect={this.onCandidateSelect}
                                    onDeselect={this.onCandidateDeselect}
                                >
                                    {this.FormElement[item].selectList.map(
                                        item => (
                                            <Select.Option
                                                disabled={candidateLoading}
                                                {...item}
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.name}
                                            </Select.Option>
                                        )
                                    )}
                                </Select>
                            )}
                            <div
                                style={{
                                    fontSize: '14px',
                                    marginTop: '5px',
                                    color: '#ccc',
                                    marginBottom: '-5px',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0507
                                )}
                            </div>
                        </Form.Item>
                    </Col>
                );
            } else {
                return universalform({
                    ...this.FormElement[item],
                    getFieldDecorator,
                    value: datas[item] || this.FormElement[item].value
                });
            }
        });
    };

    render() {
        const {
            buttonLoading,
            projectInfo = {},
            candidateLoading
        } = this.state;
        return (
            <div>
                <div className="custom-drawer-header">
                    <div>
                        <div className="title">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0159
                            )}
                        </div>
                        <Popover
                            content={
                                <QuotePrject
                                    formAssignment={this.formAssignment}
                                    setQuote={quoteVisible =>
                                        this.setState({ quoteVisible })
                                    }
                                    intl={this.props.intl}
                                />
                            }
                            trigger="click"
                            placement="bottomRight"
                            visible={this.state.quoteVisible}
                            onVisibleChange={quoteVisible =>
                                this.setState({ quoteVisible })
                            }
                        >
                            <Tooltip
                                placement="left"
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0585
                                )}
                            >
                                <a
                                    style={{
                                        textDecoration: 'none',
                                        paddingRight: 10
                                    }}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0563
                                    )}
                                </a>
                            </Tooltip>
                        </Popover>
                    </div>
                    <Icon
                        className="custom-drawer-close"
                        type="close"
                        onClick={() => this.props.onClose()}
                    />
                </div>
                <Form layout="vertical">
                    <Spin spinning={candidateLoading}>
                        {this.getFormItem(projectInfo)}
                    </Spin>
                    <SaveDom
                        buttonLoading={buttonLoading}
                        onHandleClick={this.handleSubmit}
                        intl={this.props.intl}
                    />
                </Form>
            </div>
        );
    }
}

export default AddProject;
