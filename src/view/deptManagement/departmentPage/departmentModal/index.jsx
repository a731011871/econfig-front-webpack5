import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { $http } from 'utils/http';
import { random, debounce, find } from 'lodash';
import urls from 'utils/urls';
import { deptService } from 'src/service/deptService';
import { Form, Input, Button, TreeSelect, Select, message, Spin } from 'antd';
import { getRequiredRule, whitespaceRule } from 'utils/validateRules';
import { fieldHasError } from 'utils/fieldHasError';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

const TreeNode = TreeSelect.TreeNode;
const TextArea = Input.TextArea;
const Option = Select.Option;

const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
`;

@injectIntl
@Form.create()
class DepartmentDrawerView extends React.PureComponent {
    static propTypes = {
        type: PropTypes.oneOf(['new', 'edit']),
        departmentId: PropTypes.string,
        // departmentInfo: PropTypes.object,
        hideDrawer: PropTypes.func,
        updateDepartment: PropTypes.func,
        addDepartment: PropTypes.func,
        departmentList: PropTypes.array,
        tenantType: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            departmentInfo: {},
            showModal: false, // 基础设施新增编辑弹层
            positionList: [], // 职位列表
            disabledOrganType: false,
            userList: []
        };
    }

    componentDidMount = async () => {
        try {
            const positionList = await $http.post(urls.getPositionList, {
                dictTypeName: '用户职位'
            });
            let departmentInfo = {};
            const userList = await $http.post(urls.getAllCompanyUsers, {
                pageIndex: 1,
                pageSize: 0,
                status: '1',
                userPropertys: ['CompanyUser', 'TMUser']
            });
            if (this.props.type === 'edit') {
                departmentInfo = await deptService.getDepartmentInfo(
                    this.props.departmentId
                );
                if (
                    departmentInfo.organizeUserId &&
                    !find(
                        userList,
                        item => item.userId === departmentInfo.organizeUserId
                    )
                ) {
                    userList.push({
                        userId: departmentInfo.organizeUserId,
                        userName: departmentInfo.organizeUserName,
                        accountName: departmentInfo.organizeAccountName
                    });
                }
                this.props.form.setFieldsValue(
                    Object.assign({}, departmentInfo, {
                        organizeUserId: find(
                            userList,
                            item =>
                                item.userId === departmentInfo.organizeUserId
                        )
                            ? departmentInfo.organizeUserId
                            : ''
                    })
                );
                this.props.form.validateFields();
            }
            this.setState({
                positionList,
                userList: userList || [],
                departmentInfo
            });
        } catch (e) {
            message.error(e.message);
        }

        this.props.form.validateFieldsAndScroll();
    };

    fetchUser = debounce(async keyWord => {
        if (keyWord) {
            try {
                const userList = await $http.post(urls.getAllCompanyUsers, {
                    pageIndex: 1,
                    pageSize: 20,
                    keyWord,
                    status: '1',
                    userPropertys: ['CompanyUser', 'TMUser']
                });
                this.setState({ userList: userList || [] });
            } catch (e) {
                message.error(e.message);
            }
        }
    }, 700);

    handleSubmit = e => {
        e.preventDefault();

        const { form } = this.props;
        const _this = this;
        form.validateFields(error => {
            if (error) {
                alert('error');
                return;
            }
            const dto = form.getFieldsValue();
            const admin = _this.state.userList.filter(
                item => item.userId === dto.organizeUserId
            )[0];
            if (admin) {
                dto.organizeUserName = admin.userName;
                dto.personId = admin.personId;
            }
            if (this.props.tenantType !== 'INSTITUTION') {
                dto.organType = 'base';
            }
            if (this.props.type === 'new') {
                dto.organizeCode = new Date().getTime() + random(0, 10000);
                this.props.addDepartment(dto);
            } else if (this.props.type === 'edit') {
                this.props.updateDepartment(
                    Object.assign({}, _this.state.departmentInfo, dto)
                );
            }
        });
    };

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
                        dataRef={item}
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

    render() {
        const { getFieldDecorator, getFieldsError } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        };
        const { fetching } = this.state;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <Form
                onSubmit={this.handleSubmit}
                className="departmentInfoModal mBottom50"
            >
                <div className="basicInfo">
                    {this.props.tenantType === 'INSTITUTION' &&
                        this.props.type === 'new' && (
                            <Form.Item
                                {...formItemLayout}
                                label={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0071
                                )}
                            >
                                {getFieldDecorator('organType', {
                                    initialValue: 'department',
                                    rules: []
                                })(
                                    <Select
                                        disabled={this.state.disabledOrganType}
                                    >
                                        <Option key="department">
                                            {formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0246
                                            )}
                                        </Option>
                                        <Option key="institution">
                                            {formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0247
                                            )}
                                        </Option>
                                        <Option key="science">
                                            {formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0248
                                            )}
                                        </Option>
                                        <Option key="ethics">
                                            {formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0249
                                            )}
                                        </Option>
                                        <Option key="hospitalArea">
                                            {formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0713
                                            )}
                                        </Option>
                                        <Option key="other">
                                            {formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0250
                                            )}
                                        </Option>
                                    </Select>
                                )}
                            </Form.Item>
                        )}
                    {(this.props.type === 'new' ||
                        !!this.state.departmentInfo.parentId) && (
                        <Form.Item
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0072
                            )}
                        >
                            {getFieldDecorator('parentId', {
                                initialValue:
                                    this.state.departmentInfo.parentId || '',
                                rules: [
                                    getRequiredRule(
                                        formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0072
                                        ),
                                        formatMessage
                                    )
                                ]
                            })(
                                <TreeSelect
                                    dropdownStyle={{
                                        maxHeight: 300,
                                        overflow: 'auto'
                                    }}
                                    placeholder={formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0051
                                    )}
                                    allowClear
                                    treeNodeFilterProp="title"
                                    // onSelect={(value, node) => {
                                    //     if (
                                    //         this.props.tenantType ===
                                    //             'INSTITUTION' &&
                                    //         this.props.type === 'new' &&
                                    //         node.props.parentId
                                    //     ) {
                                    //         this.props.form.setFieldsValue({
                                    //             organType: node.props.organType
                                    //         });
                                    //         this.setState({
                                    //             disabledOrganType: true
                                    //         });
                                    //     } else {
                                    //         this.setState({
                                    //             disabledOrganType: false
                                    //         });
                                    //     }
                                    // }}
                                    treeDefaultExpandAll
                                    disabled={this.props.type === 'edit'}
                                >
                                    {this.renderTreeNodes(
                                        this.props.departmentList
                                    )}
                                </TreeSelect>
                            )}
                        </Form.Item>
                    )}
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0073)}
                    >
                        {getFieldDecorator('organizeName', {
                            initialValue: '',
                            rules: [
                                getRequiredRule(
                                    formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0073
                                    ),
                                    formatMessage
                                ),
                                whitespaceRule(
                                    formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0073
                                    ),
                                    formatMessage
                                )
                            ]
                        })(
                            <Input
                                disabled={
                                    this.props.type === 'edit' &&
                                    !this.state.departmentInfo.parentId
                                }
                            />
                        )}
                    </Form.Item>
                    {this.props.type === 'edit' && (
                        <Form.Item
                            {...formItemLayout}
                            label={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0251
                            )}
                        >
                            {getFieldDecorator('organizeUserId', {
                                initialValue: '',
                                rules: []
                            })(
                                this.state.userList.length > 0 ? (
                                    <Select
                                        className="mBottom15"
                                        showSearch
                                        notFoundContent={
                                            fetching ? (
                                                <Spin size="small" />
                                            ) : (
                                                formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0170
                                                )
                                            )
                                        }
                                        filterOption={false}
                                        onSearch={this.fetchUser}
                                    >
                                        {this.state.userList.map(item => (
                                            <Option key={item.userId}>
                                                {/* {`${item.userName}${
                                                    item.accountName
                                                        ? `（${
                                                            item.accountName
                                                        }）`
                                                        : ''
                                                }`} */}
                                                {item.userName &&
                                                item.accountName
                                                    ? `${
                                                          item.userName
                                                      }${`（${item.accountName}）`}`
                                                    : item.userName ||
                                                      item.accountName}
                                            </Option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Select
                                        className="mBottom15"
                                        showSearch
                                        notFoundContent={formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0170
                                        )}
                                        filterOption={false}
                                        onSearch={this.fetchUser}
                                    />
                                )
                            )}
                        </Form.Item>
                    )}
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0074)}
                    >
                        {getFieldDecorator('positionId', {
                            initialValue: [],
                            rules: []
                        })(
                            <Select mode="multiple">
                                {this.state.positionList.map(item => (
                                    <Option key={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0075)}
                    >
                        {getFieldDecorator('organizeDesc', {
                            initialValue: '',
                            rules: []
                        })(<TextArea rows={4} />)}
                    </Form.Item>
                </div>
                <AbsoluteDiv>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        disabled={fieldHasError(getFieldsError())}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </Form>
        );
    }
}

export default DepartmentDrawerView;
