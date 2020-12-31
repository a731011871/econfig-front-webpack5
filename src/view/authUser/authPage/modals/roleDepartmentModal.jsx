import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Select, TreeSelect } from 'antd';
import { i18nMessages } from 'src/i18n';

const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;

@Form.create()
class roleDepartmentModal extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        intl: PropTypes.object,
        roleList: PropTypes.array,
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
        selectOrganIds: PropTypes.array,
        departmentList: PropTypes.array
    };

    constructor(props) {
        super(props);
        this.state = {
            showDepartment: true,
            selectRoleInfo: {}
        };
    }

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode
                        value={item.id}
                        title={item.organizeName}
                        key={item.id}
                        organType={item.organType}
                        parentId={item.parentId || ''}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    value={item.id}
                    key={item.id}
                    parentId={item.parentId || ''}
                    organType={item.organType}
                    title={item.organizeName}
                />
            );
        });

    changeRoles = value => {
        const roleInfo = this.props.roleList.find(item => item.id === value);
        if (roleInfo.needDepartment === 0) {
            this.props.form.setFieldsValue({ organIds: [] });
            this.setState({
                showDepartment: false,
                selectRoleInfo: roleInfo
            });
        } else {
            this.setState({ showDepartment: true, selectRoleInfo: roleInfo });
        }
    };

    onOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log(values);
            const organs = [
                {
                    organIds: values.organIds,
                    roleIds: [values.roleId]
                }
            ];
            this.props.onOk(organs);
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        };
        const { showDepartment, selectRoleInfo } = this.state;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <Modal
                className="roleProjectSiteModal"
                title={this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0311
                )}
                width={800}
                onOk={this.onOk}
                onCancel={this.props.onCancel}
                visible={this.props.visible}
            >
                {/*<div className="pLeft40 pBottom15">*/}
                {/*<div className="mBottom8">*/}
                {/*<span>授权人员:</span>*/}
                {/*<span style={{ wordBreak: 'break-all' }}>{this.props.userName}</span>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*<span>授权系统:</span>*/}
                {/*<span>{this.props.appName}</span>*/}
                {/*</div>*/}
                {/*</div>*/}
                <Form className="pLeft50">
                    <Form.Item
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0134
                        )}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('roleId', {
                            initialValue: '',
                            rules: [
                                {
                                    required: true,
                                    message: this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0482
                                    )
                                }
                            ]
                        })(
                            <Select
                                style={{ width: 300 }}
                                optionFilterProp="children"
                                showSearch
                                allowClear
                                onChange={this.changeRoles}
                            >
                                {this.props.roleList
                                    .filter(item => item.isEdit)
                                    .map(item => (
                                        <Option value={item.id} key={item.id}>
                                            {item.roleName}
                                        </Option>
                                    ))}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        key="organIds"
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0705)}
                    >
                        {getFieldDecorator('organIds', {
                            initialValue: [],
                            rules: [
                                {
                                    required: selectRoleInfo
                                        ? selectRoleInfo.needDepartment === 1
                                        : false,
                                    message: formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0325
                                    ).replace(
                                        'xxx',
                                        this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0705
                                        )
                                    )
                                }
                            ]
                        })(
                            <TreeSelect
                                dropdownStyle={{
                                    maxHeight: 300,
                                    overflow: 'auto'
                                }}
                                style={{ width: 300 }}
                                placeholder={
                                    showDepartment
                                        ? formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0707
                                          )
                                        : selectRoleInfo.nullDepartmentDefaultValue ===
                                          'NONE'
                                        ? formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0708
                                          )
                                        : formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0709
                                          )
                                }
                                disabled={!showDepartment}
                                allowClear
                                multiple
                                treeNodeFilterProp="title"
                                treeDefaultExpandAll
                                onChange={this.organChange}
                            >
                                {this.renderTreeNodes(
                                    this.props.departmentList
                                )}
                            </TreeSelect>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export default roleDepartmentModal;
