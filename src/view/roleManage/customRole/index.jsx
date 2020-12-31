import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { debounce } from 'lodash';
// import CommonTable from 'tms-common-table1x';
import { Divider, message, Table, Modal } from 'antd';
import { drawerFun } from 'component/drawer';
import EditRole from './editRole';
import RolePermission from './rolePermission';
import PromissionGroup from './promissionGroup';
import SetSignature from './setSignature';
import { connect } from 'model';
import { i18nMessages } from 'src/i18n';
import { injectIntl } from 'react-intl';
import { ROLE_IS_PROJECT } from 'src/utils/utils';
import AuthSearchComponent from 'src/component/authSearchComponent';
import RoleAuth from '../roleAuth';

const confirm = Modal.confirm;
@injectIntl
@connect(state => ({
    customTable: state.role.customTable,
    softList: state.role.softList,
    softInfo: state.role.softInfo,
    roleTypes: state.role.roleTypes,
    signatureList: state.role.signatureList
}))
class CustomRoleTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sortInfo: {
                sortField: 'roleTypeName',
                sortOrder: 'ASC'
            },
            showAuthSearch: false,
            authSearchParams: {},
            showRoleAuth: false,// 显示角色授权
            currentRoleInfo: {},//当前操作的角色
        };
    }

    get roleEffects() {
        return this.props.effects.role;
    }

    handlePermission = record => {
        // 权限组
        const { sortField, sortOrder } = this.props.customRoleSortInfo;
        if (record.authType === '2') {
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0545
                ),
                width: 900,
                compontent: props => (
                    <PromissionGroup
                        isEdit={record.isEdit}
                        roleInfo={record}
                        flushCustomTable={() =>
                            this.roleEffects.setCustomTable(
                                record.appId,
                                sortField,
                                sortOrder
                            )
                        }
                        {...props}
                        {...this.props}
                    />
                )
            });
        } else {
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0167
                ),
                width: 900,
                compontent: props => (
                    <RolePermission
                        roleInfo={record}
                        isEdit={record.isEdit}
                        flushCustomTable={() =>
                            this.roleEffects.setCustomTable(
                                record.appId,
                                sortField,
                                sortOrder
                            )
                        }
                        {...props}
                        {...this.props}
                    />
                )
            });
        }
    };

    handleSignature = record => {
        console.log(record);
        const { sortField, sortOrder } = this.props.customRoleSortInfo;
        const { signatureList } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0042
            ),
            width: 500,
            compontent: props => (
                <SetSignature
                    isEdit={record.isEdit}
                    roleInfo={record}
                    flushCustomTable={() =>
                        this.roleEffects.setCustomTable(
                            record.appId,
                            sortField,
                            sortOrder
                        )
                    }
                    signatureList={signatureList}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    handleEdit = record => {
        const appId = record.appId;
        const { sortField, sortOrder } = this.props.customRoleSortInfo;
        const showProjectItem = ROLE_IS_PROJECT.indexOf(appId) > -1;
        const { softList, roleTypes } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0098
            ),
            width: 500,
            compontent: props => (
                <EditRole
                    isEdit={record.isEdit}
                    flushCustomTable={() =>
                        this.roleEffects.setCustomTable(
                            record.appId,
                            sortField,
                            sortOrder
                        )
                    }
                    showProjectItem={showProjectItem}
                    softList={softList}
                    roleTypes={roleTypes}
                    roleInfo={record}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    onDeleteDic = async id => {
        try {
            await $http.delete(`${urls.roleDelete}?id=${id}`);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            this.roleEffects.setCustomTable(this.props.softInfo.eventKey);
        } catch (e) {
            message.error(e.message);
        }
    };

    tableChange = ({}, filters, { order, field }) => {
        const sortInfo = {
            sortField: field ? field : '',
            sortOrder: order ? (order === 'ascend' ? 'ASC' : 'DESC') : 'ASC'
        };
        this.setState({ sortInfo });
        this.props.changeCustomRoleSort(sortInfo);
        this.roleEffects.setCustomTable(
            this.props.softInfo.eventKey,
            field,
            order ? (order === 'ascend' ? 'ASC' : 'DESC') : 'ASC'
        );
    };

    deleteRole = debounce(async roleInfo => {
        try {
            const authSoftList = await $http.get(urls.listRoleAuthAppList, {
                roleId: roleInfo.id
            });
            if (authSoftList && authSoftList.length > 0) {
                Modal.info({
                    title: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0202
                    ),
                    content: (
                        <div style={{ wordBreak: 'break-all' }}>
                            <div className="mBottom8">
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0665
                                )}
                            </div>
                            <div>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0655
                                )}
                                <a
                                    onClick={() =>
                                        this.showAuthSearch(
                                            roleInfo,
                                            authSoftList[0]
                                        )
                                    }
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0466
                                    )}
                                </a>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0666
                                )}
                            </div>
                        </div>
                    ),
                    okText: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0279
                    ),
                    onOk() {}
                });
            } else {
                confirm({
                    title: `${this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0252
                    )}[${roleInfo.roleName}]？`,
                    okText: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0279
                    ),
                    cancelText: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0281
                    ),
                    onOk: () => this.onDeleteDic(roleInfo.id)
                });
            }
        } catch (error) {
            message.error(error.message);
        }
    }, 300);

    showAuthSearch = (roleInfo, appId) => {
        this.setState({
            showAuthSearch: true,
            authSearchParams: {
                appId,
                defaultSearchParams: {
                    roleInfo: { key: roleInfo.id, label: roleInfo.roleName }
                }
            }
        });
    };

    showRoleAuth = (roleInfo) => {
        this.setState({currentRoleInfo: roleInfo, showRoleAuth: true});
    }

    render() {
        const {
            customRoleSortInfo: { sortField, sortOrder },
            customTable: { list, loading }
        } = this.props;
        const { showAuthSearch, authSearchParams, showRoleAuth, currentRoleInfo } = this.state;

        const columns = [
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0096
                ),
                dataIndex: 'roleName',
                sorter: true,
                sortOrder:
                    sortField && sortField === 'roleName' && sortOrder
                        ? sortOrder === 'ASC'
                            ? 'ascend'
                            : 'descend'
                        : false,
                render: (roleName, record) => (
                    <span className="Block" style={{ minWidth: 200 }}>
                        {`${record.roleName}${
                            record.blindState === 0
                                ? this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0624
                                )
                                : record.blindState === 1
                                    ? this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0623
                                    )
                                    : ''
                        }`}
                    </span>
                )
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0174
                ),
                dataIndex: 'roleTypeName',
                sorter: true,
                sortOrder:
                    sortField && sortField === 'roleTypeName' && sortOrder
                        ? sortOrder === 'ASC'
                            ? 'ascend'
                            : 'descend'
                        : false,
                width: '300px'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0175
                ),
                dataIndex: 'description',
                width: '300px'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0579
                ),
                dataIndex: 'createTime',
                sorter: true,
                sortOrder:
                    sortField && sortField === 'createTime' && sortOrder
                        ? sortOrder === 'ASC'
                            ? 'ascend'
                            : 'descend'
                        : false,
                width: '300px'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0097
                ),
                width: '320px',
                dataIndex: 'action',
                render: (text, record) => {
                    // const {softInfo} = this.props;
                    return (
                        <span>
                            {/* {softInfo.eventKey === '09' && [
                                <a
                                    key="auth"
                                    onClick={() => this.showRoleAuth(record)}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0676
                                    )}
                                </a>,
                                <Divider key="line" type="vertical" />
                            ]} */}
                            <a onClick={() => this.handleEdit(record)}>
                                {this.props.intl.formatMessage(
                                    record.isEdit === '1'
                                        ? i18nMessages.ECONFIG_FRONT_A0098
                                        : i18nMessages.ECONFIG_FRONT_A0102
                                )}
                            </a>
                            <Divider type="vertical" />
                            <a onClick={() => this.handlePermission(record)}>
                                {this.props.intl.formatMessage(
                                    record.isEdit === '1'
                                        ? i18nMessages.ECONFIG_FRONT_A0099
                                        : i18nMessages.ECONFIG_FRONT_A0657
                                )}
                            </a>
                            {record.isEdit === '1' && (
                                <Divider type="vertical" />
                            )}
                            {record.isEdit === '1' && (
                                <a onClick={() => this.handleSignature(record)}>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0100
                                    )}
                                </a>
                            )}
                            {record.isEdit === '1' && (
                                <Divider type="vertical" />
                            )}
                            {record.isEdit === '1' && (
                                // <Popconfirm
                                //     title={`${this.props.intl.formatMessage(
                                //         i18nMessages.ECONFIG_FRONT_A0252
                                //     )}[${record.roleName}]`}
                                //     onConfirm={() => this.onDeleteDic(record.id)}
                                // >
                                <a onClick={() => this.deleteRole(record)}>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0101
                                    )}
                                </a>
                                // </Popconfirm>
                            )}
                        </span>
                    );
                }
            }
        ];

        if (this.props.softInfo.eventKey === 'edc') {
            columns.splice(4, 0, {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0536
                ),
                dataIndex: 'projectVos',
                width: '300px',
                render: text => {
                    const projectText =
                        text &&
                        text.map(item =>
                            item.projectSerialNo
                                ? `【${item.projectSerialNo}】${item.projectName}`
                                : item.projectName
                        );
                    return (
                        <div>
                            {projectText.map((item, key) => (
                                <div
                                    style={{
                                        overflow: 'hidden',
                                        'text-overflow': 'ellipsis',
                                        'white-space': 'nowrap',
                                        'max-width': 300,
                                        cursor: 'pointer'
                                    }}
                                    key={key}
                                    title={item}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    );
                }
            });
        }

        return (
            <div>
                {showAuthSearch && (
                    <AuthSearchComponent
                        visible={showAuthSearch}
                        intl={this.props.intl}
                        appId={authSearchParams.appId}
                        defaultSearchParams={
                            authSearchParams.defaultSearchParams
                        }
                        onCancel={() =>
                            this.setState({
                                showAuthSearch: false,
                                authSearchParams: {}
                            })
                        }
                    />
                )}
                {showRoleAuth && (
                    <RoleAuth
                        visible={showRoleAuth}
                        intl={this.props.intl}
                        roleInfo={currentRoleInfo}
                        appId="09"
                        onCancel={() =>
                            this.setState({
                                showRoleAuth: false,
                                currentRoleInfo: {}
                            })
                        }
                    />
                )}
                <Table
                    dataSource={list}
                    columns={columns}
                    loading={loading}
                    pagination={false}
                    outerFilter={false}
                    onChange={this.tableChange}
                />
            </div>
        );
    }
}

export default CustomRoleTable;
