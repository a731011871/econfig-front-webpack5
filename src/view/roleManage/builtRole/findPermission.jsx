import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { Tree, Spin, message } from 'antd';
import { i18nMessages } from 'src/i18n';

const { TreeNode } = Tree;

class FindPromission extends React.Component {

    state = {
        spinning: true,
        rolePermissionDatas: [],
        expandedKeys: [],
        checkedDatas: [],
    }

    async componentWillMount() { 
        try{
            const { roleInfo = {} } = this.props;
            const result = await $http.get(`${urls.listAuthGroupRole}?appId=${roleInfo.appId}&roleId=${roleInfo.id}`);
            console.log(result);
            this.deepExpandedKeys(result.allAuthGroups || []);
            this.setState({ 
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
        return (
            dataSource.map((menu) => {
                if (menu.children) {
                    return (
                        <TreeNode key={menu.code} item={menu} title={menu.name}>
                            {this.rolePermissionRecursive(menu.children)}
                        </TreeNode>
                    );
                } else {
                    return (
                        <TreeNode item={menu} title={menu.name} key={menu.code} />
                    );
                }
            })
        );
    }

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys
        });
    }

    render() {
        const { rolePermissionDatas = [], expandedKeys = [], spinning } = this.state;
        return (
            <React.Fragment>
                <Spin spinning={spinning}>
                    <div className="role-permission">
                        <div>
                            <h4>{`${this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0546)}${this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0256)}`}</h4>
                            <div style={{height: `${document.documentElement.clientHeight - 180}px`, overflowY: 'auto'}}>
                                <Tree
                                    expandedKeys={expandedKeys}
                                    onExpand={this.onExpand}
                                >
                                    {
                                        this.rolePermissionRecursive(rolePermissionDatas)
                                    }
                                </Tree> 
                            </div>
                        </div>
                    </div>
                </Spin>
            </React.Fragment>
        );
    }
}

export default FindPromission;