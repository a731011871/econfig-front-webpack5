import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Select, message, Spin, Divider } from 'antd';
import { i18nMessages } from 'src/i18n';
import { $http } from 'utils/http';
import { isEdcFrontRole, projectFilterOption } from 'utils/functions';
import urls, { parseApiUrl } from 'utils/urls';
import { includes, debounce, uniqBy } from 'lodash';
import Collect5AuthTable from './eCollect5AuthTable';
import { authServices } from '../../../../service/authService';

const Option = Select.Option;

@Form.create()
class eCollect5Modal extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        authType: PropTypes.string,
        intl: PropTypes.object,
        appId: PropTypes.string,
        appName: PropTypes.string,
        userName: PropTypes.string,
        projectId: PropTypes.string,
        envList: PropTypes.array,
        allRole: PropTypes.array, // 所有角色
        applicationRoleTypes: PropTypes.array, // 系统类型数组
        fromProjectManage: PropTypes.bool,
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
        authInfoItem: PropTypes.array // edc所有授权数据
    };

    constructor(props) {
        super(props);
        this.state = {
            projectList: [],
            backProjectList: [],
            fetching: false,
            selectProject: [],
            selectRole: [],
            siteList: [],
            roleList: props.allRole,
            envList: props.envList.filter(item => !item.projectId),

            // 后端系统参数
            projectRequired: true, // 后端系统项目是否必填，是否禁用  true：必填  禁用，  false： 非必填，启用
            edcAppType: '',
            selectRoleInfo: {}
        };
        this.balanceAuthTable = React.createRef();
    }

    componentDidMount() {
        // this.fetchProject();
    }

    searchProject = debounce(value => this.fetchProject(value || ''), 500);

    fetchProject = async edcAppType => {
        this.setState({ projectList: [], fetching: true });
        let filterProjectIds = this.state.selectProject.map(
            item => item.projectId
        );
        const { allRole } = this.props;
        let roleList = allRole.filter(item => item.roleType === edcAppType);
        /**
         * 先取当前授权数据中roleType和edcAppType相同的授权用来做项目或者角色的筛选
         * commonRoleTypeAuthData 当前选择的系统类型的已存在的授权
         * filterProjectIds 不可以选择的项目（已经被选过）
         * 如果是后端类型角色，要把已选过的角色和项目筛选掉
         * 如果是前端类型角色，把选择过的项目筛选掉
         * */
        const commonRoleTypeAuthData = this.props.authInfoItem.filter(
            item => item.roleType === edcAppType
        );
        if (isEdcFrontRole(edcAppType)) {
            filterProjectIds = filterProjectIds.concat(
                commonRoleTypeAuthData.map(item => item.projectIds[0])
            );
        } else {
            roleList = roleList.filter(
                item =>
                    !includes(
                        commonRoleTypeAuthData.map(item => item.roleIds[0]),
                        item.id
                    )
            );
            filterProjectIds = filterProjectIds.concat(
                ...commonRoleTypeAuthData.map(item => item.projectIds)
            );
        }

        try {
            let result = [];
            if (this.props.fromProjectManage) {
                const projectInfo = await $http.get(
                    parseApiUrl(urls.projectDetailInfo, {
                        id: this.props.projectId,
                        appId: this.props.appId
                    })
                );
                result = [projectInfo];
                /**
                 * 从项目管理中选择某一个项目进入授权页面，需要根据此项目的roleVos重新设置所有角色列表(适用于此项目的角色)
                 * 如果项目没有适用角色，取角色列表中没选projectIds的，且roleType=edcAppType（当前选择的角色类型）
                 * */
                if (projectInfo.roleVos) {
                    roleList = projectInfo.roleVos
                        .filter(item => item.roleType === this.state.edcAppType)
                        .map(item => ({
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
                } else {
                    roleList = roleList.filter(
                        item => !item.projectIds || !item.projectIds.length
                    );
                }
            } else {
                result = await $http.get(urls.getProjectRefRole, {
                    appId: this.props.appId
                });
                // result = await $http.post(urls.projectList, params);
            }
            const projectList = result
                .filter(item => !includes(filterProjectIds, item.id))
                .map(project => ({
                    projectName: project.projectName,
                    projectId: project.id,
                    roleVos: project.roleVos
                        ? project.roleVos.map(roleItem => ({
                              ...roleItem,
                              roleName: `${roleItem.roleName}${
                                  roleItem.blindState === 0
                                      ? this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0624
                                        )
                                      : roleItem.blindState === 1
                                      ? this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0623
                                        )
                                      : ''
                              }`
                          }))
                        : null,
                    programCode: project.programCode,
                    projectSerialNo: project.projectSerialNo
                }));
            this.setState(
                {
                    projectList,
                    backProjectList: projectList, // 因为后端系统更改角色涉及到项目筛选，所以后端系统项目列表单独处理
                    fetching: false,
                    roleList,
                    selectProject: this.props.fromProjectManage
                        ? projectList
                        : []
                },
                () => {
                    if (this.props.fromProjectManage) {
                        this.props.form.setFieldsValue({
                            projectIds: projectList[0]
                                ? [projectList[0]?.projectId]
                                : [],
                            projectId: projectList[0]?.projectId
                        });
                        if (
                            isEdcFrontRole(edcAppType) &&
                            projectList[0]?.projectId
                        ) {
                            this.projectChange(projectList[0]?.projectId);
                        }
                    }
                }
            );
        } catch (e) {
            message.error(e.message);
        }
    };

    projectChange = async value => {
        try {
            const selectProject = this.state.projectList.filter(
                item => item.projectId === value
            );
            const siteList = await authServices.getAssignedSiteList(value, '');
            /**
             * 角色管理中，对角色增加了适用项目功能，所以选择项目以后添加环境/角色，需要根据角色的适用项目进行角色筛选
             * 可选角色：取该项目的roleVos字段
             * 筛选出可用角色以后再把常规角色和app角色分为两个列表
             * */
            let roleList = this.props.allRole.filter(
                item => item.roleType === this.state.edcAppType
            );
            if (selectProject[0].roleVos) {
                roleList = selectProject[0].roleVos.filter(
                    item => item.roleType === this.state.edcAppType
                );
            } else {
                roleList = roleList.filter(
                    item => !item.projectIds || !item.projectIds.length
                );
            }
            this.setState({
                siteList: siteList.data.map(item => {
                    return {
                        label: `${
                            item.secondaryCode ? `[${item.secondaryCode}]` : ''
                        }${item.aliasName || '-'}${
                            item.professionName
                                ? `(${item.professionName})`
                                : ''
                        }`,
                        value: item.siteId || ''
                    };
                }),
                roleList,
                selectProject,
                envList: this.props.envList.filter(
                    item =>
                        !item.projectId ||
                        item.projectId === selectProject[0].projectId
                )
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    changeTableData = data => {
        console.log(data);
    };

    changeAppType = edcAppType => {
        this.setState(
            {
                edcAppType,
                selectProject: [],
                selectRoleInfo: {},
                projectList: [],
                backProjectList: [],
                projectRequired: true
            },
            () => this.fetchProject(edcAppType)
        );
        this.props.form.setFieldsValue({
            projectId: '',
            roleId: '',
            projectIds: []
        });
    };

    // 更改后端系统的角色
    changeBackRoles = (value, option) => {
        const roleInfo = option.props.dataRef;
        if (roleInfo.needProject === 0) {
            this.setState(
                {
                    projectRequired: false,
                    selectRoleInfo: roleInfo,
                    selectProject: []
                },
                () => {
                    this.props.form.setFieldsValue({
                        projectIds: []
                    });
                }
            );
        } else {
            /**
             * 后端系统选择角色以后需要根据角色的适用项目筛选可选项目
             * */
            let projectList = this.state.projectList;
            if (roleInfo.projectIds) {
                projectList = projectList.filter(item =>
                    includes(roleInfo.projectIds, item.projectId)
                );
            }
            this.setState(
                {
                    projectRequired: true,
                    selectRoleInfo: roleInfo,
                    backProjectList: projectList,
                    selectProject: this.props.fromProjectManage
                        ? projectList
                        : [] // 如果是从项目进入授权，更改角色时候默认选中该项目
                },
                () => {
                    // 如果是从项目进入授权，更改角色时候默认选中该项目，设置projectIds
                    // 如果是普通授权，且选的角色有适用项目，重置projectIds
                    if (this.props.fromProjectManage && projectList[0]) {
                        this.props.form.setFieldsValue({
                            projectIds: [projectList[0].projectId]
                        });
                    } else if (roleInfo.projectIds) {
                        this.props.form.setFieldsValue({ projectIds: [] });
                    }
                }
            );
        }
    };

    frontProjectChange = values => {
        const projectList = this.state.selectProject
            .concat(this.state.backProjectList)
            .filter(item => includes(values, item.projectId));
        const selectProject = uniqBy(projectList, 'projectId');
        this.setState({
            selectProject
        });
    };

    allSelect = () => {
        this.props.form.setFieldsValue({
            projectIds: this.state.backProjectList.map(item => item.projectId)
        });
        this.setState({
            selectProject: this.state.backProjectList
        });
    };

    onOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            /**
             * 根据选择的角色类型（前端系统/后端系统）进行不同的添加操作
             * */
            if (isEdcFrontRole(values.edcAppType)) {
                const authData = this.balanceAuthTable.current.getData();
                this.props.onOk(this.props.appId, authData);
            } else {
                this.props.onOk(this.props.appId, {
                    roleType: values.edcAppType,
                    roleIds: [values.roleId],
                    projectIds: values.projectIds
                });
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { applicationRoleTypes } = this.props;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        };
        const {
            fetching,
            projectList,
            backProjectList,
            selectProject,
            projectRequired,
            edcAppType,
            selectRoleInfo
        } = this.state;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <Modal
                className="roleProjectSiteModal"
                title={this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0311
                )}
                width={1200}
                onOk={this.onOk}
                onCancel={this.props.onCancel}
                visible={this.props.visible}
            >
                <Form className="pLeft50">
                    <Form.Item
                        label={formatMessage(i18nMessages.ECONFIG_FRONT_A0539)}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('edcAppType', {
                            rules: [
                                {
                                    required: true,
                                    message: formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0540
                                    )
                                }
                            ]
                        })(
                            <Select
                                className="mBottom15"
                                placeholder={formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0541
                                )}
                                onChange={this.changeAppType}
                                style={{ width: 300 }}
                            >
                                {applicationRoleTypes.map(item => (
                                    <Option key={item.roleTypeCode}>
                                        {item.roleTypeName}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    {edcAppType && isEdcFrontRole(edcAppType) && (
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0335
                            )}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('projectId', {
                                rules: [
                                    {
                                        required: true,
                                        message: this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0485
                                        )
                                    }
                                ]
                            })(
                                <Select
                                    className="mBottom15"
                                    // labelInValue
                                    placeholder={formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0193
                                    )}
                                    notFoundContent={
                                        fetching ? (
                                            <Spin size="small" />
                                        ) : (
                                            formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0170
                                            )
                                        )
                                    }
                                    filterOption={projectFilterOption}
                                    optionFilterProp="children"
                                    showSearch
                                    onChange={this.projectChange}
                                    style={{ width: 300 }}
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
                    {edcAppType &&
                        isEdcFrontRole(edcAppType) &&
                        selectProject.length > 0 && (
                            <Collect5AuthTable
                                selectProjectId={selectProject[0].projectId}
                                ref={this.balanceAuthTable}
                                roleList={this.state.roleList}
                                allRole={this.props.allRole}
                                envList={this.state.envList}
                                siteList={this.state.siteList}
                                intl={this.props.intl}
                                onChangeData={this.changeTableData}
                                edcAppType={edcAppType}
                            />
                        )}

                    {edcAppType && !isEdcFrontRole(edcAppType) && (
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
                                    onChange={this.changeBackRoles}
                                >
                                    {this.state.roleList
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
                    )}
                    {edcAppType && !isEdcFrontRole(edcAppType) && (
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
                                        required: projectRequired,
                                        message: this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0485
                                        )
                                    }
                                ]
                            })(
                                <Select
                                    className="mBottom15"
                                    mode="multiple"
                                    // labelInValue
                                    placeholder={
                                        projectRequired
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
                                    disabled={!projectRequired}
                                    notFoundContent={
                                        fetching ? (
                                            <Spin size="small" />
                                        ) : (
                                            formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0170
                                            )
                                        )
                                    }
                                    showSearch
                                    onChange={this.frontProjectChange}
                                    style={{ width: 300 }}
                                    filterOption={projectFilterOption}
                                    allowClear
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
                                    {backProjectList.map(project => (
                                        <Option
                                            key={project.projectId}
                                            {...project}
                                            title={`【${project.projectSerialNo}】${project.projectName}`}
                                        >
                                            {`【${project.projectSerialNo}】${project.projectName}`}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        );
    }
}

export default eCollect5Modal;
