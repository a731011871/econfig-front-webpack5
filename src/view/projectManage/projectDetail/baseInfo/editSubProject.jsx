import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, isArray } from 'lodash';
import { Form, message, Spin } from 'antd';
import { i18nMessages } from 'src/i18n';
import { SaveDom } from 'component/drawer';
import { universalform, formItemLayout } from 'src/component/universalForm';

@Form.create()
class EditSubProject extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoading: false,
            spinning: true,
            projectInfo: {},
            treatmentList: [], // 治疗领域
            personList: [],
            stagingList: [], // 项目分期
            testList: [], // 试验类型
        };
    }

    componentWillMount() { 
        const { projectInfo: { projectManagerId = '', projectOrigin, researchstageFieldCode } } = this.props;
        if(projectOrigin === '自动创建') {
            this.FormElement['experimentTypeId'].disabled = true;
        }
        if(researchstageFieldCode === 'RESEARCH_PERIOD_BE' || researchstageFieldCode === 'NARESEARCH_PERIOD_FIRST') {
            this.FormElement['experimentTypeId'].display = true;
        }
        console.log(this.props.projectInfo);
        this.onStaging(() => {
            this.onPersonSearch(projectManagerId ? projectManagerId.split(',') : '', () => {
                console.log(this.state.personList);
                this.setState({
                    projectInfo: {...this.props.projectInfo, projectManagerId: this.state.personList.length !== 0 ? (projectManagerId ? projectManagerId.split(',') : []) : ''} || {},
                    spinning: false
                });
            });
        });
    }

    // 获取数据字典的内容
    onStaging = async (callback) => {
        try{
            const { projectInfo: { parentExperimentTypeId = '' } } = this.props;
            const treatmentOriginList = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('治疗领域')}`);
            const treatmentList = treatmentOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            });
            const stagingOriginList = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('研究分期')}`);
            const stagingList = stagingOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            });
            /**
             * 手动创建的子项目试验周期、方案编号与父项目一致，类型可与其他子项目一样，
             * 但类型必须在父项目试验类型范围内，手动创建的子项目需要根据项目名称做判重。
             */
            const testOriginList = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('试验类型')}`);
            const experimentType = parentExperimentTypeId ? parentExperimentTypeId.split(',') : [];
            const testList = testOriginList.filter(item => {
                return experimentType.indexOf(item.id) >= 0;
            });
            this.setState({ treatmentList, stagingList, testList: testList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            })}, () => {
                console.log(this.state.testList);
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

    FormElement = {
        projectSerialNo: {
            key: 'projectSerialNo',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0505),
            type: 'input',
            disabled: true,
            value: '',
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
            disabled: true,
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
            disabled: true,
            filterOption: true,
            onSelect: this.onExperimentTypeSelect,
            onSearch: () => {}
        },
        experimentTypeId: {
            key: 'experimentTypeId',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0026),
            type: 'single_dropdown',
            filterOption: true,
            span: 24,
            display: false,
            require: true
        },
        therapyAreaId: {
            key: 'therapyAreaId',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0310),
            require: true,
            type: 'single_dropdown',
            filterOption: true,
            disabled: true,
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
                const { appId, getProjectDetailInfo, onClose,id, setTitleName } = this.props;
                try{
                    const params = {
                        id,
                        appId,
                        ...values,
                        experimentTypeId: values.experimentTypeId,
                        projectManagerId: isArray(values.projectManagerId) ? values.projectManagerId.join(',') : values.projectManagerId
                    };
                    delete params.experimentType;
                    // delete params.studyStageId;
                    console.log(params);
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
        const { treatmentList = [], personList = [], stagingList = [], testList = [] } = this.state;
        const { getFieldDecorator } = this.props.form;
        const FormElements = Object.keys(this.FormElement);

        this.FormElement['studyStageId'].selectList = stagingList;
        this.FormElement['therapyAreaId'].selectList = treatmentList;
        this.FormElement['projectManagerId'].selectList = personList;
        this.FormElement['experimentTypeId'].selectList = testList;

        return FormElements.map(
            item => {
                if(item === 'experimentTypeId'){
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

export default EditSubProject;