import React from 'react';
import { Button, Table, message, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import { find, includes, cloneDeep } from 'lodash';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import ProjectDrawer from '../drawers/projectDrawer';
import RoleDrawer from '../drawers/roleDrawer';
import StorageDrawer from '../drawers/storageDrawer';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import RoleProjectStorageModal from '../modals/roleProjectStorageModal';

const confirm = Modal.confirm;
const SiteBtn = styled.div`
    border: 1px solid #8bd4fd;
    background: #e5f7fe;
    color: #8c93fb;
    width: 88px;
    margin-top: 6px;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
`;
const SiteItem = styled.div`
    border: 1px solid #9e9e9e;
    background: #f5f5f5;
    color: #333;
    padding-left: 10px;
    padding-right: 5px;
    margin-top: 6px;
    text-align: center;
    max-width: 200px;
    display: inline-block;
    margin-right: 8px;
    vertical-align: middle;
`;
const SiteSpan = styled.span`
    max-width: 164px;
    vertical-align: middle;
`;

@injectIntl
class eSite extends React.PureComponent {
    static propTypes = {
        authInfoItem: PropTypes.array,
        systemList: PropTypes.array,
        changeDataItem: PropTypes.func,
        addDataItem: PropTypes.func,
        deleteDataItem: PropTypes.func,
        changeList: PropTypes.func,
        edit: PropTypes.bool
    };

    state = {
        selectedRowKeys: [],
        hideButton: true,
        projectList: [],
        storageList: [],
        roleList: [],
        loading: true,
        showRoleProjectStorageModal: false
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
            const storageList = await authServices.getStorageList();
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
                storageList: storageList.list,
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
                                if (user) {
                                    return (
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
                                    );
                                }
                                return null;
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
            title: '项目权限',
            dataIndex: 'projectIds',
            width: 800,
            render: (projectIds, record) => {
                const user = find(
                    this.state.roleList,
                    roleItem => roleItem.id === record.roleIds[0]
                );
                if (
                    user &&
                    user.roleType === 'PI' &&
                    projectIds &&
                    projectIds.filter(item => item !== 'ALL' && item !== 'NONE')
                        .length > 0
                ) {
                    return (
                        <div style={{ minWidth: 210 }}>
                            {user && user.roleType === 'PI' ? (
                                <SiteBtn
                                    className="InlineBlock mRight15"
                                    onClick={() => {
                                        this.addProject(record);
                                    }}
                                    title={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0309
                                    )}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0309
                                    )}
                                </SiteBtn>
                            ) : (
                                user &&
                                user.roleType === 'admin' && (
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
                                )
                            )}
                            {user &&
                                user.roleType === 'PI' &&
                                projectIds
                                    .filter(
                                        item =>
                                            item !== 'ALL' && item !== 'NONE'
                                    )
                                    .map((item, index) => {
                                        const project = find(
                                            this.state.projectList,
                                            projectItem =>
                                                projectItem.id === item
                                        );
                                        return (
                                            <div
                                                className="InlineBlock"
                                                key={index}
                                            >
                                                <SiteItem
                                                    key={project?.id || item}
                                                    className="wMax400"
                                                >
                                                    <SiteSpan
                                                        className="InlineBlock flex overflow_ellipsis mRight5 vMax20em"
                                                        title={
                                                            project
                                                                ? `【${project.projectSerialNo}】${project.projectName}`
                                                                : ''
                                                        }
                                                    >
                                                        {project
                                                            ? `【${project.projectSerialNo}】${project.projectName}`
                                                            : ''}
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
                                        );
                                    })}
                        </div>
                    );
                }
                return user && user.roleType === 'PI' ? (
                    <SiteBtn
                        className="InlineBlock mRight15"
                        onClick={() => {
                            this.addProject(record);
                        }}
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0309
                        )}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0309
                        )}
                    </SiteBtn>
                ) : user && user.roleType === 'admin' ? (
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
                ) : (
                    <div className="Gray_9e mTop8">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0303
                        )}
                    </div>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0165
            ),
            dataIndex: 'storageIds',
            render: (storageIds, record) => {
                const user = find(
                    this.state.roleList,
                    roleItem => roleItem.id === record.roleIds[0]
                );
                if (
                    storageIds &&
                    storageIds.length > 0 &&
                    user &&
                    user.roleType === 'noProjectadmin'
                ) {
                    return (
                        <div>
                            {user && user.roleType === 'noProjectadmin' ? (
                                <SiteBtn
                                    className={`InlineBlock mRight15 ${!this
                                        .props.edit && 'DisabledBtn'}`}
                                    onClick={() => {
                                        this.addStorage(record);
                                    }}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0358
                                    )}
                                </SiteBtn>
                            ) : (
                                user &&
                                user.roleType === 'admin' && (
                                    <SiteItem>
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
                                )
                            )}
                            {storageIds.map((item, index) => {
                                const storage = find(
                                    this.state.storageList,
                                    storageItem => storageItem.id === item
                                );
                                if (storage) {
                                    return (
                                        <div
                                            className="InlineBlock"
                                            key={index}
                                        >
                                            <SiteItem key={storage.id}>
                                                <SiteSpan
                                                    title={
                                                        storage.storeroomName
                                                    }
                                                    className="InlineBlock flex overflow_ellipsis mRight5"
                                                >
                                                    {storage.storeroomName}
                                                </SiteSpan>
                                                {this.props.edit && (
                                                    <Icon
                                                        className="TxtMiddle pointer"
                                                        type="close"
                                                        onClick={() => {
                                                            this.deleteStorage(
                                                                record,
                                                                item
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </SiteItem>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    );
                }
                return user && user.roleType === 'noProjectadmin' ? (
                    <SiteBtn
                        className={`InlineBlock mRight15 ${!this.props.edit &&
                            'DisabledBtn'}`}
                        onClick={() => {
                            this.addStorage(record);
                        }}
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0358
                        )}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0358
                        )}
                    </SiteBtn>
                ) : user && user.roleType === 'admin' ? (
                    <SiteItem>
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
                ) : (
                    <div className="Gray_9e mTop8">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0196
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
        this.setState({ selectedRowKeys });
    };

    addProject = record => {
        if (this.props.edit) {
            console.log(record);
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
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        record={record}
                        addDataItem={this.props.changeDataItem(
                            this.props.appId
                        )}
                        selectProjectIds={record.projectIds}
                    />
                )
            });
        }
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

    addStorage = project => {
        if (this.props.edit) {
            const selectedStorage = project.storageIds.map(item => item);
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
                        storageList={this.state.storageList.filter(
                            item => !includes(selectedStorage, item.id)
                        )}
                        project={project}
                        saveStorage={this.props.changeDataItem(
                            this.props.appId
                        )}
                    />
                )
            });
        }
    };

    deleteStorage = (project, storageId) => {
        if (this.props.edit) {
            const newProject = cloneDeep(project);
            newProject.storageIds = project.storageIds.filter(
                item => item !== storageId
            );
            this.props.changeDataItem(this.props.appId)([newProject]);
        }
    };

    deleteProject = (project, projectId) => {
        if (this.props.edit) {
            const newProject = cloneDeep(project);
            newProject.projectIds = project.projectIds.filter(
                item => item !== projectId
            );
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

    speedAddData = (appId, projectLists) => {
        this.props.addDataItem(this.props.appId, projectLists);
        this.setState({ showRoleProjectStorageModal: false });
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
        const selectedRole = this.props.authInfoItem.map(
            item => item.roleIds[0]
        );
        return !loading ? (
            <div className="eSite">
                <div>
                    {this.props.authMode === 2 ? (
                        <Button
                            type="primary"
                            className="mBottom15"
                            onClick={() => {
                                this.setState({
                                    showRoleProjectStorageModal: true
                                });
                            }}
                            disabled={!this.props.edit}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0329
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            className="mBottom15 "
                            onClick={() => {
                                this.addRole();
                            }}
                            disabled={!this.props.edit}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0293
                            )}
                        </Button>
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

                {this.state.showRoleProjectStorageModal && (
                    <RoleProjectStorageModal
                        {...this.props}
                        onCancel={() => {
                            this.setState({
                                showRoleProjectStorageModal: false
                            });
                        }}
                        visible={this.state.showRoleProjectStorageModal}
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
                        fromProjectManage={this.props.fromProjectManage}
                        onOk={this.speedAddData}
                        storageList={this.state.storageList}
                    />
                )}
            </div>
        ) : null;
    }
}

export default eSite;
