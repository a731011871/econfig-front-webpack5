import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, random } from 'lodash';
import { Form, message } from 'antd';
import { SaveDom } from 'component/drawer';
import { i18nMessages } from 'src/i18n';
import { universalform, formItemLayout } from 'src/component/universalForm';

@Form.create()
class CopyRole extends React.Component {

    state = {
        buttonLoading: false,
        projectList: [], // 项目列表
        roleInfo: {}
    }

    componentWillMount() { 
        const { roleInfo = {}, showProjectItem } = this.props;
        this.setState({ roleInfo });
        if(showProjectItem) {
            this.onProjectSearch();
            this.FormElement['projectId'].display = true;
        }
    }

    // 项目搜索
    onProjectSearch = debounce(async (value = '') => {
        const { roleInfo = {} } = this.props;
        try{
            const result = await $http.post(urls.getProjects_web, {
                appId: roleInfo.appId,
                keyword: value,
                pageIndex: 1,
                pageSize: 30,
                paging: true
            });
            console.log(result);
            const projectList = result && result.list && result.list.map(item => {
                return {
                    value: item.id,
                    name: `${item.projectSerialNo ? `【${item.projectSerialNo}】${item.projectName}` : item.projectName}`
                };
            }) || [];
            this.setState({
                projectList
            });
        }catch(e){
            message.error(e.message);
        }
    }, 500)

    FormElement = {
        roleName: {
            key: 'roleName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0172),
            type: 'input',
            maxLength: 150,
            span: 24,
            require: true
        },
        roleCode: {
            key: 'roleCode',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0173),
            type: 'input',
            require: true,
            disabled: true,
            span: 24,
            maxLength: 150
        },
        roleType: {
            key: 'roleType',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0174),
            type: 'single_dropdown',
            span: 24,
            require: true,
            disabled: true,
        },
        description: {
            key: 'description',
            span: 24,
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0175),
            type: 'textarea',
            maxLength: 200,
            customFormItemLayout: formItemLayout
        },
        projectId: {
            key: 'projectId',
            span: 24,
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0536),
            onSearch: this.onProjectSearch,
            type: 'multiple_input',
            filterOption: false,
            bottomText: (<div style={{fontSize: '14px',marginTop: '5px', color: '#FF0000', marginBottom: '-13px'}}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0542)}</div>),
            display: false,
            maxLength: 200,
            customFormItemLayout: formItemLayout
        },
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({buttonLoading: true});
                const { onClose, roleInfo = {} } = this.props;
                const date = new Date();
                const randomRoleCode = date.getTime() + random(0, 10000);
                try{
                    await $http.post(urls.insertCopyRoleMenu, {
                        ...values,
                        builtinCode: values.roleCode,
                        roleCode: randomRoleCode,
                        appId: roleInfo.appId,
                        isBuiltin: 0,
                        pid: roleInfo.id,
                        authType: roleInfo.authType === '2' ? '2' : '1',
                        projectId: values.projectId || [],
                        commonType: roleInfo.commonType || ''
                    });
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0262));
                }catch(e) {
                    message.error(e.message);
                }finally{
                    this.setState({buttonLoading: false});
                    onClose();
                }
            }
        });
    }, 500)

    // 获取与设置FORM
    getFormItem = (datas) => {
        const { getFieldDecorator } = this.props.form;
        const { projectList } = this.state;
        const { roleTypes } = this.props;
        const FormElements = Object.keys(this.FormElement);
        this.FormElement['projectId'].selectList = projectList;
        this.FormElement['roleType'].selectList = roleTypes.map(item => {
            return {
                name: item.roleTypeName,
                value: item.roleTypeCode
            };
        });
        return FormElements.map(
            item => {
                if(item === 'projectId'){
                    if(this.FormElement[item].display === false) {
                        return;
                    }
                }
                return universalform({...this.FormElement[item], getFieldDecorator, value: datas[item] || this.FormElement[item].value});
            }
        );
    }

    render() {
        const { buttonLoading, roleInfo } = this.state;
        return (
            <Form layout="vertical">
                {
                    this.getFormItem(roleInfo)
                }
                <SaveDom buttonLoading={buttonLoading} onHandleClick={this.handleSubmit} intl={this.props.intl} />
            </Form>
        );
    }
}

export default CopyRole;