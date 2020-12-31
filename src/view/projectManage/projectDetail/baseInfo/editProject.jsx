import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, isArray } from 'lodash';
import { Form, message, Spin } from 'antd';
import { i18nMessages } from 'src/i18n';
import { SaveDom } from 'component/drawer';
import { universalform, formItemLayout } from 'src/component/universalForm';

@Form.create()
class EditProject extends React.Component {

    constructor(props) {
        super(props);
        const { projectInfo: { cro = '' } } = this.props;
        this.state = {
            buttonLoading: false,
            spinning: true,
            croList: [], // CRO
            projectInfo: {},
            treatmentList: [], // 治疗领域
            personList: [], 
            testList: [],
            cro: {
                name: cro
            }
        };
    }

    componentWillMount() { 
        const { projectInfo: { cro = '', croId = '', projectManagerId = '', researchstageFieldCode, isEditProject } } = this.props;
        if(researchstageFieldCode === 'RESEARCH_PERIOD_BE' || researchstageFieldCode === 'NARESEARCH_PERIOD_FIRST') {
            this.FormElement['studyStageId'].disabled = true;
            this.FormElement['experimentType'].disabled = true;
        }
        // 引用项目可编辑4项
        if(isEditProject !== '1') {
            // 可编辑的4个字段
            this.FormElement['projectName'].disabled = false;
            this.FormElement['projectManagerId'].disabled = false;
            this.FormElement['abbreviatedName'].disabled = false;
            this.FormElement['projectDesc'].disabled = false;
            // 其他的都不可编辑
            this.FormElement['croId'].disabled = true;
            this.FormElement['programCode'].disabled = true;
            this.FormElement['studyStageId'].disabled = true;
            this.FormElement['experimentType'].disabled = true;
            this.FormElement['therapyAreaId'].disabled = true;
        }
        this.onCroSearch(croId ? [croId]: '', (croList) => {
            this.onStaging(() => {
                this.onExperimentTypeSelect({}, { props: { item: { fieldCode: researchstageFieldCode } } });
                this.onPersonSearch(projectManagerId ? projectManagerId.split(',') : '', () => {
                    this.setState({
                        projectInfo: {
                            ...this.props.projectInfo, 
                            experimentType: (this.props.projectInfo.experimentTypeId && this.props.projectInfo.experimentTypeId.split(',')),
                            projectManagerId: this.state.personList.length !== 0 ? (projectManagerId ? projectManagerId.split(',') : []) : ''
                        } || {},
                        cro: {
                            props: {
                                name: cro,
                                children: cro,
                                item: {
                                    sourceData: (croList.find(item => item.value === this.props.projectInfo.croId) || {}).sourceData
                                }
                            }
                        },
                        spinning: false
                    });
                });
            });
        });
    }

    // CRO查找
    onCroSearch = debounce(async (name, callback) => {
        try{
            const result = await $http.post(urls.searchCompany, Object.assign({}, {
                type: 'CRO',
                manualEntry: true,
            }, isArray(name) ? { ids: name || [] } : { name: name || '' })) || [];
            const croList = result.map(item => {
                return {
                    name: this.language === 'en_US' ? (item.localeNameEn || item.name) : item.name,
                    value: item.id,
                    sourceData: item
                };
            });
            this.setState({ croList }, () => {
                if(callback) callback(croList);
            });
        }catch(e) {
            message.error(e.message);
        }
    }, 500)

    /**
     * 项目分期改变
     * 根据选择的分期判断试验类型是否有下拉菜单
     * BE，必填项，试验类型包括预试验、正式试验、餐前预试验、餐后预试验、餐前正式试验、餐后正式试验；支持多选
     * I期：预试验、正式试验
     */
    onExperimentTypeSelect = ({}, { props: { item } }) => {
        const { testList = [] } = this.state;
        const { setFieldsValue } = this.props.form;
        if(item.fieldCode === 'RESEARCH_PERIOD_BE') { // BE期
            this.FormElement['experimentType'].display = true;
            setFieldsValue({experimentType: []});
            this.setState({
                projectInfo: {
                    ...this.state.projectInfo,
                    experimentTypeId: ''
                }
            });
            this.FormElement['experimentType'].selectList = testList;
        }else if(item.fieldCode === 'NARESEARCH_PERIOD_FIRST'){ // I期
            this.FormElement['experimentType'].display = true;
            setFieldsValue({experimentType: []});
            this.setState({
                projectInfo: {
                    ...this.state.projectInfo,
                    experimentTypeId: ''
                }
            });
            this.FormElement['experimentType'].selectList = testList.filter(item => {
                if(item.fieldCode === 'TAKE_TEST' || item.fieldCode === 'PRO_TEST' || item.fieldCode === 'NA') {
                    return item;
                }
            });
        }else {
            this.FormElement['experimentType'].display = false;
        }
        
        this.forceUpdate(); 
    }

