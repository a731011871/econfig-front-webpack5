import React from 'react';
import { Button, Table, message, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import { find, forEach } from 'lodash';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import ProjectDrawer from '../drawers/projectDrawer';
import RoleDrawer from '../drawers/roleDrawer';
import SiteDrawer from '../drawers/siteDrawer';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import ProjectRoleSiteModal from '../modals/projectRoleSiteModal';
import { SiteBtn, SiteItem, SiteSpan } from 'src/component/authPage/styled';

const confirm = Modal.confirm;

@injectIntl
class projectRoleSitePage extends React.PureComponent {
    static propTypes = {
        authInfoItem: PropTypes.array,
        systemList: PropTypes.array,
        changeDataItem: PropTypes.func,
        addDataItem: PropTypes.func,
        deleteDataItem: PropTypes.func,
        changeList: PropTypes.func,
        authMode: PropTypes.number, // 授权默示  1经典  2快捷
        edit: PropTypes.bool
    };

    state = {
        selectedRowKeys: [],
        hideButton: true,
        projectList: [],
        roleList: [],
        loading: true
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
                i18nMessages.ECONFIG_FRONT_A0161
            ),
            dataIndex: 'projectIds',
            width: 200,
            render: projectIds => {
                const project = find(
                    this.state.projectList,
                    item => item.id === projectIds[0]
                );
                return (
                    <a
                        className="Block Width170"
                        onClick={() => {
                            this.addRole(projectIds[0]);
                        }}
                    >
                        {project
                            ? project.projectSerialNo
                                ? `【${project.projectSerialNo}】${project.projectName}`
                                : project.projectName
                            : '-'}
                    </a>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0163
            ),
            dataIndex: 'roleIds',
            width: 150,
            render: roleIds => {
                if (roleIds && roleIds.length > 0) {
                    return (
                        <div className="Block Width120">
                            {roleIds.map((item, index) => {
                                const user = find(
                                    this.state.roleList,
                                    roleItem => roleItem.id === item
                                );
                                if (user) {
                                    return (
                                        <a
                                            key={item}
                                            className="mTop8 Block overflow_ellipsis"
                                            title={user.roleName}
                                            onClick={() => {
                                                this.showRoleAuth(item);
                                            }}
                                        >
                                            {user.roleName}
                                        </a>
                                    );
                                }
                                return (
                                    <div className="Gray_9e mTop8" key={index}>
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0292
                                        )}
                                    </div>
                                );
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
                i18nMessages.ECONFIG_FRONT_A0164
            ),
            dataIndex: 'siteIds',
            render: (siteIds, record) => {
                if (siteIds && siteIds.length > 0) {
                    return (
                        <div>
                            {siteIds.map((item, index) => {
                                const userId = record.roleIds[index];
                                const user = find(
                                    this.state.roleList,
                                    roleItem => roleItem.id === userId
                                );
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
                                }
                                return (
                                    <div
                                        key={index}
                                        className="Gray_9e LineHeight22 mTop7"
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0197
                                        )}
                                    </div>
                                );
                            })}
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
        const _this = this;
        const selectProjectIds = this.state.selectedRowKeys.map(
            item => item.projectIds[0]
        );
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
                _this.props.deleteDataItem(this.props.appId, selectProjectIds);
            },
            onCancel() {}
        });
    };

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        let hideButton = false;
        if (
            selectedRowKeys.filter(item => item.roleIds.length > 0).length >
                0 ||
            selectedRowKeys.length === 0
        ) {
            hideButton = true;
        }

        this.setState({ selectedRowKeys, hideButton });
    };

    addProject = () => {
        let selectProjectIds = [];
        this.props.authInfoItem.forEach(item => {
            selectProjectIds = selectProjectIds.concat(item.projectIds);
        });
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
                    addDataItem={this.props.addDataItem}
                    selectProjectIds={selectProjectIds}
                />
            )
        });
    };

    addRole = projectId => {
        if (this.props.edit) {
            const selectProjects = [];
            this.props.authInfoItem.forEach(item => {
                if (projectId) {
                    if (item.projectIds[0] === projectId) {
                        selectProjects.push(item);
                    }
                } else {
                    this.state.selectedRowKeys.forEach(selectItem => {
                        if (selectItem.projectIds[0] === item.projectIds[0]) {
                            selectProjects.push(item);
                        }
                    });
                }
            });
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
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        type={projectId ? 'edit' : 'new'}
                        selectProjects={selectProjects}
                        saveRole={project => {
                            this.props.changeDataItem(this.props.appId)(
                                project
                            );
                            this.setState({
                                selectedRowKeys: projectId
                                    ? this.state.selectedRowKeys
                                    : [],
                                hideButton: projectId
                                    ? this.state.hideButton
                                    : true
                            });
                        }}
                        roleList={this.state.roleList.filter(
                            item =>
                                item.needProject === 1 ||
                                (item.needProject === 0 &&
                                    item.nullProjectDefaultValue === 'ALL')
                        )}
                    />
                )
            });
        }
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

    deleteSite = (project, index, siteId) => {
        if (this.props.edit) {
            delete project.siteIds[index][siteId];
            this.props.changeDataItem(this.props.appId)([project]);
            this.setState({ selectedRowKeys: [], hideButton: true });
        }
    };

    speedAddData = (appId, projectLists) => {
        this.props.addDataItem(this.props.appId, projectLists);
        this.setState({ showProjectRoleSiteModal: false });
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
        let selectProjectIds = [];
        this.props.authInfoItem.forEach(item => {
            selectProjectIds = selectProjectIds.concat(item.projectIds);
        });
        return !loading ? (
            <div className="projectRoleSitePage">
                <div>
                    {this.props.authMode === 2 ? (
                        <Button
                            type="primary"
                            className="mBottom15"
                            onClick={() => {
                                this.setState({
                                    showProjectRoleSiteModal: true
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
                                type="primary"
                                key="addProject"
                                className="mBottom15"
                                onClick={this.addProject}
                                disabled={!this.props.edit}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0159
                                )}
                            </Button>,
                            <Button
                                type="primary"
                                key="addRole"
                                className="mBottom15 mLeft15"
                                disabled={
                                    !this.props.edit ||
                                    this.state.hideButton ||
                                    this.props.authInfoItem.length === 0
                                }
                                onClick={() => {
                                    this.addRole();
                                }}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0293
                                )}
                            </Button>
                        ]
                    )}
                    <Button
                        type="danger"
                        className="mBottom15 mLeft15"
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

                {this.state.showProjectRoleSiteModal && (
                    <ProjectRoleSiteModal
                        {...this.props}
                        onCancel={() => {
                            this.setState({ showProjectRoleSiteModal: false });
                        }}
                        visible={this.state.showProjectRoleSiteModal}
                        onOk={this.speedAddData}
                        fromProjectManage={this.props.fromProjectManage}
                        projectId={this.props.projectId}
                        authType={
                            find(
                                this.props.systemList,
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        addDataItem={this.props.addDataItem}
                        selectProjectIds={selectProjectIds}
                        roleList={this.state.roleList.filter(
                            item =>
                                item.needProject === 1 ||
                                (item.needProject === 0 &&
                                    item.nullProjectDefaultValue === 'ALL')
                        )}
                    />
                )}
            </div>
        ) : null;
    }
}

export default projectRoleSitePage;
