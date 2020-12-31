import React from 'react';
import PropTypes from 'prop-types';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, isArray } from 'lodash';
import { i18nMessages } from 'src/i18n';
import { Form, message } from 'antd';
import { SaveDom } from 'component/drawer';
import { universalform, formItemLayout } from 'src/component/universalForm';

@Form.create()
class EditRole extends React.Component {

    static propTypes = {
        isEdit: PropTypes.bool // 是否可编辑
    }

    static defaultProps = {
        isEdit: '0'
    }

    state = {
        buttonLoading: false,
        projectList: [],
        roleInfo: {}
    }

    componentWillMount() { 
        const { roleInfo = {}, showProjectItem } = this.props;
        const projectId = Array.prototype.slice.call(roleInfo.projectId || []) || [];
        if(showProjectItem) {
            this.onProjectSearch(projectId);
            this.FormElement['projectId'].display = true;
        }
        this.setState({ roleInfo: {
            ...roleInfo,
            projectId
        } });
    }

    // 项目搜索
    onProjectSearch = debounce(async (value = '', callback) => {
        const { roleInfo = {} } = this.props;
        try{
            const result = await $http.post(urls.getProjects_web, Object.assign({}, {
                appId: roleInfo.appId,
                pageIndex: 1,
                pageSize: 30,
                paging: true
            }, isArray(value) ? {projectIds: value} : {keyword: value}));
            console.log(result);
            const projectList = result && result.list && result.list.map(item => {
                return {
                    value: item.id,
                    name: `${item.projectSerialNo ? `【${item.projectSerialNo}】${item.projectName}` : item.projectName}`
                };
            }) || [];
            this.setState({
                projectList
            }, () => {
                if(callback) callback();
            });
        }catch(e){
            message.error(e.message);
        }
    }, 500)

    FormElement = {
        appId: {
            key: 'appId',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0260),
            type: 'single_dropdown',
            span: 24,
            disabled: true,
            require: true
        },
        roleName: {
            key: 'roleName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0096),
            type: 'input',
            require: true,
            disabled: this.props.isEdit === '0',
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
        roleCode: {
            key: 'roleCode',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0173),
            type: 'input',
            disabled: true,
            span: 24,
        },
        description: {
            key: 'description',
            span: 24,
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0175),
            type: 'textarea',
            disabled: this.props.isEdit === '0',
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
            display: false,
            disabled: this.props.isEdit === '0',
            maxLength: 200,
            bottomText: (<div style={{fontSize: '14px',marginTop: '5px', color: '#FF0000', marginBottom: '-13px'}}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0542)}</div>),
            onChange: (item = []) => {
                if(item.length === 0) {
                    this.onProjectSearch();
                }
            },
            customFormItemLayout: formItemLayout
        },
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({buttonLoading: true});
                const { onClose, roleInfo = {}, flushCustomTable } = this.props;
                try{
                    await $http.post(urls.roleUpdate, {
                        ...values,
                        id: roleInfo.id,
                        projectId: values.projectId || []
                    });
                    message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0230));
                    flushCustomTable();
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
        const { softList, roleTypes } = this.props;
        const { projectList } = this.state;
        const FormElements = Object.keys(this.FormElement);
        this.FormElement['projectId'].selectList = projectList;
        this.FormElement['appId'].selectList = softList.map(item => {
            return {
                name: item.appName,
                value: item.appId
            };
        });
        this.FormElement['roleType'].selectList = roleTypes.map(item => {
            return {
                name: item.roleTypeName,
                value: item.roleTypeCode
            };
        });
        this.FormElement['appId'].value = softList && softList[0] && softList[0].appId;
        this.FormElement['roleType'].value = roleTypes && roleTypes[0] && roleTypes[0].roleTypeCode;

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
        const { buttonLoading, roleInfo = {} } = this.state;
        return (
            <Form layout="vertical" >
                {
                    this.getFormItem(roleInfo)
                }
                {this.props.isEdit === '1' && <SaveDom buttonLoading={buttonLoading} onHandleClick={this.handleSubmit} intl={this.props.intl} />}
            </Form>
        );
    }
}

export default EditRole;