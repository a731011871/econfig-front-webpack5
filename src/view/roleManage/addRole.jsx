import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, random } from 'lodash';
import { Form, message } from 'antd';
import { SaveDom } from 'component/drawer';
import { universalform, formItemLayout } from 'src/component/universalForm';

@Form.create()
class AddRole extends React.Component {

    state = {
        buttonLoading: false,
        roleInfo: {}
    }

    componentWillMount() { 
        const { isAdd, roleInfo } = this.props;
        if(isAdd) {
            this.setState({ roleInfo: {} });
        }else{
            this.setState({ roleInfo });
        }
    }

    FormElement = {
        appId: {
            key: 'appId',
            label: '所属系统',
            type: 'single_dropdown',
            span: 24,
            require: true
        },
        roleName: {
            key: 'roleName',
            label: '角色名称',
            type: 'input',
            require: true,
            span: 24,
            maxLength: 150
        },
        roleType: {
            key: 'roleType',
            label: '角色类型',
            type: 'single_dropdown',
            span: 24,
            require: true,
            selectList: [
                {
                    name: '管理员',
                    value: 1
                }
            ]
        },
        description: {
            key: 'description',
            span: 24,
            label: '角色描述',
            type: 'textarea',
            maxLength: 200,
            customFormItemLayout: formItemLayout
        },
    }

    handleSubmit = debounce(() => {
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({buttonLoading: true});
                const { onClose } = this.props;
                const date = new Date();
                const randomRoleCode = date.getTime() + random(0, 10000);
                try{
                    await $http.post(urls.roleInsert, {
                        ...values,
                        roleCode: randomRoleCode,
                        isBuiltin: 0
                    });
                    message.success('添加成功!');
                    this.props.roleEffects.setCustomTable(this.props.softInfo.eventKey);
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
        const FormElements = Object.keys(this.FormElement);
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
                return universalform({...this.FormElement[item], getFieldDecorator, value: datas[item] || this.FormElement[item].value});
            }
        );
    }

    render() {
        const { buttonLoading, roleInfo = {} } = this.state;
        return (
            <Form layout="vertical">
                {
                    this.getFormItem(roleInfo)
                }
                <SaveDom buttonLoading={buttonLoading} onHandleClick={this.handleSubmit} />
            </Form>
        );
    }
}

export default AddRole;