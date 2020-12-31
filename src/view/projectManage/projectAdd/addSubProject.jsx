import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, cloneDeep } from 'lodash';
import { Form, message, Col, Input } from 'antd';
import { SaveDom } from 'component/drawer';
import { i18nMessages } from 'src/i18n';
import { universalform, formItemLayout } from 'src/component/universalForm';

@Form.create()
class AddSubProject extends React.Component {

    state = {
        buttonLoading: false,
        projectInfo: {},

        stagingList: [], // 项目分期
        testList: [], // 试验类型
        personList: [], // 主要研究者
    }

    componentWillMount() { 
        this.onPersonSearch();
        this.onStaging();
    }

    // 设置子项目分期
    setProjectInfo = () => {
        const { parentProjectInfo } = this.props;
        console.log(parentProjectInfo);
        this.setState({
            projectInfo: {
                studyStageId: parentProjectInfo.studyStageId,
                candidateId: parentProjectInfo.candidateId,
                programCode: parentProjectInfo.programCode
            }
        }, () => {
            this.onExperimentTypeSelect({}, { props: { item: { fieldCode: parentProjectInfo.researchstageFieldCode } } });
        });
    }

    // 主要研究者查找
    onPersonSearch = debounce(async (value) => {
        try{
            const result = await $http.post(urls.listCompanyAndRelationUserPage, {
                pageIndex: 1,
                pageSize: 10,
                keyword: value
            });
            const personList = result && result.data && result.data.map(item => {
                return {
                    value: item.userId,
                    // name: item.email ? `${item.userName}(${item.email})` : `${item.userName}`,
                    name: (item.email && item.userName) ? `${item.userName}(${item.email})` : (item.userName || item.email)
                };
            }) || [];
            this.setState({
                personList
            });
        }catch(e){
            message.error(e.message);
        }
    }, 500)

