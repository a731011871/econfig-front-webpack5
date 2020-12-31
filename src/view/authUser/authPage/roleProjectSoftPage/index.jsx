import React from 'react';
import { Button, Table, message, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import { find, includes, cloneDeep } from 'lodash';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import ProjectDrawer from '../drawers/projectDrawer';
import SoftDrawer from '../drawers/softDrawer';
import RoleDrawer from '../drawers/roleDrawer';
import RoleProjectSoftModal from '../modals/roleProjectSoftModal';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import './modal.less';
import urls from 'src/utils/urls';
import { $http } from 'src/utils/http';
import { SiteItem, SiteSpan, SiteBtn } from 'src/component/authPage/styled';

const confirm = Modal.confirm;

@injectIntl
class roleProjectSoftPage extends React.PureComponent {
    static propTypes = {
        authInfoItem: PropTypes.array,
        systemList: PropTypes.array,
        changeDataItem: PropTypes.func,
        addDataItem: PropTypes.func,
        deleteDataItem: PropTypes.func,
        changeList: PropTypes.func,
        edit: PropTypes.bool,
        appId: PropTypes.string,
        authMode: PropTypes.number, // 授权默示  1经典  2快捷
        appName: PropTypes.string
    };

    state = {
        selectedRowKeys: [],
        hideButton: true,
        projectList: [],
        softList: [], // 系统列表
        validSoftList: [], // 未过期系统列表
        roleList: [],
        loading: true,
        showRoleProjectSoftModal: false,
        selectRoleInfo: {}
    };

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if (!nextProps.edit) {
            return {
                ...(nextProps.value || {}),
                selectedRowKeys: [],
                hideButton: true
            };
        }
        return null;
    }

    componentDidMount = async () => {
        try {
            let projectList = { data: [] };
            if (this.props.authInfoItem.length) {
                projectList = await authServices.getCspTenantProjects(
                    '',
                    this.props.authInfoItem[0].projectIds,
                    false
                );
            }
            const roleList = await $http.get(
                `${urls.cspAuthEconfigRoleList}?appId=${this.props.appId}`
            );
            if (this.props.appId === 'econfig') {
                roleList.data = roleList.data.filter(item =>
                    includes(
                        ['econfig_project_admin', 'econfig_soft_admin'],
                        item.id
                    )
                );
            }
            const allSoftList = await $http.get(urls.cspAllSoftList, {
                isIncludeExpired: true
            });
            this.setState({
                projectList: projectList.data,
                softList: allSoftList,
                validSoftList: this.props.systemList || [],
                roleList: roleList.data
                    .filter(item => item.id !== 'econfig_company_admin')
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
                    })),
                loading: false
            });
            this.props.changeList(
                this.props.appId,
                roleList.data,
                projectList.data
            );
        } catch (e) {
            message.error(e.message);
        }
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0163
            ),
            dataIndex: 'roleIds',
            width: 150,
            render: roleIds => {
                if (roleIds && roleIds.length > 0) {
                    return (
                        <div>
                            {roleIds.map(item => {
                                const user = find(
                                    this.state.roleList,
                                    roleItem => roleItem.id === item
                                );
                                return user ? (
                                    <a
                                        key={item}
                                        title={user.roleName}
                                        className="mTop8 Block overflow_ellipsis"
                                        onClick={() => {
                                            this.showRoleAuth(item);
                                        }}
                                    >
                                        {user.roleName}
                                    </a>
                                ) : null;
                            })}
                        </div>
                    );
                }
                return (
                    <div className="Gray_9e mTop8">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0292
                        )}
                    </div>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0335
            ),
            dataIndex: 'projectIds',
            render: (projectIds, record) => {
                const user = find(
                    this.state.roleList,
                    roleItem => roleItem.id === record.roleIds[0]
                );
                if (
                    user &&
                    user.needProject === 1 &&
                    projectIds &&
                    projectIds.filter(item => item !== 'ALL' && item !== 'NONE')
                        .length > 0
                ) {
                    return (
                        <div style={{ minWidth: 210 }}>
                            <SiteBtn
                                className={`InlineBlock mRight15 ${!this.props
                                    .edit && 'DisabledBtn'}`}
                                onClick={() => this.addProject(record)}
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0159
                                )}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0159
                                )}
                            </SiteBtn>
                            {projectIds
                                .filter(
                                    item => item !== 'ALL' && item !== 'NONE'
                                )
                                .map((item, index) => {
                                    const project = find(
                                        this.state.projectList,
                                        projectItem => projectItem.id === item
                                    );
                                    return project ? (
                                        <div className="Block" key={index}>
                                            <SiteItem
                                                key={project.id}
                                                className="wMax350"
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                <SiteSpan
                                                    className="InlineBlock flex overflow_ellipsis mRight5 vMax20em"
                                                    title={`【${project.projectSerialNo}】${project.projectName}`}
                                                >
                                                    {`【${project.projectSerialNo}】${project.projectName}`}
                                                </SiteSpan>
                                                {this.props.edit && (
                                                    <Icon
                                                        className="TxtMiddle pointer"
                                                        type="close"
                                                        onClick={() => {
                                                            this.deleteProject(
                                                                record,
                                                                item
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </SiteItem>
                                        </div>
                                    ) : null;
                                })}
                        </div>
                    );
                } else if (user && user.id === 'econfig_project_admin') {
                    return (
                        <SiteBtn
                            className={`InlineBlock mRight15 ${!this.props
                                .edit && 'DisabledBtn'}`}
                            onClick={() => this.addProject(record)}
                            title={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0159
                            )}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0159
                            )}
                        </SiteBtn>
                    );
                }
                return null;
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0257
            ),
            dataIndex: 'softIds',
            render: (softIds, record) => {
                const user = find(
                    this.state.roleList,
                    roleItem => roleItem.id === record.roleIds[0]
                );
                if (softIds && softIds.length > 0) {
                    return (
                        <div style={{ minWidth: 210 }}>
                            <SiteBtn
                                className={`InlineBlock mRight15 ${!this.props
                                    .edit && 'DisabledBtn'}`}
                                onClick={() => this.addSoft(record)}
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0514
                                )}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0514
                                )}
                            </SiteBtn>
                            {softIds.map((item, index) => {
                                const soft = find(
                                    this.state.softList,
                                    softItem => softItem.appId === item
                                );
                                return soft ? (
                                    <div className="Block" key={index}>
                                        <SiteItem
                                            key={soft.appId}
                                            className="wMax350"
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            <SiteSpan
                                                title={soft.appName}
                                                className="InlineBlock flex overflow_ellipsis mRight5 vMax20em"
                                            >
                                                {soft.appName}
                                            </SiteSpan>
                                            {this.props.edit && (
                                                <Icon
                                                    className="TxtMiddle pointer"
                                                    type="close"
                                                    onClick={() => {
                                                        this.deleteSoft(
                                                            record,
                                                            item
                                                        );
                                                    }}
                                                />
                                            )}
                                        </SiteItem>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    );
                } else if (user && user.id === 'econfig_soft_admin') {
                    return (
                        <SiteBtn
                            className={`InlineBlock mRight15 ${!this.props
                                .edit && 'DisabledBtn'}`}
                            onClick={() => this.addSoft(record)}
                            title={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0514
                            )}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0514
                            )}
                        </SiteBtn>
                    );
                }
                return null;
            }
        }
    ];

    showConfirm = () => {
        const selectRoleIds = this.state.selectedRowKeys.map(
            item => item.roleIds[0]
        );
        const _this = this;
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0228
            ),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: () => {
                _this.setState({
                    hideButton: true,
                    selectedRowKeys: [],
                    selectRoleInfo: {}
                });
                _this.props.deleteDataItem(this.props.appId, selectRoleIds);
            },
            onCancel() {}
        });
    };

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        let hideButton = true;
        let role = {};
        if (selectedRowKeys.length === 1) {
            hideButton = false;
            role = find(
                this.state.roleList,
                roleItem => roleItem.id === selectedRowKeys[0].roleIds[0]
            );
        }
        this.setState({ selectedRowKeys, hideButton, selectRoleInfo: role });
    };

    addProject = record => {
        const selectProjectIds = this.props.authInfoItem[0].projectIds;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0329
            ),
            width: 500,
            antdConfig: { maskClosable: false },
            compontent: props => (
                <ProjectDrawer
                    {...props}
                    fromProjectManage={this.props.fromProjectManage}
                    projectId={this.props.projectId}
                    authType={
                        find(
                            this.props.systemList,
                            systemItem => systemItem.appId === this.props.appId
                        ).authType
                    }
                    intl={this.props.intl}
                    appId={this.props.appId}
                    selectRole={[record]}
                    addDataItem={async projects => {
                        try {
                            const projectList = await authServices.getTenantProjects(
                                projects[0].projectIds
                            );
                            this.setState({
                                projectList: projectList.list,
                                selectedRowKeys: [],
                                hideButton: true
                            });
                            this.props.changeDataItem(this.props.appId)(
                                projects
                            );
                        } catch (e) {
                            message(e.message);
                        }
                    }}
                    selectProjectIds={selectProjectIds}
                />
            )
        });
    };

    addRole = () => {
        const selectedRole = this.props.authInfoItem.map(
            item => item.roleIds[0]
        );
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0293
            ),
            width: 500,
            compontent: props => (
                <RoleDrawer
                    {...props}
                    authType={
                        find(
                            this.props.systemList,
                            systemItem => systemItem.appId === this.props.appId
                        ).authType
                    }
                    intl={this.props.intl}
                    appId={this.props.appId}
                    type="new"
                    saveRole={(appId, projectLists) => {
                        this.props.addDataItem(this.props.appId, projectLists);
                        this.setState({ selectedRowKeys: [] });
                    }}
                    roleList={this.state.roleList.filter(
                        item => !includes(selectedRole, item.id)
                    )}
                />
            )
        });
    };

    addSoft = () => {
        const selectSoftIds = this.props.authInfoItem[0].softIds;
        const validSoftList = this.state.validSoftList.filter(
            item => !includes(selectSoftIds, item.appId)
        );
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0329
            ),
            width: 500,
            compontent: props => (
                <SoftDrawer
                    {...props}
                    intl={this.props.intl}
                    softList={validSoftList.filter(
                        item => item.appId !== 'econfig'
                    )}
                    appId={this.props.appId}
                    selectRole={this.state.selectedRowKeys[0]}
                    addDataItem={projects => {
                        this.props.changeDataItem(this.props.appId)(projects);
                        this.setState({ selectedRowKeys: [] });
                    }}
                    selectSoftIds={selectSoftIds}
                />
            )
        });
    };

    deleteProject = (project, projectId) => {
        // const selectRows = this.props.selectRole.projectIds.map((projectItem, index) => ({
        //     projectId: projectItem,
        //     siteId: this.props.selectRole.siteIds[index]
        // }));
        // this.state.selectProject.forEach(projectItem => {
        //     selectRows.forEach(selectItem => {
        //         if (selectItem.projectId === projectItem.projectId) {
        //             selectItem.siteIds = projectItem.siteIds;
        //         } else {
        //             selectItem.siteIds = [];
        //         }
        //     });
        // });
        if (this.props.edit) {
            const newProject = cloneDeep(project);
            newProject.projectIds = project.projectIds.filter(
                item => item !== projectId
            );
            this.props.changeDataItem(this.props.appId)([newProject]);
            this.setState({ selectedRowKeys: [], hideButton: true });
        }
    };

    deleteSoft = (record, appId) => {
        // const selectRows = this.props.selectRole.projectIds.map((projectItem, index) => ({
        //     projectId: projectItem,
        //     siteId: this.props.selectRole.siteIds[index]
        // }));
        // this.state.selectProject.forEach(projectItem => {
        //     selectRows.forEach(selectItem => {
        //         if (selectItem.projectId === projectItem.projectId) {
        //             selectItem.siteIds = projectItem.siteIds;
        //         } else {
        //             selectItem.siteIds = [];
        //         }
        //     });
        // });
        if (this.props.edit) {
            const newProject = cloneDeep(record);
            newProject.softIds = record.softIds.filter(item => item !== appId);
            this.props.changeDataItem(this.props.appId)([newProject]);
            this.setState({ selectedRowKeys: [], hideButton: true });
        }
    };

    showRoleAuth = userId => {
        const user = find(
            this.state.roleList,
            roleItem => roleItem.id === userId
        );
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0134
            ),
            width: 900,
            compontent: props => (
                <RoleAuthDrawer
                    {...props}
                    systemList={this.props.systemList}
                    isBuiltin={user.isBuiltin === '1'}
                    intl={this.props.intl}
                    roleInfo={user}
                />
            )
        });
    };

    speedAddData = async (appId, projectLists) => {
        try {
            this.setState({ showRoleProjectSoftModal: false });
            let projectList = { data: [] };
            if (
                projectLists[0].projectIds &&
                projectLists[0].projectIds.length > 0
            ) {
                projectList = await authServices.getCspTenantProjects(
                    '',
                    projectLists[0].projectIds,
                    false
                );
            }
            this.setState({
                projectList: projectList.data,
                selectedRowKeys: [],
                hideButton: true
            });
            this.props.changeDataItem(this.props.appId)(projectLists);
            this.props.addDataItem(this.props.appId, projectLists);
        } catch (e) {
            message(e.message);
        }
    };

    render() {
        const { selectedRowKeys, loading } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: () => ({
                disabled: !this.props.edit
            })
        };
        const selectProjectIds = [];
        const selectedRole = this.props.authInfoItem.map(
            item => item.roleIds[0]
        );
        // if (this.state.selectedRowKeys.length === 1) {
        //     selectProjectIds = this.state.selectedRowKeys[0].projectIds;
        // }
        return !loading ? (
            <div className="roleProjectSitePage">
                <div>
                    {this.props.authMode === 2 && (
                        <Button
                            type="primary"
                            className="mBottom15 mRight15"
                            onClick={() => {
                                // this.showSpeedAddData();
                                this.setState({
                                    showRoleProjectSoftModal: true
                                });
                            }}
                            disabled={
                                !this.props.edit ||
                                this.props.authInfoItem.length === 1
                            }
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0329
                            )}
                        </Button>
                    )}{' '}
                    {this.props.authMode === 1 && (
                        <Button
                            key="addRole"
                            type="primary"
                            className="mBottom15 mRight15"
                            onClick={() => {
                                this.addRole();
                            }}
                            disabled={
                                !this.props.edit ||
                                this.props.authInfoItem.length === 1
                            }
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0293
                            )}
                        </Button>
                    )}
                    {/*{selectRoleInfo.id && selectedRowKeys.length === 1 && (*/}
                    {/*<Button*/}
                    {/*key="addProject"*/}
                    {/*type="primary"*/}
                    {/*className="mBottom15 mRight15"*/}
                    {/*onClick={*/}
                    {/*selectRoleInfo.id === 'econfig_project_admin'*/}
                    {/*? this.addProject*/}
                    {/*: this.addSoft*/}
                    {/*}*/}
                    {/*disabled={*/}
                    {/*!this.props.edit ||*/}
                    {/*this.state.hideButton ||*/}
                    {/*this.props.authInfoItem.length === 0*/}
                    {/*}*/}
                    {/*>*/}
                    {/*{selectRoleInfo.id === 'econfig_project_admin'*/}
                    {/*? formatMessage(*/}
                    {/*i18nMessages.ECONFIG_FRONT_A0159*/}
                    {/*)*/}
                    {/*: formatMessage(*/}
                    {/*i18nMessages.ECONFIG_FRONT_A0514*/}
                    {/*)}*/}
                    {/*</Button>*/}
                    {/*)}*/}
                    <Button
                        type="danger"
                        className="mBottom15"
                        disabled={
                            !this.props.edit ||
                            this.state.selectedRowKeys.length === 0 ||
                            this.props.authInfoItem.length === 0
                        }
                        onClick={this.showConfirm}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0145
                        )}
                    </Button>
                </div>
                {!this.state.loading && (
                    <Table
                        rowKey={record => record}
                        rowSelection={rowSelection}
                        dataSource={this.props.authInfoItem}
                        columns={this.columns}
                        pagination={false}
                        scroll={{ x: true }}
                    />
                )}
                {this.state.showRoleProjectSoftModal && (
                    <RoleProjectSoftModal
                        {...this.props}
                        onCancel={() => {
                            this.setState({ showRoleProjectSoftModal: false });
                        }}
                        visible={this.state.showRoleProjectSoftModal}
                        roleList={this.state.roleList.filter(
                            item => !includes(selectedRole, item.id)
                        )}
                        authType={
                            find(
                                this.props.systemList,
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        projectId={this.props.projectId}
                        softList={this.state.validSoftList.filter(
                            item => item.appId !== 'econfig'
                        )}
                        fromProjectManage={this.props.fromProjectManage}
                        selectProjectIds={selectProjectIds}
                        onOk={this.speedAddData}
                    />
                )}
            </div>
        ) : null;
    }
}

export default roleProjectSoftPage;
