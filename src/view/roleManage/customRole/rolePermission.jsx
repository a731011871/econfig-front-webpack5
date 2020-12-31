import React from 'react';
import PropTypes from 'prop-types';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { isEmpty, uniq } from 'lodash';
import { Tree, Spin, message, Checkbox, Col } from 'antd';
import { SaveDom } from 'component/drawer';
import { i18nMessages } from 'src/i18n';

const { TreeNode } = Tree;

class RolePermission extends React.Component {
    static propTypes = {
        isEdit: PropTypes.bool // 是否可编辑
    };

    static defaultProps = {
        isEdit: '0'
    };

    state = {
        spinning: true,
        buttonLoading: false,
        elementDisabled: false,
        rolePermissionDatas: [],
        checkedDatas: [],
        expandedKeys: [],
        currentMenu: {},
        currentPageElements: [],
        currentPageElementsChecked: []
    };

    // 递归全选的数据
    roleDatasRecursive = [];

    // 当前显示的元素
    currentPageElements = [];

    expandedKeys = [];

    async componentWillMount() {
        try {
            let checkedDatas = [];
            const { roleInfo = {} } = this.props;
            const result = await $http.post(
                `${urls.listAuthRoleMenu}?isBuiltin=false`,
                roleInfo
            );
            this.rolePermissionDataRecursive(result && result.allMenus);
            this.deepExpandedKeys(result.allMenus || []);
            if (result.menuIds) {
                checkedDatas = result.menuIds;
            } else {
                checkedDatas = [];
                // checkedDatas = this.roleDatasRecursive.map(item => item.code);
            }
            this.setState({
                checkedDatas,
                expandedKeys: this.expandedKeys,
                currentPageElementsChecked: (result && result.elementIds) || [],
                rolePermissionDatas: result && result.allMenus,
                spinning: false
            });
        } catch (e) {
            message.error(e.message);
        }
    }

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

    // 递归数据方法
    rolePermissionDataRecursive = datas => {
        datas &&
            datas.map(item => {
                if (item.children) {
                    this.rolePermissionDataRecursive(item.children);
                } else {
                    this.roleDatasRecursive.push(item);
                }
            });
    };

    // 递归节点
    rolePermissionRecursive = dataSource => {
        const { isEdit } = this.props;
        return dataSource.map(menu => {
            if (menu.children) {
                return (
                    <TreeNode key={menu.code} item={menu} title={menu.name} disableCheckbox={isEdit === '0'}>
                        {this.rolePermissionRecursive(menu.children)}
                    </TreeNode>
                );
            } else {
                return (
                    <TreeNode item={menu} title={menu.name} key={menu.code} disableCheckbox={isEdit === '0'}/>
                );
            }
        });
    };

    // 当前菜单下的所有节点，包含菜单的子菜单中的节点
    currentMenuAllElement = [];

    getCurrentMenuAllElement = parent => {
        if (parent.pageElements && parent.pageElements.length > 0) {
            parent.pageElements &&
                parent.pageElements.map(item => {
                    this.currentMenuAllElement.push(item.uniqueId);
                });
        }
        if (parent.children && parent.children.length > 0) {
            parent.children.map(item => {
                this.getCurrentMenuAllElement(item);
            });
        }
    };

    /**
     * 父级checkbox没有被选中的时候，子元素被禁用也不能选中
     */
    onCheck = (checkedDatas, checkBoxInfo) => {
        console.log(checkBoxInfo);
        this.currentMenuAllElement = [];
        const {
            node: {
                props: { item = {} }
            }
        } = checkBoxInfo;
        this.getCurrentMenuAllElement(item);
        const { currentPageElementsChecked = [] } = this.state;
        const currentPageElementIds = this.currentMenuAllElement;
        const currentPageElements = currentPageElementsChecked.filter(
            item => currentPageElementIds.indexOf(item) < 0
        );
        //item => checkBoxInfo.checked ? currentPageElementIds.indexOf(item) >= 0 : currentPageElementIds.indexOf(item) < 0
        try {
            this.setState({
                checkedDatas, // 当前左侧选中的树节点
                elementDisabled: checkedDatas.indexOf(this.currentMenu) < 0, // 当前显示的元素是否禁用
                currentPageElementsChecked: currentPageElements // 当前的元素
            });
        } catch (e) {}
    };