    // 获取数据字典的内容
    onStaging = async () => {
        try{
            const { parentProjectInfo } = this.props;
            const stagingOriginList = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('研究分期')}`);
            const stagingList = stagingOriginList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent
                };
            });
            const testOriginList = await $http.get(`${urls.findEnumTemplate}?categoryCode=project&fieldName=${encodeURI('试验类型')}`);
            /**
             * 手动创建的子项目试验周期、方案编号与父项目一致，类型可与其他子项目一样，
             * 但类型必须在父项目试验类型范围内，手动创建的子项目需要根据项目名称做判重。
             */
            const experimentType = parentProjectInfo.experimentType ? parentProjectInfo.experimentType.split(',') : [];
            const testList = testOriginList.filter(item => {
                // return experimentType.indexOf(item.fieldContent) >= 0 || item.fieldContent === 'NA';
                return experimentType.indexOf(item.fieldContent) >= 0;
            });
            this.setState({ stagingList, testList: testList.map(item => {
                return {
                    value: item.id,
                    name: item.fieldContent,
                    fieldCode: item.fieldCode
                };
            }) });
            this.setProjectInfo();
        }catch(e) {
            message.error(e.message);
        }
    }

    /**
     * 项目分期改变
     * 根据选择的分期判断试验类型是否有下拉菜单
     * BE，必填项，试验类型包括预试验、正式试验、餐前预试验、餐后预试验、餐前正式试验、餐后正式试验；支持多选
     * I期：预试验、正式试验
     */
    onExperimentTypeSelect = ({}, { props: { item } }) => {
        const { testList = [] } = this.state;
        const { resetFields } = this.props.form;
        if(item.fieldCode === 'RESEARCH_PERIOD_BE') { // BE期
            this.FormElement['experimentType'].display = true;
            resetFields(['experimentType']);
            this.FormElement['experimentType'].selectList = testList;
        }else if(item.fieldCode === 'NARESEARCH_PERIOD_FIRST'){ // I期
            this.FormElement['experimentType'].display = true;
            resetFields(['experimentType']);
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

    FormElement = {
        programCode: {
            key: 'programCode',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0264),
            type: 'input',
            require: true,
            disabled: true,
            span: 24,
            maxLength: 200
        },
        projectName: {
            key: 'projectName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0019),
            type: 'input',
            require: true,
            span: 24,
            maxLength: 500
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
        experimentType: {
            key: 'experimentType',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0026),
            type: 'single_dropdown',
            filterOption: true,
            span: 24,
            // mode: 'multiple',
            display: false,
            require: true
        },
        projectManagerId: {
            key: 'projectManagerId',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0157),
            type: 'multiple_input',
            onSearch: this.onPersonSearch,
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
                const { appId, parentProjectInfo, setSubProjectList, getProjectList, searchParams, onClose } = this.props;
                const cloneValues = cloneDeep(values);
                delete cloneValues.experimentType;
                let formValue = {};
                /**
                 * 传入的数据是根据选择的分期来判断,分期不同,传入的字段不同
                 * 项目的新增和编辑传入和传出的数组都转为字符串
                 */
                if(values.experimentType && this.FormElement['experimentType'].mode === 'tags') {
                    formValue = {
                        ...cloneValues,
                        experimentType: values.experimentType.join(',')
                    };
                } else if(values.experimentType && this.FormElement['experimentType'].mode === 'multiple') {
                    formValue = {
                        ...cloneValues,
                        experimentTypeId: values.experimentType.join(',')
                    };
                } else {
                    formValue = {
                        ...cloneValues,
                        experimentTypeId: values.experimentType
                    };
                }
                console.log(parentProjectInfo);
                // 父项目的croId带入到子项目里面
                if(parentProjectInfo.croId) {
                    formValue.croId = parentProjectInfo.croId;
                    formValue.cro = parentProjectInfo.cro;
                }
                try{
                    await $http.post(urls.addSubProject, Object.assign({}, {
                        appId,
                        pid: parentProjectInfo.id,
                        candidateId: parentProjectInfo.candidateId,
                        candidate: parentProjectInfo.candidate,
                        ...formValue
                    }, values.projectManagerId ? {
                        projectManagerId: values.projectManagerId.join(',')
                    } : {}));
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0262));
                    onClose();
                    if(searchParams[appId]) {
                        getProjectList(searchParams[appId]);
                    } else {
                        getProjectList({});
                    }
                    setSubProjectList(true, {id: parentProjectInfo.id});
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
        const { stagingList = [], personList = []} = this.state;
        const { getFieldDecorator } = this.props.form;
        const econfigLanguage = localStorage.getItem('econfigLanguage') || ((JSON.parse(localStorage.getItem('sso_loginAccountInfo') || '{}').selectLanguage || {}).key);
        const FormElements = Object.keys(this.FormElement);

        this.FormElement['studyStageId'].selectList = stagingList;
        this.FormElement['projectManagerId'].selectList = personList;

        return FormElements.map(
            item => {
                if(item === 'experimentType'){
                    if(this.FormElement[item].display === false) {
                        return;
                    }
                }
                if(item === 'programCode') {
                    return (
                        <Col span={this.FormElement[item].span} key={this.FormElement[item].key}>
                            <div style={{fontSize: '14px', color: '#ccc'}}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0506)}</div>
                            <Form.Item
                                label={this.FormElement[item].label}
                            >
                                {getFieldDecorator(this.FormElement[item].key, 
                                    {
                                        initialValue: datas[item] || this.FormElement[item].value,
                                        rules: [
                                            {
                                                required: this.FormElement[item].require,
                                                message: `${this.FormElement[item].label}${econfigLanguage === 'zh_CN' ? '是必填项' : ' is required'}!`,
                                            },
                                            {
                                                max: this.FormElement[item].maxLength,
                                                message: econfigLanguage === 'zh_CN' ? `不允许超过${this.FormElement[item].maxLength}个字符!` : `programCode cannot be longer than ${this.FormElement[item].maxLength} characters`,
                                            },
                                        ],
                                    }
                                )(
                                    <Input title={datas[item] || this.FormElement[item].value} placeholder={`${econfigLanguage === 'zh_CN' ? '请输入' : 'Please enter '}${this.FormElement[item].label}`} disabled={this.FormElement[item].disabled} rows={4} />
                                )}
                            </Form.Item>
                        </Col>
                    );
                } else {
                    return universalform({...this.FormElement[item], getFieldDecorator, value: datas[item] || this.FormElement[item].value});
                }
            }
        );
    }

    render() {
        const { buttonLoading, projectInfo = {} } = this.state;
        return (
            <Form layout="vertical">
                {
                    this.getFormItem(projectInfo)
                }
                <SaveDom buttonLoading={buttonLoading} onHandleClick={this.handleSubmit} intl={this.props.intl} />
            </Form>
        );
    }
}

export default AddSubProject;