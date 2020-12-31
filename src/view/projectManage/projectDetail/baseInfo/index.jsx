import React from 'react';
import { i18nMessages } from 'src/i18n';
import urls, { parseApiUrl } from 'utils/urls';
import { $http } from 'utils/http';
import { cloneDeep } from 'lodash';
import { message, Form, Spin, Button } from 'antd';
import { universalform, formItemLayout } from 'src/component/universalForm';
import { drawerFun } from 'component/drawer';
import EditProject from './editProject';
import EditSubProject from './editSubProject';

@Form.create()
class BaseInfo extends React.PureComponent {

    state = {
        projectInfo: {},
        spinning: true
    }

    FormElement = {
        programCode: {
            key: 'programCode',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0264),
            type: 'only_read',
            span: 8,
        },
        candidate: {
            key: 'candidate',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0022),
            type: 'only_read',
            span: 8,
        },
        therapyAreaName: {
            key: 'therapyAreaName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0310),
            type: 'only_read',
            span: 8,
        },
        projectManager: {
            key: 'projectManager',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0021),
            type: 'only_read',
            span: 8,
        },
        studyStageName: {
            key: 'studyStageName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0025),
            type: 'only_read',
            span: 8,
        },
        experimentType: {
            key: 'experimentType',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0026),
            type: 'only_read',
            span: 8,
        },
        cro: {
            key: 'cro',
            label: 'CRO',
            type: 'only_read',
            span: 8,
        },
        projectName: {
            key: 'projectName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0019),
            type: 'only_read',
            customFormItemLayout: formItemLayout,
            span: 8,
        },
        createByName: {
            key: 'createByName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0024),
            type: 'only_read',
            customFormItemLayout: formItemLayout,
            span: 8,
        },
        updateTime: {
            key: 'updateTime',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0417),
            type: 'only_read',
            customFormItemLayout: formItemLayout,
            span: 8,
        },
        tenantName: {
            key: 'tenantName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0418),
            type: 'only_read',
            customFormItemLayout: formItemLayout,
            span: 8,
        },
        projectSerialNo: {
            key: 'projectSerialNo',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0505),
            type: 'only_read',
            customFormItemLayout: formItemLayout,
            span: 8,
        },
        abbreviatedName: {
            key: 'abbreviatedName',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0651),
            type: 'only_read',
            customFormItemLayout: formItemLayout,
            span: 24,
        },
        projectDesc: {
            key: 'projectDesc',
            label: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0158),
            type: 'only_read',
            customFormItemLayout: formItemLayout,
            span: 24,
        },
    }

    componentWillMount() {
        this.getProjectDetailInfo();
    }

    getProjectDetailInfo = async () => {
        const { match: { params: { id, appId } } } = this.props;
        try{
            this.setState({
                spinning: true
            });
            const projectInfo = await $http.get(parseApiUrl(urls.projectDetailInfo, {
                id,
                appId
            }));
            this.setState({
                projectInfo,
                spinning: false
            });
        }catch(e) {
            message.error(e.message);
        }
    }

     // 获取与设置FORM
     getFormItem = (datas) => {
         //  const { match: { params: { type } } } = this.props;
         const formElement = cloneDeep(this.FormElement);
         /**
          * 如果是子项目，不显示cro
          * 如果不是I或者BE，不显示实验类型
          */
         //  if(type === 'child') {
         //      delete formElement['cro'];
         //  }
         if(datas.researchstageFieldCode !== 'RESEARCH_PERIOD_BE' && datas.researchstageFieldCode !== 'NARESEARCH_PERIOD_FIRST') {
             delete formElement['experimentType'];
         }
         const { getFieldDecorator } = this.props.form;
         const FormElements = Object.keys(formElement);
         return FormElements.map(
             item => {
                 return universalform({...formElement[item], getFieldDecorator, value: datas[item]});
             }
         );
     }

     // 编辑项目
    editProject = () => {
        const { match: { params: { id, appId } } } = this.props;
        const { projectInfo = {} } = this.state;
        console.log(projectInfo);
        if(projectInfo.pid !== '0') {
            drawerFun({
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0098)+this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0335),
                width: 500,
                compontent: props => (
                    <EditSubProject 
                        projectInfo={projectInfo} 
                        appId={appId} 
                        id={id}
                        setTitleName={this.props.setTitleName}
                        getProjectDetailInfo={this.getProjectDetailInfo}
                        {...props} 
                        intl={this.props.intl}
                    />
                )
            });
        } else {
            drawerFun({
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0098)+this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0335),
                width: 500,
                compontent: props => (
                    <EditProject 
                        projectInfo={projectInfo} 
                        appId={appId} 
                        id={id}
                        setTitleName={this.props.setTitleName}
                        getProjectDetailInfo={this.getProjectDetailInfo}
                        {...props} 
                        intl={this.props.intl}
                    />
                )
            });
        }
        
    }

    render () {
        const { projectInfo = {}, spinning } = this.state;
        return (
            <Spin spinning={spinning}>
                <div style={{display: 'inline-block'}}>
                    <Form layout="vertical" style={{margin: '20px'}}>
                        <Button style={{ position: 'absolute', 'right': '1px', 'zIndex': '999'}} onClick={this.editProject} type="primary">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0098)}</Button>
                        {
                            this.getFormItem(projectInfo)
                        }
                    </Form>
                </div>
                {/* <div style={{color: 'red', marginLeft: '20px'}}>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0419)}</div> */}
            </Spin>
        );
    }
}

export default BaseInfo;