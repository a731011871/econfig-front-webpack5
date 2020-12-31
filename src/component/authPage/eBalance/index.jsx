import React from 'react';
import { Button, Table, message, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import { find, forEach, intersectionBy, includes } from 'lodash';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import ProjectDrawer from '../drawers/projectDrawer';
import EnvRoleDrawer from './envRoleDrawer';
import SiteDrawer from '../drawers/siteDrawer';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import StorageDrawer from './supplyStorageDrawer';
import BlanceModal from '../modals/eBalanceModal';
import urls from 'src/utils/urls';
import { $http } from 'src/utils/http';
import { SiteBtn, SiteItem, SiteSpan } from 'src/component/authPage/styled';

const confirm = Modal.confirm;

@injectIntl
class eBalance extends React.PureComponent {
    static propTypes = {
        authInfoItem: PropTypes.array,
        systemList: PropTypes.array,
        changeDataItem: PropTypes.func,
        addDataItem: PropTypes.func,
        deleteDataItem: PropTypes.func,
        changeRoleList: PropTypes.func,
        edit: PropTypes.bool
    };

    state = {
        selectedRowKeys: [],
        hideButton: true,
        projectList: [],
        envList: [],
        roleList: [],
        storageList: [],
        showBalanceModal: false
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
            // const projectList = await authServices.getProjectList(
            //     this.props.appId
            // );
            const projectList = await $http.get(urls.getProjectRefRole, {
                appId: this.props.appId
            });
            const storageList = await authServices.getStorageList();
            const envList = await authServices.getEnvList(this.props.appId);
            const roleResult = await authServices.getRoleList(this.props.appId);
            const roleList = roleResult.map(item => ({
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
            this.setState({
                projectList: projectList
                    .map(item => ({
                        ...item,
                        roleVos: item.roleVos
                            ? item.roleVos.map(roleItem => ({
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
                            : null
                    }))
                    .concat({
                        id: 'ALL',
                        projectName: 'All Projects',
                        roleVos: roleList.filter(
                            item => !item.projectIds || !item.projectIds.length
                        )
                    }),
                envList: envList.rows.concat({
                    id: 'ALL',
                    name: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0627
                    ),
                    status: '1'
                }),
                //     .concat({
                //     id: '建库环境',
                //     name: '建库环境',
                //     status: '1'
                // }),
                roleList,
                storageList
            });
            this.props.changeList(
                this.props.appId,
                roleList,
                projectList.concat({
                    id: 'ALL',
                    projectName: 'All Projects'
                })
            );
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
                            this.addEnv(projectIds[0]);
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
                i18nMessages.ECONFIG_FRONT_A0162
            ),
            dataIndex: 'envIds',
            width: 130,
            render: envIds => {
                if (envIds && envIds.length > 0) {
                    return (
                        <div className="Block Width100">
                            {envIds.map(item => {
                                const envId = item ? item : '建库环境';
                                const env = find(
                                    this.state.envList,
                                    envItem => envItem.id === envId
                                );
                                return (
                                    <div
                                        key={item}
                                        className="mTop8 overflow_ellipsis Block"
                                        style={{ maxWidth: '6em' }}
                                        title={env ? env.name : ''}
                                    >
                                        {env
                                            ? env.name
                                            : this.props.intl.formatMessage(
                                                  i18nMessages.ECONFIG_FRONT_A0298
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
                            i18nMessages.ECONFIG_FRONT_A0298
                        )}
                    </div>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0163
            ),
            dataIndex: 'roleIds',
            width: 150,
            render: (roleIds, record) => {
                if (roleIds && roleIds.length > 0) {
                    return (
                        <div className="Block Width120">
                            {roleIds.map((item, index) => {
                                const user = find(
                                    this.state.roleList,
                                    roleItem => roleItem.id === item
                                );
                                const env = record.envIds[index];
                                if (user) {
                                    return (
                                        <a
                                            key={`${env}-${item}`}
                                            title={user.roleName}
                                            className="mTop8 Block overflow_ellipsis"
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
            width: 500,
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
                                if (
                                    user &&
                                    user.needSite === 1 &&
                                    record.projectIds[0] !== 'ALL'
                                ) {
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
                                    !user &&
                                    record.projectIds[0] !== 'ALL'
                                ) {
                                    return (
                                        <div
                                            key={index}
                                            className="Gray_9e LineHeight22 mTop7"
                                        >
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0297
                                            )}
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
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0358
            ),
            dataIndex: 'storageMap',
            render: (storageMap, record) => {
                if (storageMap && storageMap.length > 0) {
                    return (
                        <div>
                            {storageMap.map((item, index) => {
                                const userId = record.roleIds[index];
                                const user = find(
                                    this.state.roleList,
                                    roleItem => roleItem.id === userId
                                );
                                if (
                                    user &&
                                    user.needStoreroom === 1 &&
                                    record.projectIds[0] !== 'ALL'
                                ) {
                                    const storerooms = [];
                                    forEach(item, (value, key) => {
                                        if (key !== 'ALL' && key !== 'NONE') {
                                            storerooms.push({
                                                storeroomName: value,
                                                storeroomId: key
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
                                                    this.addStorage(
                                                        record,
                                                        index
                                                    );
                                                }}
                                                title={this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0358
                                                )}
                                            >
                                                {this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0358
                                                )}
                                            </SiteBtn>
                                            {storerooms.map(storeroomItem => (
                                                <SiteItem
                                                    key={
                                                        storeroomItem.storeroomId
                                                    }
                                                >
                                                    <SiteSpan
                                                        title={
                                                            storeroomItem.storeroomName
                                                        }
                                                        className="InlineBlock flex overflow_ellipsis mRight5"
                                                    >
                                                        {
                                                            storeroomItem.storeroomName
                                                        }
                                                    </SiteSpan>
                                                    {this.props.edit && (
                                                        <Icon
                                                            className="TxtMiddle pointer"
                                                            type="close"
                                                            onClick={() => {
                                                                this.deleteStorage(
                                                                    record,
                                                                    index,
                                                                    storeroomItem.storeroomId
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                </SiteItem>
                                            ))}
                                        </div>
                                    );
                                } else if (
                                    !user &&
                                    record.projectIds[0] !== 'ALL'
                                ) {
                                    return (
                                        <div
                                            key={index}
                                            className="Gray_9e LineHeight22 mTop7"
                                        >
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0358
                                            )}
                                        </div>
                                    );
                                } else if (
                                    user &&
                                    user.needStoreroom === 0 &&
                                    user.nullStoreroomDefaultValue === 'ALL'
                                ) {
                                    return (
                                        <SiteItem className="Block">
                                            <SiteSpan
                                                className="InlineBlock flex overflow_ellipsis"
                                                title={this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0342
                                                )}
                                            >
                                                {this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0342
                                                )}
                                            </SiteSpan>
                                        </SiteItem>
                                    );
                                }
                                return (
                                    <div
                                        key={index}
                                        className="Gray_9e LineHeight22 mTop7 Width120"
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0196
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
                            i18nMessages.ECONFIG_FRONT_A0358
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
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            content: '',
            onOk: () => {
                _this.setState({ hideButton: true, selectedRowKeys: [] });
                _this.props.deleteDataItem(this.props.appId, selectProjectIds);
            },
            onCancel() {}
        });
    };

    onSelectChange = selectedRowKeys => {
        let hideButton = false;
        if (
            selectedRowKeys.filter(item => item.envIds.length > 0).length > 0 ||
            selectedRowKeys.length === 0 ||
            (selectedRowKeys.length > 1 &&
                selectedRowKeys.filter(item => item.projectIds[0] === 'ALL')
                    .length > 0)
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
            compontent: props => (
                <ProjectDrawer
                    {...props}
                    fromProjectManage={this.props.fromProjectManage}
                    projectId={this.props.projectId}
                    userType={this.props.userType}
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

    addEnv = projectId => {
        if (this.props.edit) {
            const selectProjects = [];
            let roleList = [];
            let adminRoleList = [];
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

            // if (
            //     selectProjects.length === 1 &&
            //     selectProjects[0].projectIds[0] === 'ALL'
            // ) {
            //     roleList = this.state.roleList.filter(
            //         item =>
            //             item.needProject === 0 &&
            //             item.nullProjectDefaultValue === 'ALL' &&
            //             item.needEnv === 1 &&
            //             item.needSite === 0
            //     );
            //     adminRoleList = this.state.roleList.filter(
            //         item => item.roleType === 'admin'
            //     );
            // } else {
            //     roleList = this.state.roleList.filter(
            //         item => item.needProject === 1 && item.needEnv === 1
            //     );
            //     adminRoleList = this.state.roleList.filter(
            //         item => item.roleType === 'admin' && item.needProject === 1
            //     );
            // }

            /**
             * 角色管理中，对角色增加了适用项目功能，所以选择项目以后添加环境/角色，需要根据角色的适用项目进行角色筛选
             * 可选角色：1. 当前选择一个项目-取该项目的roleVos字段
             *          2. 当前选择了多个项目-取多个项目roleVos字段中的交集
             *          3. "所有项目" 此项的角色为角色列表中没有projectIds的集合
             * 筛选出可用角色以后再把常规角色和app角色分为两个列表
             * */
            let allRoleList = [];
            const selectProjectList = this.state.projectList.filter(item =>
                includes(
                    selectProjects.map(selectItem => selectItem.projectIds[0]),
                    item.id
                )
            );
            const hasRoleVosProjects = selectProjectList.filter(
                item => item.roleVos
            );
            if (hasRoleVosProjects.length === 0) {
                // 选择的项目都没有roleVos，取roleList中没有projectIds的角色
                allRoleList = this.state.roleList.filter(
                    item => !item.projectIds || !item.projectIds.length
                );
            } else if (hasRoleVosProjects.length === 1) {
                // 选择的项目中只有一个项目有roleVos，直接取该项目的roleVos字段,然后区分普通角色和管理员角色
                allRoleList = hasRoleVosProjects[0].roleVos;
            } else if (hasRoleVosProjects.length > 1) {
                // 选择的项目中有多个项目有roleVos，取交集
                const roleArr = hasRoleVosProjects.map(item => item.roleVos);
                console.log(roleArr);
                allRoleList = intersectionBy(...roleArr, 'id');
            }
            /**
             * 确定完可选角色列表以后，拆分角色列表*/
            if (
                hasRoleVosProjects.length &&
                hasRoleVosProjects[0].id === 'ALL'
            ) {
                roleList = allRoleList.filter(
                    item =>
                        item.needProject === 0 &&
                        item.nullProjectDefaultValue === 'ALL' &&
                        item.needEnv === 1 &&
                        item.needSite === 0
                );
                adminRoleList = allRoleList.filter(
                    item => item.roleType === 'admin'
                );
            } else {
                roleList = allRoleList.filter(
                    item => item.needProject === 1 && item.needEnv === 1
                );
                adminRoleList = allRoleList.filter(
                    item => item.roleType === 'admin' && item.needProject === 1
                );
            }

            drawerFun({
                title: projectId
                    ? this.props.intl.formatMessage(
                          i18nMessages.ECONFIG_FRONT_A0299
                      )
                    : this.props.intl.formatMessage(
                          i18nMessages.ECONFIG_FRONT_A0160
                      ),
                width: 600,
                compontent: props => (
                    <EnvRoleDrawer
                        {...props}
                        intl={this.props.intl}
                        appId={this.props.appId}
                        type={projectId ? 'edit' : 'new'}
                        envList={this.state.envList}
                        selectProjects={selectProjects}
                        saveRoleAndEnv={project => {
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
                        roleList={roleList}
                        adminRoleList={adminRoleList}
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
                        saveSite={projects => {
                            this.props.changeDataItem(this.props.appId)(
                                projects
                            );
                            this.setState({
                                selectedRowKeys: [],
                                hideButton: true
                            });
                        }}
                    />
                )
            });
        }
    };

    addStorage = (project, index) => {
        if (this.props.edit) {
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0329
                ),
                width: 500,
                compontent: props => (
                    <StorageDrawer
                        {...props}
                        intl={this.props.intl}
                        appId={this.props.appId}
                        index={index}
                        project={project}
                        saveStorage={projects => {
                            this.props.changeDataItem(this.props.appId)(
                                projects
                            );
                            this.setState({
                                selectedRowKeys: [],
                                hideButton: true
                            });
                        }}
                    />
                )
            });
        }
    };

    deleteStorage = (project, index, storageId) => {
        if (this.props.edit) {
            delete project.storageMap[index][storageId];
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
                    projectList={this.state.projectList}
                    intl={this.props.intl}
                    isBuiltin={user.isBuiltin === '1'}
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
        this.setState({ showBalanceModal: false });
    };

    render() {
        const { selectedRowKeys } = this.state;
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
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="eBalance">
                <div>
                    {this.props.authMode === 2 ? (
                        <Button
                            type="primary"
                            className="mBottom15"
                            onClick={() => {
                                this.setState({
                                    showBalanceModal: true
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
                                {formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0159
                                )}
                            </Button>,
                            <Button
                                type="primary"
                                key="addEnv"
                                className="mBottom15 mLeft15"
                                disabled={
                                    !this.props.edit ||
                                    this.state.hideButton ||
                                    this.props.authInfoItem.length === 0
                                }
                                onClick={() => {
                                    this.addEnv();
                                }}
                            >
                                {formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0160
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
                <Table
                    rowKey={record => record}
                    rowSelection={rowSelection}
                    dataSource={this.props.authInfoItem}
                    columns={this.columns}
                    pagination={false}
                    scroll={{ x: true }}
                />

                {this.state.showBalanceModal && (
                    <BlanceModal
                        {...this.props}
                        onCancel={() => {
                            this.setState({ showBalanceModal: false });
                        }}
                        visible={this.state.showBalanceModal}
                        onOk={this.speedAddData}
                        selectProjectIds={selectProjectIds}
                        fromProjectManage={this.props.fromProjectManage}
                        projectId={this.props.projectId}
                        userType={this.props.userType}
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
                        envList={this.state.envList}
                        roleList={this.state.roleList}
                    />
                )}
            </div>
        );
    }
}

export default eBalance;
