import React from 'react';
import { Button, Table, message, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import { find, includes, cloneDeep, forEach } from 'lodash';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import ProjectDrawer from '../drawers/projectDrawer';
import RoleDrawer from '../drawers/roleDrawer';
import RoleProjectSiteModal from '../modals/roleProjectSiteModal';
import SiteDrawer from '../drawers/siteDrawer';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import { SiteItem, SiteSpan } from 'src/component/authPage/styled';
import './modal.less';

const confirm = Modal.confirm;
const SiteBtn = styled.div`
    border: 1px solid #8bd4fd;
    background: #e5f7fe;
    color: #8c93fb;
    width: 88px;
    margin-top: 6.88px;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
`;

@injectIntl
class roleProjectSitePage extends React.PureComponent {
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
        storageList: [],
        roleList: [],
        loading: true,
        showRoleProjectSiteModal: false
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
            const projectList = await authServices.getProjectList(
                this.props.appId
            );
            const roleList = await authServices.getRoleList(this.props.appId);
            this.setState({
                projectList: projectList.list,
                roleList: roleList.map(item => ({
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
            this.props.changeList(this.props.appId, roleList, projectList.list);
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
                                                                item,
                                                                index
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
                } else if (
                    user &&
                    user.needProject === 0 &&
                    user.nullProjectDefaultValue === 'ALL'
                ) {
                    return (
                        <SiteItem>
                            <SiteSpan
                                className="InlineBlock flex overflow_ellipsis"
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0302
                                )}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0302
                                )}
                            </SiteSpan>
                        </SiteItem>
                    );
                } else if (
                    user &&
                    user.needProject === 0 &&
                    user.nullProjectDefaultValue === 'NONE'
                ) {
                    return (
                        <div className="Gray_9e mTop8">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0303
                            )}
                        </div>
                    );
                }
                return (
                    <SiteBtn
                        className={`InlineBlock mRight15 ${!this.props.edit &&
                            'DisabledBtn'}`}
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
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0164
            ),
            dataIndex: 'siteIds',
            render: (siteIds, record) => {
                const userId = record.roleIds[0];
                const user = find(
                    this.state.roleList,
                    roleItem => roleItem.id === userId
                );
                if (
                    user &&
                    user.needSite === 1 &&
                    siteIds &&
                    siteIds.length > 0
                ) {
                    return (
                        <div style={{ paddingTop: 32 }}>
                            {siteIds.map((item, index) => {
                                if (user && user.needSite === 1) {
                                    const sites = [];
                                    forEach(item, (value, key) => {
                                        if (key !== 'ALL' && key !== 'NONE') {
                                            sites.push({
                                                siteName: value,
                                                siteId: key
                                            });
                                        }
                                    });
                                    return (
                                        <div
                                            className="siteBox flexRow"
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            <SiteBtn
                                                className={`InlineBlock mRight15 ${!this
                                                    .props.edit &&
                                                    'DisabledBtn'}`}
                                                onClick={() => {
                                                    this.addSite(record, index);
                                                }}
                                                title={this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0164
                                                )}
                                            >
                                                {this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0164
                                                )}
                                            </SiteBtn>
                                            {sites.map(siteItem => (
                                                <SiteItem key={siteItem.siteId}>
                                                    <SiteSpan
                                                        title={
                                                            siteItem.siteName
                                                        }
                                                        className="InlineBlock flex overflow_ellipsis mRight5"
                                                    >
                                                        {siteItem.siteName}
                                                    </SiteSpan>
                                                    {this.props.edit && (
                                                        <Icon
                                                            className="TxtMiddle pointer"
                                                            type="close"
                                                            onClick={() => {
                                                                this.deleteSite(
                                                                    record,
                                                                    index,
                                                                    siteItem.siteId
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                </SiteItem>
                                            ))}
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    );
                } else if (
                    user &&
                    user.needSite === 0 &&
                    user.nullSiteDefaultValue === 'ALL'
                ) {
                    return (
                        <SiteItem className="Block">
                            <SiteSpan
                                className="InlineBlock flex overflow_ellipsis"
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0296
                                )}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0296
                                )}
                            </SiteSpan>
                        </SiteItem>
                    );
                } else if (
                    user &&
                    user.needSite === 0 &&
                    user.nullSiteDefaultValue === 'NONE'
                ) {
                    return (
                        <div className="Gray_9e LineHeight22 mTop7">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0197
                            )}
                        </div>
                    );
                }
                return (
                    <div className="Gray_9e mTop8">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0297
                        )}
                    </div>
                );
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
                _this.setState({ hideButton: true, selectedRowKeys: [] });
                _this.props.deleteDataItem(this.props.appId, selectRoleIds);
            },
            onCancel() {}
        });
    };

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        let hideButton = true;
        if (
            (selectedRowKeys.length === 1 &&
                find(
                    this.state.roleList,
                    roleItem => roleItem.id === selectedRowKeys[0].roleIds[0]
                ).needProject === 1) ||
            (selectedRowKeys.length > 0 &&
                selectedRowKeys.filter(item => {
                    const role = find(
                        this.state.roleList,
                        roleItem => roleItem.id === item.roleIds[0]
                    );
                    console.log(role);
                    if (
                        role.needProject === 1 &&
                        item.projectIds.length === 0
                    ) {
                        return true;
                    }
                    return false;
                }).length === selectedRowKeys.length)
        ) {
            hideButton = false;
        }

        this.setState({ selectedRowKeys, hideButton });
    };

    addProject = record => {
        const selectRole = record ? [record] : this.state.selectedRowKeys;
        const selectProjectIds = record
            ? record.projectIds
            : this.state.selectedRowKeys.length === 1
            ? this.state.selectedRowKeys[0].projectIds
            : [];
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
                    selectRole={selectRole}
                    addDataItem={projects => {
                        this.props.changeDataItem(this.props.appId)(projects);
                        this.setState({
                            selectedRowKeys: [],
                            hideButton: true
                        });
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
                    }}
                    roleList={this.state.roleList.filter(
                        item => !includes(selectedRole, item.id)
                    )}
                />
            )
        });
    };

    addSite = (project, index) => {
        if (this.props.edit) {
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0329
                ),
                width: 500,
                compontent: props => (
                    <SiteDrawer
                        {...props}
                        intl={this.props.intl}
                        appId={this.props.appId}
                        index={index}
                        project={project}
                        saveSite={this.props.changeDataItem(this.props.appId)}
                    />
                )
            });
        }
    };

    deleteProject = (project, projectId, index) => {
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
            newProject.siteIds = project.siteIds.filter(
                (item, siteIndex) => siteIndex !== index
            );
            this.props.changeDataItem(this.props.appId)([newProject]);
            this.setState({ selectedRowKeys: [], hideButton: true });
        }
    };

    deleteSite = (project, index, siteId) => {
        if (this.props.edit) {
            delete project.siteIds[index][siteId];
            this.props.changeDataItem(this.props.appId)([project]);
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

    speedAddData = (appId, projectLists) => {
        this.props.addDataItem(this.props.appId, projectLists);
        this.setState({ showRoleProjectSiteModal: false });
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
        const formatMessage = this.props.intl.formatMessage;
        return !loading ? (
            <div className="roleProjectSitePage">
                <div>
                    {this.props.authMode === 2 ? (
                        <Button
                            type="primary"
                            className="mBottom15 mRight15"
                            onClick={() => {
                                // this.showSpeedAddData();
                                this.setState({
                                    showRoleProjectSiteModal: true
                                });
                            }}
                            disabled={!this.props.edit}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0329
                            )}
                        </Button>
                    ) : (
                        [
                            <Button
                                key="addRole"
                                type="primary"
                                className="mBottom15 mRight15"
                                onClick={() => {
                                    this.addRole();
                                }}
                                disabled={!this.props.edit}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0293
                                )}
                            </Button>,
                            <Button
                                key="addProject"
                                type="primary"
                                className="mBottom15 mRight15"
                                onClick={() => this.addProject()}
                                disabled={
                                    !this.props.edit ||
                                    this.state.hideButton ||
                                    this.props.authInfoItem.length === 0
                                }
                            >
                                {formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0159
                                )}
                            </Button>
                        ]
                    )}
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
                {this.state.showRoleProjectSiteModal && (
                    <RoleProjectSiteModal
                        {...this.props}
                        onCancel={() => {
                            this.setState({ showRoleProjectSiteModal: false });
                        }}
                        visible={this.state.showRoleProjectSiteModal}
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
                        fromProjectManage={this.props.fromProjectManage}
                        selectProjectIds={selectProjectIds}
                        onOk={this.speedAddData}
                    />
                )}
            </div>
        ) : null;
    }
}

export default roleProjectSitePage;