    // 获取数据字典的内容
    onStaging = async (callback) => {
        try{
            const { appId } = this.props;
            const stagingOriginList = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('研究分期')}`, {}, {
                headers: {
                    'TM-Header-AppId': appId
                }
            });
            const stagingList = stagingOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            });
            const treatmentOriginList = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('治疗领域')}`);
            const treatmentList = treatmentOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            });
            const testOriginList = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('试验类型')}`);
            const testList = testOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            });
            this.setState({ treatmentList, stagingList, testList }, () => {
                if(callback) callback();
            });
        }catch(e) {
            message.error(e.message);
        }
    }

    // 主要研究者查找
    onPersonSearch = debounce(async (value, callback) => {
        try{
            const result = await $http.post(urls.listCompanyAndRelationUserPage, Object.assign({}, {
                pageIndex: 1,
                pageSize: 10,
            }, isArray(value) ? {ids: value} : {keyword: value}));
            const personList = result && result.data && result.data.map(item => {
                return {
                    value: item.userId,
                    // name: item.email ? `${item.userName}(${item.email})` : `${item.userName}`,
                    name: (item.email && item.userName) ? `${item.userName}(${item.email})` : (item.userName || item.email)
                };
            }) || [];
            this.setState({
                personList
            }, () => {
                if(callback) callback();
            });
        }catch(e){
            message.error(e.message);
        }
    }, 500)

    // 选择CRO
    onCroSelect = (item, cro) => {
        this.setState({
            cro
        });
    }

    FormElement = {
        projectSerialNo: {
            key: 'projectSerialNo',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0505),
            type: 'input',
            disabled: true,
            value: '',
            span: 24,
        },
        croId: {
            key: 'croId',
            label: 'CRO',
            type: 'single_dropdown',
            onSearch: this.onCroSearch,
            onSelect: this.onCroSelect,
            span: 24,
        },
        projectName: {
            key: 'projectName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0019),
            type: 'input',
            require: true,
            span: 24,
            maxLength: 500
        },
        programCode: {
            key: 'programCode',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0264),
            type: 'input',
            disabled: this.props.projectInfo.isEdc && this.props.projectInfo.isEdc === '1',
            require: true,
            span: 24,
            maxLength: 200
        },
        studyStageId: {
            key: 'studyStageId',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0025),
            type: 'single_dropdown',
            span: 24,
            require: true,
            filterOption: true,
            onSelect: this.onExperimentTypeSelect,
            onSearch: () => {}
        },
        experimentType: {
            key: 'experimentType',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0026),
            type: 'multiple_input',
            filterOption: true,
            span: 24,
            mode: 'multiple',
            display: false,
            require: true
        },
        therapyAreaId: {
            key: 'therapyAreaId',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0310),
            require: true,
            type: 'single_dropdown',
            filterOption: true,
            span: 24,
            onSearch: () => {}
        },
        projectManagerId: {
            key: 'projectManagerId',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0157),
            type: 'multiple_input',
            onSearch: (value) => this.onPersonSearch(value),
            filterOption: false,
            span: 24,
        },
        abbreviatedName: {
            key: 'abbreviatedName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0651),
            type: 'input',
            span: 24,
            maxLength: 200
        },
        projectDesc: {
            key: 'projectDesc',
            span: 24,
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0158),
            type: 'textarea',
            maxLength: 1000,
            customFormItemLayout: formItemLayout
        },
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({buttonLoading: true});
                const { cro = [] } = this.state;
                const { appId, getProjectDetailInfo, onClose,id, setTitleName } = this.props;
                try{
                    const params = {
                        id,
                        appId,
                        ...values,
                        cro: '',
                        croId: '',
                        projectManagerId: isArray(values.projectManagerId) ? values.projectManagerId.join(',') : values.projectManagerId
                    };
                    
                    if(params.experimentType) {
                        params.experimentTypeId = params.experimentType.join(',');
                    }
                    if(values.croId) {
                        params.syncCroEnterpriseDtos = [cro.props.item.sourceData] || [];
                        params.croId = values.croId ? values.croId : '';
                        params.cro = (cro.props && cro.props.children) || '';
                    }
                    delete params.experimentType;
                    await $http.post(urls.editProjectInfo, params);
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0331));
                    localStorage.setItem('projectName', values.projectName || '');
                    setTitleName();
                    onClose();
                    getProjectDetailInfo();
                }catch(e) {
                    message.error(e.message);
                }finally{
                    this.setState({buttonLoading: false});
                }
            }
        });
    }, 500)

    // 获取与设置FORM
    getFormItem = (datas) => {
        const { croList = [], treatmentList = [], personList = [], stagingList = []} = this.state;
        const { getFieldDecorator } = this.props.form;
        const FormElements = Object.keys(this.FormElement);

        this.FormElement['croId'].selectList = croList;
        this.FormElement['therapyAreaId'].selectList = treatmentList;
        this.FormElement['projectManagerId'].selectList = personList;
        this.FormElement['studyStageId'].selectList = stagingList;

        return FormElements.map(
            item => {
                if(item === 'experimentType'){
                    if(this.FormElement[item].display === false) {
                        return;
                    }
                }
                return universalform({...this.FormElement[item], getFieldDecorator, value: datas[item] || this.FormElement[item].value});
            }
        );
    }

    render() {
        const { buttonLoading, projectInfo, spinning } = this.state;
        if(spinning) {
            return <Spin className="flex-center" />;
        }
        return (
            <Form layout="vertical">
                {
                    this.getFormItem(projectInfo || {})
                }
                <SaveDom buttonLoading={buttonLoading} onHandleClick={this.handleSubmit} intl={this.props.intl} />
            </Form>
        );
    }
}

export default EditProject;