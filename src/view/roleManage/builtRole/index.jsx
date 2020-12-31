import React from 'react';
// import CommonTable from 'tms-common-table1x';
import { Divider, Table } from 'antd';
import { i18nMessages } from 'src/i18n';
import { injectIntl } from 'react-intl';
import { drawerFun } from 'component/drawer';
import CopyRole from './copyRole';
import FindPromission from './findPermission';
import FindRole from './findRole';
import SetSignature from '../customRole/setSignature';
import { connect } from 'model';
import { ROLE_IS_PROJECT } from 'src/utils/utils';
import RoleAuth from '../roleAuth';

@injectIntl
@connect(state => ({
    softInfo: state.role.softInfo,
    builtTable: state.role.builtTable,
    roleTypes: state.role.roleTypes,
    signatureList: state.role.signatureList
}))
class BuiltRoleTable extends React.Component {
    state = {
        loading: false,
        roleTypes: [],
        showRoleAuth: false, // 显示角色授权
        currentRoleInfo: {} //当前操作的角色
    };

    get roleEffects() {
        return this.props.effects.role;
    }

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0096
            ),
            dataIndex: 'roleName',
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
                i18nMessages.ECONFIG_FRONT_A0097
            ),
            width: '250px',
            dataIndex: 'action',
            render: (text, record) => {
                // const { softInfo } = this.props;
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
                        <a onClick={() => this.onFindRole(record)}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0102
                            )}
                        </a>
                        <Divider type="vertical" />
                        <a onClick={() => this.onCopyRole(record)}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0103
                            )}
                        </a>
                        <Divider type="vertical" />
                        <a onClick={() => this.handleSignature(record)}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0100
                            )}
                        </a>
                    </span>
                );
            }
        }
    ];

    handleSignature = record => {
        console.log(record);
        const { signatureList } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0100
            ),
            width: 500,
            compontent: props => (
                <SetSignature
                    isEdit="1"
                    roleInfo={record}
                    flushCustomTable={() =>
                        this.roleEffects.setbuiltTable(record.appId)
                    }
                    signatureList={signatureList}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    onCopyRole = roleInfo => {
        console.log(roleInfo);
        const appId = roleInfo.appId;
        const showProjectItem = ROLE_IS_PROJECT.indexOf(appId) > -1;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0103
            ),
            width: 500,
            compontent: props => (
                <CopyRole
                    showProjectItem={showProjectItem}
                    roleTypes={this.props.roleTypes}
                    roleInfo={roleInfo}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    onFindRole = roleInfo => {
        console.log(roleInfo);
        if (roleInfo.authType === '2') {
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0546
                ),
                width: 900,
                compontent: props => (
                    <FindPromission
                        roleInfo={roleInfo}
                        {...props}
                        {...this.props}
                    />
                )
            });
        } else {
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0102
                ),
                width: 900,
                compontent: props => (
                    <FindRole roleInfo={roleInfo} {...props} {...this.props} />
                )
            });
        }
    };

    showRoleAuth = roleInfo => {
        this.setState({ currentRoleInfo: roleInfo, showRoleAuth: true });
    };

    render() {
        const {
            builtTable: { list, loading }
        } = this.props;
        const { showRoleAuth, currentRoleInfo } = this.state;
        return (
            <div>
                {showRoleAuth && (
                    <RoleAuth
                        visible={showRoleAuth}
                        intl={this.props.intl}
                        appId="09"
                        roleInfo={currentRoleInfo}
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
                    columns={this.columns}
                    loading={loading}
                    pagination={false}
                    outerFilter={false}
                />
            </div>
        );
    }
}

export default BuiltRoleTable;
