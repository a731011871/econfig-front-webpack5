import React from 'react';
import PropTypes from 'prop-types';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { isEmpty } from 'lodash';
import { Tree, Spin, message } from 'antd';
import { SaveDom } from 'component/drawer';
import { i18nMessages } from 'src/i18n';

const { TreeNode } = Tree;

class PromissionGroup extends React.Component {

    static propTypes = {
        isEdit: PropTypes.bool // 是否可编辑
    }

    static defaultProps = {
        isEdit: '0'
    }

    state = {
        spinning: true,
        buttonLoading: false,
        rolePermissionDatas: [],
        expandedKeys: [],
        checkedDatas: [],
    }

    async componentWillMount() { 
        try{
            let checkedDatas = [];
            const { roleInfo = {} } = this.props;
            console.log(roleInfo);
            const result = await $http.get(`${urls.listAuthGroupRole}?appId=${roleInfo.appId}&roleId=${roleInfo.id}`);
            console.log(result);
            this.deepExpandedKeys(result.allAuthGroups || []);
            if(result.authGroupCodes) {
                checkedDatas = result.authGroupCodes;
            }else {
                checkedDatas = [];
            }
            this.setState({ 
                checkedDatas,
                expandedKeys: this.expandedKeys,
                rolePermissionDatas: result && result.allAuthGroups, 
                spinning: false 
            });
        }catch(e) {
            message.error(e.message);
        }
    }

    expandedKeys = []

    deepExpandedKeys = (datas) => {
        datas.map(item => {
            if(item.children) {
                this.expandedKeys.push(item.code);
                this.deepExpandedKeys(item.children);
            } else {
                this.expandedKeys.push(item.code);
            }
        });
    }

    // 递归节点
    rolePermissionRecursive = (dataSource) => {
        const { isEdit } = this.props;
        return (
            dataSource.map((menu) => {
                if (menu.children) {
                    return (
                        <TreeNode key={menu.code} item={menu} title={menu.name} disableCheckbox={isEdit === '0'}>
                            {this.rolePermissionRecursive(menu.children)}
                        </TreeNode>
                    );
                } else {
                    return (
                        <TreeNode item={menu} title={menu.name} key={menu.code} disableCheckbox={isEdit === '0'} />
                    );
                }
            })
        );
    }

    /**
     * 父级checkbox没有被选中的时候，子元素被禁用也不能选中
     */
    onCheck = (checkedDatas, checkBoxInfo) => {
        console.log(checkBoxInfo);
        try{
            this.setState({ 
                checkedDatas, // 当前左侧选中的树节点
            });
        }catch(e) {}
    }

    handleSubmit = async () => {
        const { roleInfo = {}, onClose } = this.props;
        const { checkedDatas = [] } = this.state;
        try{
            this.setState({
                buttonLoading: true
            });
            await $http.post(urls.updateAuthGroupRole, {
                appId: roleInfo.appId,
                roleId: roleInfo.id,
                authGroupCodes: checkedDatas,
            });
            message.success(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0230));
            onClose();
        }catch(e) {
            message.error(e.message);
        }finally{
            this.setState({
                buttonLoading: false
            });
        }
    }

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys
        });
    }

    render() {
        const { rolePermissionDatas = [], checkedDatas = [], expandedKeys = [], spinning, buttonLoading } = this.state;
        const { isEdit } = this.props;
        return (
            <React.Fragment>
                <Spin spinning={spinning}>
                    <div className="role-permission">
                        <div>
                            <h4>{`${this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0546)}${this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0256)}`}</h4>
                            <div style={{height: `${document.documentElement.clientHeight - 180}px`, overflowY: 'auto'}}>
                                <Tree
                                    checkable
                                    expandedKeys={expandedKeys}
                                    onExpand={this.onExpand}
                                    onCheck={this.onCheck}
                                    checkedKeys={checkedDatas}
                                >
                                    {
                                        this.rolePermissionRecursive(rolePermissionDatas)
                                    }
                                </Tree> 
                            </div>
                        </div>
                    </div>
                </Spin>
                {
                    isEdit === '1' && !spinning && !isEmpty(rolePermissionDatas) ? <SaveDom buttonLoading={buttonLoading} onHandleClick={this.handleSubmit} intl={this.props.intl} /> : null
                }
            </React.Fragment>
        );
    }
}

export default PromissionGroup;