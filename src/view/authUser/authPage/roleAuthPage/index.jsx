import React from 'react';
import { Button, Table, message, Modal } from 'antd';
import PropTypes from 'prop-types';
import { find, includes } from 'lodash';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import RoleDrawer from '../drawers/roleDrawer';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import RoleModal from '../modals/roleModal';

const confirm = Modal.confirm;

@injectIntl
class roleAuthPage extends React.PureComponent {
    static propTypes = {
        authInfoItem: PropTypes.array,
        systemList: PropTypes.array,
        addDataItem: PropTypes.func,
        deleteDataItem: PropTypes.func,
        changeList: PropTypes.func,
        edit: PropTypes.bool,
        authMode: PropTypes.number, // 授权默示  1经典  2快捷
        appId: PropTypes.string
    };

    state = {
        roleList: [],
        selectedRowKeys: [],
        loading: true,
        showRoleModal: false
    };

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if (!nextProps.edit) {
            return {
                ...(nextProps.value || {}),
                selectedRowKeys: []
            };
        }
        return null;
    }

    componentDidMount = async () => {
        try {
            const roleList = await authServices.getCspRoleList(
                this.props.appId
            );
            this.setState({
                roleList: roleList.data.map(item => ({
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
            this.props.changeList(this.props.appId, roleList);
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
            render: roleIds => {
                if (roleIds && roleIds.length > 0) {
                    return (
                        <div>
                            {roleIds.map((item, index) => {
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
        }
    ];

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };

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

    addRole = () => {
        if (this.props.edit) {
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
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        type="new"
                        saveRole={(appId, projectLists) => {
                            this.props.addDataItem(
                                this.props.appId,
                                projectLists
                            );
                        }}
                        roleList={this.state.roleList.filter(
                            item => !includes(selectedRole, item.id)
                        )}
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
                    systemList={this.props.systemList}
                    isBuiltin={user.isBuiltin === '1'}
                    intl={this.props.intl}
                    {...props}
                    roleInfo={user}
                />
            )
        });
    };

    speedAddData = (appId, projectLists) => {
        this.props.addDataItem(this.props.appId, projectLists);
        this.setState({ showRoleModal: false });
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
            <div className="roleAuthPage">
                <div>
                    {this.props.authMode === 2 ? (
                        <Button
                            type="primary"
                            className="mBottom15 mRight15"
                            onClick={() => {
                                this.setState({
                                    showRoleModal: true
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
                            className="mBottom15 mRight15"
                            onClick={this.addRole}
                            disabled={!this.props.edit}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0293
                            )}
                        </Button>
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
                        dataSource={this.props.authInfoItem.filter(
                            item => item
                        )}
                        columns={this.columns}
                        pagination={false}
                        rowSelection={rowSelection}
                    />
                )}

                {this.state.showRoleModal && (
                    <RoleModal
                        {...this.props}
                        onCancel={() => {
                            this.setState({ showRoleModal: false });
                        }}
                        visible={this.state.showRoleModal}
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
                        selectProjectIds={[]}
                        onOk={this.speedAddData}
                    />
                )}
            </div>
        ) : null;
    }
}

export default roleAuthPage;
