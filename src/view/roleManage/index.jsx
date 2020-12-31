import React from 'react';
import styled from 'styled-components';
import { i18nMessages } from 'src/i18n';
import { injectIntl } from 'react-intl';
import CustomRoleTable from './customRole';
import BuiltRoleTable from './builtRole';
import { Menu, Tabs, Spin, Button, Modal } from 'antd';
import AddRole from './addRole';
import { drawerFun } from 'component/drawer';
import { connect } from 'model';
// import { message } from 'antd/lib/index';
// import { $http } from 'src/utils/http';
import urls from 'src/utils/urls';

const RoleManageContainer = styled.div`
    padding: 0 15px;
    display: flex;
    height: 100%;
    .ant-menu-inline {
        border-right: 0;
    }
    .role-manage-left {
        overflow: hidden;
        overflow-y: auto;
        border-right: 1px solid #e8e8e8;
        .role-manage-left-title {
            font-size: 15px;
            font-weight: 700;
            line-height: 50px;
            padding: 0 10px 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
    .role-manage-right {
        width: 100%;
        padding: 0 15px;
    }
    > div {
        display: inline-block;
    }
`;
const confirm = Modal.confirm;

@injectIntl
@connect(state => ({
    softList: state.role.softList,
    softInfo: state.role.softInfo,
    roleTypes: state.role.roleTypes,
    roleLoading: state.role.roleLoading
}))
class RoleManage extends React.Component {
    state = {
        activeKey: 'built',
        customRoleSortInfo: {
            sortField: 'roleTypeName',
            sortOrder: 'ASC'
        },
    };

    componentWillMount() {
        this.getRoles();
    }

    get roleEffects() {
        return this.props.effects.role;
    }

    // 获取角色列表
    getRoles = () => {
        // 获取软件列表
        this.roleEffects.setSoftList();
        // 获取签名
        this.roleEffects.setSignatureList();
    };

    // 点击左侧菜单
    handleClickMenu = ({
        item: {
            props: { children, eventKey }
        }
    }) => {
        const { activeKey } = this.state;
        this.roleEffects.setSoftInfo({ children, eventKey });
        this.roleEffects.setRoleTypes(eventKey);
        if (activeKey === 'custom') {
            this.roleEffects.setCustomTable(eventKey, 'roleTypeName','ASC');
            this.setState({ customRoleSortInfo: {sortField:'roleTypeName',sortOrder: 'ASC' }});
        } else if (activeKey === 'built') {
            this.roleEffects.setbuiltTable(eventKey);
        }
    };

    // 添加角色
    handleAdd = () => {
        const { softList, roleTypes, softInfo } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0259
            ),
            width: 500,
            compontent: props => (
                <AddRole
                    roleTypes={roleTypes}
                    softList={softList}
                    softInfo={softInfo}
                    roleEffects={this.roleEffects}
                    {...props}
                />
            )
        });
    };

    onTabClick = type => {
        const { softInfo = {} } = this.props;
        if(softInfo.eventKey) {
            if (type === 'custom') {
                this.roleEffects.setCustomTable(softInfo.eventKey, 'roleTypeName','ASC');
                this.setState({ customRoleSortInfo: {sortField:'roleTypeName',sortOrder: 'ASC' }});
            } else if (type === 'built') {
                this.roleEffects.setbuiltTable(softInfo.eventKey);
            }
        }
        this.setState({
            activeKey: type
        });
    };

    export = () => {
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0029
            ),
            content: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0479
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: () => {
                location.href = `${urls.exportRoleMenu}?appId=edc`;
                // try {
                //     await $http.get(
                //         urls.exportRoleMenu,
                //         { appId: 'edc' },
                //         {
                //             headers: {
                //                 contentType: 'multipart/form-data;charset=UTF-8'
                //             }
                //         }
                //     );
                // } catch (e) {
                //     message.error(
                //         e.message ||
                //             this.props.intl.formatMessage(
                //                 i18nMessages.ECONFIG_FRONT_A0203
                //             )
                //     );
                // }
            }
        });
    };

    render() {
        const { softList, softInfo = {}, roleLoading = false } = this.props;
        const { activeKey, customRoleSortInfo } = this.state;
        const operations =
            softInfo.eventKey === 'edc' ? (
                <Button type="primary" onClick={this.export}>
                    {this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0519
                    )}
                </Button>
            ) : null;
        return (
            <Spin spinning={roleLoading}>
                <RoleManageContainer>
                    <div className="role-manage-left">
                        <div className="role-manage-left-title">
                            <div>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0067
                                )}
                            </div>
                            {/* <Button onClick={this.handleAdd} style={{height:26, padding: '0 8px',borderRadius: 1}} type="primary">新增角色</Button> */}
                        </div>
                        <Menu
                            onClick={this.handleClickMenu}
                            style={{ width: 256 }}
                            selectedKeys={[softInfo.eventKey]}
                            mode="inline"
                        >
                            {softList.map(item => {
                                return (
                                    <Menu.Item key={item.appId}>
                                        {item.appName}
                                    </Menu.Item>
                                );
                            })}
                        </Menu>
                    </div>

                    <div className="role-manage-right">
                        <Tabs
                            activeKey={activeKey}
                            animated={false}
                            tabBarGutter={0}
                            onTabClick={this.onTabClick}
                            tabBarExtraContent={operations}
                        >
                            <Tabs.TabPane
                                tab={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0036
                                )}
                                key="built"
                                forceRender={true}
                            >
                                <BuiltRoleTable
                                    softInfo={softInfo}
                                    softList={softList}
                                />
                            </Tabs.TabPane>
                            <Tabs.TabPane
                                tab={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0035
                                )}
                                key="custom"
                                forceRender={true}
                            >
                                <CustomRoleTable
                                    customRoleSortInfo={customRoleSortInfo}
                                    changeCustomRoleSort={(customRoleSortInfo) => this.setState({customRoleSortInfo})}
                                    softInfo={softInfo}
                                    softList={softList}
                                />
                            </Tabs.TabPane>
                        </Tabs>
                    </div>
                </RoleManageContainer>
            </Spin>
        );
    }
}

export default RoleManage;
