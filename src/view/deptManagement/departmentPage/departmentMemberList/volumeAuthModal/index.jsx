import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Button, message, Spin, Row, Col, Divider } from 'antd';
import { i18nMessages } from 'src/i18n';
import { $http } from 'utils/http';
import urls, { parseApiUrl } from 'utils/urls';
import { includes, uniqBy, isBoolean } from 'lodash';
import SiteSelect from 'src/component/authPage/modals/siteSelect';
import { projectFilterOption } from 'src/utils/functions';
import { authServices } from 'src/service/authService';

const Option = Select.Option;

@Form.create()
class VolumeAuthModal extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        authType: PropTypes.string,
        intl: PropTypes.object,
        appId: PropTypes.string,
        appName: PropTypes.string,
        userName: PropTypes.string,
        projectId: PropTypes.string,
        roleList: PropTypes.array,
        fromProjectManage: PropTypes.bool,
        onCancel: PropTypes.func,
        selectProjectIds: PropTypes.array
    };

    constructor(props) {
        super(props);
        this.state = {
            projectList: [],
            fetching: false,
            selectProject: [],
            showProject: true,
            selectRoleInfo: {
                // 兼容未选择角色时的中心选择   角色的needSite属性默认为1
                needSite: 1
            },
            roleList: [],
            appId: '',
            loading: false
        };
    }

    componentDidMount() {
        console.log(this.props);
    }

    changeAppId = async appId => {
        try {
            const roleResult = await authServices.getRoleList(appId);
            let roleList = roleResult.map(item => ({
                ...item,
                roleName: `${item.roleName}${
                    item.blindState === 0
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0624
                          )
                        : item.blindState === 1
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0623
                          )
                        : ''
                }`
            }));
            if (appId === '09') {
                roleList = roleList.filter(
                    item =>
                        item.needDepartment !== undefined &&
                        item.needDepartment === 0
                );
            }
            if (appId === 'site') {
                roleList = roleList.filter(
                    item => item.roleType !== 'noProjectAdmin'
                );
            }
            this.setState(
                {
                    roleList,
                    appId,
                    selectProject: [],
                    selectRoleInfo: {},
                    showProject: true
                },
                () => {
                    this.fetchProject();
                    this.props.form.setFieldsValue({
                        roleId: [],
                        projectIds: []
                    });
                }
            );
        } catch (e) {
            message.error(e.message);
        }
    };

    fetchProject = async (value = '') => {
        console.log('fetching project', value);
        this.setState({ projectList: [], fetching: true });
        const filterProjectIds = this.state.selectProject
            .map(item => item.projectId)
            .concat(this.props.selectProjectIds);
        try {
            const params = {
                appId: this.state.appId,
                keyword: value,
                pageNum: 0,
                pageSize: 0
            };
            let result = [];
            if (this.props.fromProjectManage) {
                const projectInfo = await $http.get(
                    parseApiUrl(urls.projectDetailInfo, {
                        id: this.props.projectId,
                        appId: this.props.appId
                    })
                );
                result = {
                    list: [projectInfo]
                };
            } else {
                result = await $http.post(urls.projectList, params);
            }
            // esupply多一个全部项目选项
            const resultData =
                !this.props.fromProjectManage &&
                this.props.authType === '7' &&
                this.props.userType !== 'projectUser'
                    ? result.list.concat({
                          projectName: 'All Projects',
                          id: 'ALL'
                      })
                    : result.list;

            const projectList = resultData
                .filter(item => !includes(filterProjectIds, item.id))
                .map(project => ({
                    projectName: project.projectName,
                    projectId: project.id,
                    programCode: project.programCode,
                    projectSerialNo: project.projectSerialNo
                }));
            this.setState({
                projectList,
                fetching: false
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    changeRoles = (value, option) => {
        console.log(value, option);
        const roleInfo = option.props.dataRef;
        const { appId } = this.state;
        console.log(value, option.props.dataRef);
        const formValue = this.props.form.getFieldsValue();
        // site按照roleType进行配置，别的应用按照omp角色权限进行配置
        if (appId === 'site') {
            // 如果roleType是PI，项目需要必填，如果是别的roleType  项目不必填
            if (roleInfo.roleType === 'PI') {
                this.setState({
                    showProject: true,
                    selectRoleInfo: {
                        ...roleInfo,
                        needProject: 1
                    }
                });
            } else {
                this.setState(
                    {
                        showProject: false,
                        selectRoleInfo: {
                            ...roleInfo,
                            nullProjectDefaultValue:
                                roleInfo.roleType === 'admin' ? 'ALL' : 'NONE',
                            needProject: 0
                        }
                    },
                    () => {
                        this.props.form.setFieldsValue({ projectIds: [] });
                    }
                );
            }
        } else if (roleInfo.needProject === 0) {
            this.setState(
                {
                    showProject: false,
                    selectRoleInfo: roleInfo,
                    selectProject: []
                },
                () => {
                    this.props.form.setFieldsValue({ projectIds: [] });
                }
            );
        } else {
            this.setState({ showProject: true, selectRoleInfo: roleInfo });
        }
        /**
         * 选择的角色无需选择中心权限时，将所有中心列表已选择的数据清空
         * 中心选择为循环出来的 无法setFieldsValue
         * 先reset，然后把roleId和projectIds重新赋值，以达到清空siteIds的目的*/
        if (roleInfo.needSite === 0) {
            this.props.form.resetFields();
            this.props.form.setFieldsValue({
                roleId: value,
                appId: this.state.appId,
                projectIds: formValue.projectIds
            });
        }
    };

    projectChange = values => {
        const projectList = this.state.selectProject
            .concat(this.state.projectList)
            .filter(item => includes(values, item.projectId));
        const selectProject = uniqBy(projectList, 'projectId');
        this.setState({
            selectProject
        });
    };

    onSubmit = () => {
        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            console.log(values);
            try {
                const { appId, selectRoleInfo } = this.state;
                let authData = [];
                if (values.projectIds && values.projectIds.length) {
                    authData = values.projectIds.map(item => {
                        return {
                            appId,
                            projectId: item,
                            roleCode: selectRoleInfo.roleCode,
                            roleId: selectRoleInfo.id,
                            siteIds: values[item]?.map(i => i.key)
                        };
                    });
                } else {
                    authData = [
                        {
                            appId,
                            roleCode: selectRoleInfo.roleCode,
                            roleId: selectRoleInfo.id
                        }
                    ];
                }
                const params = {
                    appId,
                    companyUser: isBoolean(this.props.companyUser)
                        ? this.props.companyUser
                        : true,
                    userIds: this.props.selectedRowKeys,
                    authData
                };
                if (
                    isBoolean(this.props.companyUser) &&
                    !this.props.companyUser
                ) {
                    params.inviteIds = this.props.selectedRowKeys;
                    delete params.userIds;
                }
                console.log(params);
                this.setState({ loading: true });
                const result = await $http.post(urls.batchAddUserAuth, params);
                console.log(result);
                if (result) {
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0219
                        )
                    );
                    this.props.onClose();
                }
            } catch (e) {
                message.error(e.message);
            } finally {
                this.setState({ loading: false });
            }
        });
    };

    allSelect = () => {
        this.props.form.setFieldsValue({
            projectIds: this.state.projectList.map(item => item.projectId)
        });
        this.setState({
            selectProject: this.state.projectList
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        };
        const { appList = [] } = this.props;
        const {
            fetching,
            projectList,
            selectProject,
            selectRoleInfo,
            showProject,
            roleList = [],
            appId
        } = this.state;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div>
                <Form className="pLeft50">
                    <Form.Item
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0584)}
                        required
                        {...formItemLayout}
                    >
                        {getFieldDecorator('appId', {
                            initialValue: '',
                            rules: [
                                {
                                    required: true,
                                    message: this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0534
                                    )
                                }
                            ]
                        })(
                            <Select
                                style={{ width: 300, display: 'inline-block' }}
                                onChange={this.changeAppId}
                            >
                                {appList.map(item => (
                                    <Select.Option key={item.appId}>
                                        {item.appName}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
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
                                onChange={this.changeRoles}
                            >
                                {roleList
                                    .filter(item => item.isEdit)
                                    .map(item => (
                                        <Option
                                            value={item.id}
                                            key={item.id}
                                            dataRef={item}
                                        >
                                            {item.roleName}
                                        </Option>
                                    ))}
                            </Select>
                        )}
                    </Form.Item>
                    {appId && !includes(['09', '007', 'eCPT'], appId) && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0335
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('projectIds', {
                                initialValue: [],
                                rules: [
                                    {
                                        required: showProject,
                                        message: this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0485
                                        )
                                    }
                                ]
                            })(
                                <Select
                                    className="mBottom15"
                                    mode="multiple"
                                    allowClear
                                    placeholder={
                                        showProject
                                            ? formatMessage(
                                                  i18nMessages.ECONFIG_FRONT_A0193
                                              )
                                            : selectRoleInfo.nullProjectDefaultValue ===
                                              'NONE'
                                            ? formatMessage(
                                                  i18nMessages.ECONFIG_FRONT_A0303
                                              )
                                            : formatMessage(
                                                  i18nMessages.ECONFIG_FRONT_A0302
                                              )
                                    }
                                    disabled={!showProject}
                                    notFoundContent={
                                        fetching ? (
                                            <Spin size="small" />
                                        ) : (
                                            formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0170
                                            )
                                        )
                                    }
                                    onChange={this.projectChange}
                                    style={{ width: 300 }}
                                    filterOption={projectFilterOption}
                                    showSearch
                                    dropdownRender={menu => (
                                        <div>
                                            {menu}
                                            <Divider
                                                style={{ margin: '4px 0' }}
                                            />
                                            <a
                                                style={{
                                                    display: 'Block',
                                                    padding: '5px 12px'
                                                }}
                                                onMouseDown={e => {
                                                    e.preventDefault();
                                                }}
                                                onClick={this.allSelect}
                                            >
                                                {formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0195
                                                )}
                                            </a>
                                        </div>
                                    )}
                                >
                                    {projectList.length > 0
                                        ? projectList.map(project => (
                                              <Option
                                                  key={project.projectId}
                                                  {...project}
                                                  title={`【${project.projectSerialNo}】${project.projectName}`}
                                              >
                                                  {`【${project.projectSerialNo}】${project.projectName}`}
                                              </Option>
                                          ))
                                        : null}
                                </Select>
                            )}
                        </Form.Item>
                    )}

                    {selectProject.length > 0 && appId === '18' && (
                        <div>
                            <div className="mBottom10 Bold">
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0487
                                )}
                            </div>
                            {selectProject.map(item => (
                                <Row key={item.projectId}>
                                    <Col
                                        span={6}
                                        className="overflow_ellipsis Gray_9e"
                                        style={{ lineHeight: '36px' }}
                                        title={`【${item.projectSerialNo}】${item.projectName}`}
                                    >
                                        {`【${item.projectSerialNo}】${item.projectName}`}
                                    </Col>
                                    <Col span={12} offset={1}>
                                        <Form.Item>
                                            {getFieldDecorator(item.projectId, {
                                                initialValue: [],
                                                rules: [
                                                    {
                                                        required:
                                                            selectRoleInfo.needSite ===
                                                            1,
                                                        message: this.props.intl.formatMessage(
                                                            i18nMessages.ECONFIG_FRONT_A0487
                                                        )
                                                    }
                                                ]
                                            })(
                                                <SiteSelect
                                                    formatMessage={
                                                        formatMessage
                                                    }
                                                    selectRoleInfo={
                                                        this.state
                                                            .selectRoleInfo
                                                    }
                                                    projectId={item.projectId}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ))}
                        </div>
                    )}
                </Form>
                <div className="TxtCenter mTop24">
                    <Button
                        type="primary"
                        style={{ marginRight: 80 }}
                        loading={this.state.loading}
                        onClick={this.onSubmit}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0279)}
                    </Button>
                    <Button type="primary" onClick={this.props.onClose}>
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0281)}
                    </Button>
                </div>
            </div>
        );
    }
}

export default VolumeAuthModal;
