import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tree, Modal, message } from 'antd';
import { isEqual } from 'lodash';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import { deptItem as DeptItem } from './deptItem';
import { deptService } from 'src/service/deptService';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import DepartmentDrawer from '../departmentModal';
import '../../style.less';

const confirm = Modal.confirm;
const { TreeNode } = Tree;

@injectIntl
class DepartmentListView extends React.PureComponent {
    static propTypes = {
        showDepartmentModal: PropTypes.func,
        changeActiveDepartment: PropTypes.func,
        activeDepartmentId: PropTypes.string,
        tenantType: PropTypes.string,
        deleteDepartment: PropTypes.func,
        toggleLoading: PropTypes.func,
        departmentList: PropTypes.array,
        searchMemberObj: PropTypes.object
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        // Should be a controlled component.
        // console.log('newdepartmentList', nextProps.departmentList);
        // console.log('olddepartmentList', prevState.departmentList);
        if (
            'departmentList' in nextProps &&
            !isEqual(nextProps.departmentList, prevState.departmentList)
        ) {
            return {
                // ...(nextProps.value || {})
                departmentList: nextProps.departmentList || []
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        this.state = {
            expandedKeys: [],
            visible: false,
            departmentList: this.props.departmentList || []
        };
    }

    componentDidMount() {
        this.setState({
            expandedKeys: [this.props.departmentList[0].id]
        });
    }

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys
        });
    };

    onSelect = (selectedKeys, { node }) => {
        this.props.changeActiveDepartment(
            node.props.eventKey,
            node.props.dataRef.organizeCasecadeUserCount
        );
    };

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode
                        title={
                            <DeptItem
                                name={`${item.organizeName}(${item.organizeCasecadeUserCount})`}
                                id={item.id}
                                deleteDept={() => {
                                    this.deleteDeptConfirm(item.id);
                                }}
                                editDept={() => {
                                    this.setState({
                                        visible: true,
                                        selectDeptId: item.id
                                    });
                                }}
                            />
                        }
                        key={item.id}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    key={item.id}
                    dataRef={item}
                    title={
                        <DeptItem
                            name={`${item.organizeName}(${item.organizeCasecadeUserCount})`}
                            id={item.id}
                            deleteDept={() => {
                                this.deleteDeptConfirm(item.id);
                            }}
                            editDept={() => {
                                this.setState({
                                    visible: true,
                                    selectDeptId: item.id
                                });
                            }}
                        />
                    }
                />
            );
        });

    updateDepartment = async departmentInfo => {
        this.setState({ visible: false });
        this.props.toggleLoading();
        try {
            await deptService.updateDepartment(departmentInfo);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0331)
            );
            await this.props.deptManagementEffects.fetchDepartment(
                false,
                this.props.searchMemberObj
            );
            this.props.toggleLoading();
        } catch (e) {
            message.error(e.message);
        }
        // this.deptManagementEffects.updateDepartment(departmentInfo);
    };

    deleteDeptConfirm = deptId => {
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
                _this.props.deleteDepartment(deptId);
            },
            onCancel() {}
        });
    };

    onDragStart = info => {
        console.log('onDragStartNode', info.node.props);
        // expandedKeys 需要受控时设置
        // this.setState({
        //   expandedKeys: info.expandedKeys,
        // });
    };

    onDragEnd = info => {
        console.log('onDragEndNode', info.node.props);
        // expandedKeys 需要受控时设置
        // this.setState({
        //   expandedKeys: info.expandedKeys,
        // });
    };

    onDrop = info => {
        const dragNode = info.dragNode.props;
        console.log('dragNode', dragNode);
        const targetNode = info.node.props;
        console.log('toNode', targetNode);
        const data = [...this.state.departmentList.asMutable({ deep: true })];
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition =
            info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (data, key, callback) => {
            data.forEach((item, index, arr) => {
                if (item.id === key) {
                    return callback(item, index, arr);
                }
                if (item.children) {
                    return loop(item.children, key, callback);
                }
            });
        };

        // Find dragObject
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });
        if (info.dropToGap) return;

        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                item.children.push(dragObj);
            });
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else {
            let ar = [];
            let i = 0;
            loop(data, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0628
            ),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    console.log('newDepartmentList', data);
                    await $http.get(
                        `${urls.changeOrganLevel}/${dragNode.eventKey}/${targetNode.eventKey}`
                    );
                    await this.props.deptManagementEffects.fetchDepartment();
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0219
                        )
                    );
                } catch (e) {
                    message.error(e.message);
                } finally {
                    this.setState({
                        departmentList: this.state.departmentList
                    });
                }
            },
            onCancel: () => {
                this.setState({
                    departmentList: this.state.departmentList
                });
            }
        });
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        return (
            <div className="departmentListView listView BorderRightD boxSizing flexRow flexColumn">
                <div className="header">
                    <span className="Bold Font16 LineHeight32 ">
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0004)}
                    </span>
                    <Button
                        type="primary"
                        className="Right mRight10"
                        onClick={() => {
                            this.props.showDepartmentModal(false);
                        }}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0031)}
                    </Button>
                </div>
                <Modal
                    className="departmentModal"
                    title={formatMessage(i18nMessages.ECONFIG_FRONT_A0098)}
                    width={600}
                    maskClosable
                    destroyOnClose
                    footer={null}
                    onCancel={() => {
                        this.setState({ visible: false });
                    }}
                    visible={this.state.visible}
                >
                    <DepartmentDrawer
                        type="edit"
                        departmentId={this.state.selectDeptId}
                        tenantType={this.props.tenantType}
                        departmentList={this.props.departmentList || []}
                        updateDepartment={this.updateDepartment}
                        hideDrawer={() => {
                            this.setState({ visible: false });
                        }}
                        // departmentInfo={this.props.activeDepartmentInfo}
                        // addDepartment={this.addDepartment}
                    />
                </Modal>
                <Tree
                    onSelect={this.onSelect}
                    draggable
                    // onDragStart={this.onDragStart}
                    // onDragEnd={this.onDragEnd}
                    onDrop={this.onDrop}
                    expandedKeys={this.state.expandedKeys}
                    onExpand={this.onExpand}
                    selectedKeys={[this.props.activeDepartmentId]}
                >
                    {this.renderTreeNodes(this.state.departmentList)}
                </Tree>
            </div>
        );
    }
}

export default DepartmentListView;
