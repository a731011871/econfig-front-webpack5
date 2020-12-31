import React from 'react';
import { Button, Table, message, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import { find, includes, cloneDeep } from 'lodash';
import { findDepartmentById } from 'utils/utils';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import { deptService } from 'src/service/deptService';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import DepartmentDrawer from '../drawers/departmentDrawer';
import RoleDepartmentModal from '../modals/roleDepartmentModal';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import { SiteBtn, SiteItem, SiteSpan } from 'src/component/authPage/styled';

const confirm = Modal.confirm;

@injectIntl
class roleDepartmentPage extends React.PureComponent {
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
        departmentList: [],
        roleList: [],
        loading: true,
        showRoleDepartmentModal: false
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
            const departmentList = await deptService.fetchDepartment();
            // const roleList = await authServices.getRoleList(this.props.appId);
            const roleList = await authServices.getCspRoleList(
                this.props.appId
            );
            this.setState({
                departmentList,
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
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0705
            ),
            dataIndex: 'organIds',
            render: (organIds = [], record) => {
                const { departmentList, roleList } = this.state;
                const user = find(
                    roleList,
                    roleItem => roleItem.id === record.roleIds[0]
                );
                if (
                    user &&
                    user.needDepartment === 1
                    // organIds &&
                    // organIds.filter(item => item !== 'ALL' && item !== 'NONE')
                    //     .length > 0
                ) {
                    return (
                        <div style={{ minWidth: 210 }}>
                            <SiteBtn
                                className={`InlineBlock mRight15 ${!this.props
                                    .edit && 'DisabledBtn'}`}
                                onClick={() => this.addDepartment(record)}
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0706
                                )}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0706
                                )}
                            </SiteBtn>
                            {organIds
                                .filter(
                                    item => item !== 'ALL' && item !== 'NONE'
                                )
                                .map((item, index) => {
                                    const department = findDepartmentById(
                                        departmentList,
                                        item
                                    );
                                    return (
                                        <div className="Block" key={index}>
                                            <SiteItem
                                                key={department?.id || item}
                                                className="wMax400"
                                            >
                                                <SiteSpan
                                                    className="InlineBlock flex overflow_ellipsis mRight5 vMax20em"
                                                    title={
                                                        department?.organizeName ||
                                                        ''
                                                    }
                                                >
                                                    {department?.organizeName ||
                                                        ''}
                                                </SiteSpan>
                                                {this.props.edit && (
                                                    <Icon
                                                        className="TxtMiddle pointer"
                                                        type="close"
                                                        onClick={() => {
                                                            this.deleteDepartment(
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
                } else if (
                    user &&
                    user.needDepartment === 0 &&
                    user.nullDepartmentDefaultValue === 'ALL'
                ) {
                    return (
                        <SiteItem>
                            <SiteSpan
                                className="InlineBlock flex overflow_ellipsis"
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0709
                                )}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0709
                                )}
                            </SiteSpan>
                        </SiteItem>
                    );
                } else if (
                    user &&
                    user.needDepartment === 0 &&
                    user.nullDepartmentDefaultValue === 'NONE'
                ) {
                    return (
                        <div className="Gray_9e mTop8">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0708
                            )}
                        </div>
                    );
                }
                // return (
                //     <div className="Gray_9e mTop8">
                //         {this.props.intl.formatMessage(
                //             i18nMessages.ECONFIG_FRONT_A0341
                //         )}
                //     </div>
                // );
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
                ).needDepartment === 1) ||
            (selectedRowKeys.length > 0 &&
                selectedRowKeys.filter(item => {
                    const role = find(
                        this.state.roleList,
                        roleItem => roleItem.id === item.roleIds[0]
                    );
                    console.log(role);
                    if (
                        role.needDepartment === 1 &&
                        item.organIds.length === 0
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

    addDepartment = record => {
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0329
            ),
            width: 500,
            compontent: props => (
                <DepartmentDrawer
                    {...props}
                    fromProjectManage={this.props.fromProjectManage}
                    intl={this.props.intl}
                    selectRecord={record}
                    departmentList={this.state.departmentList}
                    addDataItem={organs => {
                        this.setState({
                            selectedRowKeys: [],
                            hideButton: true
                        });
                        this.props.changeDataItem(this.props.appId)(organs);
                    }}
                />
            )
        });
    };

    deleteDepartment = (record, organId) => {
        if (this.props.edit) {
            const newRecord = cloneDeep(record);
            newRecord.organIds = newRecord.organIds.filter(
                item => item !== organId
            );
            this.props.changeDataItem(this.props.appId)([newRecord]);
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

    speedAddData = organLists => {
        this.props.addDataItem(this.props.appId, organLists);
        this.setState({ showRoleDepartmentModal: false });
    };

    render() {
        const { selectedRowKeys, loading, departmentList } = this.state;
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
        const formatMessage = this.props.intl.formatMessage;
        return !loading ? (
            <div className="roleDepartmentPage">
                <div>
                    {this.props.authMode === 2 ? (
                        <Button
                            type="primary"
                            className="mBottom15 mRight15"
                            onClick={() => {
                                this.setState({
                                    showRoleDepartmentModal: true
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
                                onClick={this.addProject}
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

                {this.state.showRoleDepartmentModal && (
                    <RoleDepartmentModal
                        {...this.props}
                        roleList={this.state.roleList.filter(
                            item => !includes(selectedRole, item.id)
                        )}
                        onCancel={() => {
                            this.setState({ showRoleDepartmentModal: false });
                        }}
                        visible={this.state.showRoleDepartmentModal}
                        intl={this.props.intl}
                        departmentList={departmentList}
                        selectOrganIds={[]}
                        onOk={this.speedAddData}
                    />
                )}
            </div>
        ) : null;
    }
}

export default roleDepartmentPage;