    onSelect = (
        currentMenu,
        {
            node: {
                props: { item, halfChecked, checked }
            }
        }
    ) => {
        try {
            if (currentMenu.length > 0) {
                this.currentMenu = currentMenu[0] || '';
                this.setState({
                    // elementDisabled: checkedDatas.indexOf(currentMenu[0]) < 0 || (halfChecked ? true : false)
                    elementDisabled: halfChecked ? false : !checked
                });
            }
        } catch (e) {}

        if (item.pageElements && item.pageElements.length > 0) {
            const currentPageElements = item.pageElements.map(item => {
                return {
                    label: item.name,
                    value: item.uniqueId
                };
            });
            this.currentPageElements = currentPageElements;
            this.setState({
                currentPageElements,
                currentMenu: item
            });
        } else {
            this.setState({
                currentPageElements: [],
                currentMenu: item
            });
        }
    };

    onCurrentPageElementChange = value => {
        const {
            currentPageElements = [],
            currentPageElementsChecked = []
        } = this.state;
        const d = currentPageElements.map(item => item.value);
        const otherElements = currentPageElementsChecked.filter(element => {
            return d.indexOf(element) < 0;
        });
        this.setState({
            currentPageElementsChecked: uniq([...otherElements, ...value])
        });
    };

    // onSaveCurrentElement = () => {
    //     console.log(this.state.currentPageElementsChecked);
    // }

    handleSubmit = async () => {
        const { roleInfo = {}, onClose } = this.props;
        const {
            currentPageElementsChecked = [],
            checkedDatas = []
        } = this.state;
        try {
            this.setState({
                buttonLoading: true
            });
            await $http.post(urls.updateAuthRole, {
                appId: roleInfo.appId,
                id: roleInfo.id,
                menuIds: checkedDatas,
                elements: currentPageElementsChecked
            });
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0230)
            );
            onClose();
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({
                buttonLoading: false
            });
        }
    };

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys
        });
    };

    render() {
        const {
            rolePermissionDatas = [],
            checkedDatas = [],
            expandedKeys = [],
            currentPageElements = [],
            currentPageElementsChecked = [],
            spinning,
            buttonLoading,
            elementDisabled
        } = this.state;
        const { isEdit }  = this.props;
        return (
            <React.Fragment>
                <Spin spinning={spinning}>
                    <div className="role-permission">
                        <div>
                            <h4>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0169
                                )}
                            </h4>
                            <div
                                style={{
                                    height: `${document.documentElement
                                        .clientHeight - 180}px`,
                                    overflowY: 'auto'
                                }}
                            >
                                <Tree
                                    checkable
                                    expandedKeys={expandedKeys}
                                    onCheck={this.onCheck}
                                    onSelect={this.onSelect}
                                    onExpand={this.onExpand}
                                    checkedKeys={checkedDatas}
                                >
                                    {this.rolePermissionRecursive(
                                        rolePermissionDatas
                                    )}
                                </Tree>
                            </div>
                        </div>
                        {currentPageElements.length > 0 ? (
                            <div>
                                <h4>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0168
                                    )}
                                </h4>
                                <div
                                    style={{
                                        maxHeight: `${document.documentElement
                                            .clientHeight - 180}px`,
                                        overflowY: 'auto'
                                    }}
                                    className="role-permission-content"
                                >
                                    <Checkbox.Group
                                        style={{ width: '100%' }}
                                        value={currentPageElementsChecked}
                                        disabled={elementDisabled}
                                        onChange={
                                            this.onCurrentPageElementChange
                                        }
                                    >
                                        {currentPageElements.map(item => (
                                            <Col span={8} key={item.value}>
                                                <Checkbox value={item.value} disabled={isEdit === '0'}>
                                                    {item.label}
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Checkbox.Group>
                                    {/* <div className="role-permission-content-botton">
                                            <Button type="primary" onClick={this.onSaveCurrentElement}>保存</Button>
                                        </div> */}
                                </div>
                            </div>
                        ) : null}
                    </div>
                    {isEmpty(rolePermissionDatas) && !spinning
                        ? this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0224
                        )
                        : null}
                </Spin>
                {isEdit === '1' && !spinning && !isEmpty(rolePermissionDatas) ? (
                    <SaveDom
                        buttonLoading={buttonLoading}
                        onHandleClick={this.handleSubmit}
                        intl={this.props.intl}
                    />
                ) : null}
            </React.Fragment>
        );
    }
}

export default RolePermission;
