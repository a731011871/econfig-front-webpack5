import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { Tree, Spin, Col, Checkbox, Tabs, Form, Input } from 'antd';
import { isEmpty, find, includes } from 'lodash';
import { i18nMessages } from 'src/i18n';

const { TreeNode } = Tree;
const { TabPane } = Tabs;
const { TextArea } = Input;

@Form.create()
class RoleAuthDrawer extends React.Component {
    state = {
        spinning: true,
        rolePermissionDatas: [],
        currentPageElements: [],
        expandedKeys: [],
        checkedDatas: [],
        tabKey: '1',
        currentPageElementsChecked: [],
        roleTypes: []
    };

    expandedKeys = [];

    componentWillMount = async () => {
        const { roleInfo = {} } = this.props;
        console.log(this.props);
        let checkedDatas = [];
        const result = await $http.post(
            `${urls.listAuthRoleMenu}?isBuiltin=${this.props.isBuiltin}`,
            roleInfo
        );
        const roleTypes = await $http.get(urls.listApplicationRoleType, {
            appId: roleInfo.appId
        });

        this.deepExpandedKeys(result.allMenus || []);
        if (result.menuIds) {
            checkedDatas = result.menuIds;
        } else {
            checkedDatas = [];
            // checkedDatas = this.roleDatasRecursive.map(item => item.code);
        }
        this.setState({
            checkedDatas,
            roleTypes,
            rolePermissionDatas: result && result.allMenus,
            currentPageElementsChecked: (result && result.elementIds) || [],
            spinning: false,
            expandedKeys: this.expandedKeys
        });
    };

    rolePermissionChange = dataSource => {
        return dataSource.map(menu => {
            if (menu.children) {
                return (
                    <TreeNode key={menu.code} item={menu} title={menu.name}>
                        {this.rolePermissionChange(menu.children)}
                    </TreeNode>
                );
            } else {
                return (
                    <TreeNode item={menu} title={menu.name} key={menu.code} />
                );
            }
        });
    };

    onSelect = (
        {},
        {
            node: {
                props: { item }
            }
        }
    ) => {
        if (item.pageElements && item.pageElements.length > 0) {
            const currentPageElements = item.pageElements.map(item => {
                return {
                    label: item.name,
                    value: item.uniqueId
                };
            });
            this.setState({
                currentPageElements
            });
        } else {
            this.setState({
                currentPageElements: []
            });
        }
    };

    deepExpandedKeys = datas => {
        datas.map(item => {
            if (item.children) {
                this.expandedKeys.push(item.code);
                this.deepExpandedKeys(item.children);
            } else {
                this.expandedKeys.push(item.code);
            }
        });
    };

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys
        });
    };

    callback = tabKey => {
        this.setState({ tabKey });
    };

    render() {
        const {
            rolePermissionDatas = [],
            spinning,
            currentPageElements = [],
            currentPageElementsChecked = [],
            expandedKeys = [],
            checkedDatas = [],
            roleTypes = []
        } = this.state;
        const { roleInfo, systemList, projectList = [] } = this.props;
        const formatMessage = this.props.intl.formatMessage;
        return (
            <Tabs defaultActiveKey="1" onChange={this.callback}>
                <TabPane
                    tab={formatMessage(i18nMessages.ECONFIG_FRONT_A0169)}
                    key="1"
                >
                    <Spin spinning={spinning}>
                        {isEmpty(rolePermissionDatas) && !spinning ? (
                            formatMessage(i18nMessages.ECONFIG_FRONT_A0224)
                        ) : (
                            <div className="role-permission">
                                <div>
                                    {/* <h4>
                                        {formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0169
                                        )}
                                    </h4> */}
                                    <div
                                        style={{
                                            height: `${document.documentElement
                                                .clientHeight - 150}px`,
                                            overflowY: 'auto'
                                        }}
                                    >
                                        <Tree
                                            checkable={!this.props.isBuiltin}
                                            checkedKeys={checkedDatas}
                                            onSelect={this.onSelect}
                                            onCheck={null}
                                            onExpand={this.onExpand}
                                            expandedKeys={expandedKeys}
                                        >
                                            {this.rolePermissionChange(
                                                rolePermissionDatas
                                            )}
                                        </Tree>
                                    </div>
                                </div>
                                {currentPageElements.length > 0 ? (
                                    <div>
                                        <h4>
                                            {formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0168
                                            )}
                                        </h4>
                                        <div className="role-permission-content">
                                            {this.props.isBuiltin ? (
                                                currentPageElements.map(
                                                    item => (
                                                        <Col
                                                            span={8}
                                                            key={item.value}
                                                        >
                                                            {item.label}
                                                        </Col>
                                                    )
                                                )
                                            ) : (
                                                <Checkbox.Group
                                                    style={{ width: '100%' }}
                                                    value={
                                                        currentPageElementsChecked
                                                    }
                                                    onChange={
                                                        this
                                                            .onCurrentPageElementChange
                                                    }
                                                >
                                                    {currentPageElements.map(
                                                        item => (
                                                            <Col
                                                                span={8}
                                                                key={item.value}
                                                            >
                                                                <Checkbox
                                                                    value={
                                                                        item.value
                                                                    }
                                                                    disabled
                                                                >
                                                                    {item.label}
                                                                </Checkbox>
                                                            </Col>
                                                        )
                                                    )}
                                                </Checkbox.Group>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </Spin>
                </TabPane>
                <TabPane
                    tab={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0711
                    )}
                    key="2"
                >
                    <Form>
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0712
                            )}
                        >
                            <Input
                                disabled
                                value={
                                    roleInfo.isBuiltin === '1'
                                        ? this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0036
                                          )
                                        : this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0035
                                          )
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0260
                            )}
                        >
                            <Input
                                disabled
                                value={
                                    find(
                                        systemList,
                                        item => item.appId === roleInfo.appId
                                    )?.appName || ''
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0096
                            )}
                        >
                            <Input disabled value={roleInfo.roleName || ''} />
                        </Form.Item>
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0174
                            )}
                        >
                            <Input
                                disabled
                                value={
                                    find(
                                        roleTypes,
                                        item =>
                                            item.roleTypeCode ===
                                            roleInfo.roleType
                                    )?.roleTypeName || ''
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0173
                            )}
                        >
                            <Input disabled value={roleInfo.roleCode || ''} />
                        </Form.Item>
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0175
                            )}
                        >
                            <TextArea
                                rows={4}
                                disabled
                                value={roleInfo.description || ''}
                            />
                        </Form.Item>
                        {(roleInfo.appId === 'edc' ||
                            roleInfo.appId === 'esupply') && (
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0536
                                )}
                            >
                                <Input
                                    disabled
                                    value={projectList
                                        .filter(item =>
                                            includes(
                                                roleInfo.projectIds,
                                                item.id
                                            )
                                        )
                                        .map(item =>
                                            item.projectSerialNo
                                                ? `【${item.projectSerialNo}】${item.projectName}`
                                                : item.projectName
                                        )
                                        .join(',')}
                                />
                            </Form.Item>
                        )}
                        {roleInfo.isBuiltin === '0' && (
                            <Form.Item
                                label={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0579
                                )}
                            >
                                <Input
                                    disabled
                                    value={roleInfo.createTime || ''}
                                />
                            </Form.Item>
                        )}
                    </Form>
                </TabPane>
            </Tabs>
        );
    }
}

export default RoleAuthDrawer;
