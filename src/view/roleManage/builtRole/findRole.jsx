import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { Tree, Spin, Col } from 'antd';
import { isEmpty } from 'lodash';
import { i18nMessages } from 'src/i18n';

const { TreeNode } = Tree;


class FindRole extends React.Component {

    state = {
        spinning: true,
        expandedKeys: [], // 展开所以节点
        rolePermissionDatas: [],
        currentPageElements: [],
    }

    expandedKeys = []

    async componentWillMount() { 
        const { roleInfo = {} } = this.props;
        const result = await $http.post(urls.listAuthRoleMenu, roleInfo);
        this.deepExpandedKeys(result.allMenus || []);
        console.log(this.expandedKeys);
        this.setState({ 
            rolePermissionDatas: result && result.allMenus, 
            expandedKeys: this.expandedKeys,
            spinning: false 
        });
    }

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

    rolePermissionChange = (dataSource) => {
        return (
            dataSource.map((menu) => {
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
            })
        );
    }

    onSelect = ({}, { node: { props: { item } } }) => {
        if(item.pageElements && item.pageElements.length > 0) {
            const currentPageElements = item.pageElements.map(item => {
                return {
                    label: item.name,
                    value: item.uniqueId
                };
            });
            this.setState({
                currentPageElements,
            });
        }else{
            this.setState({
                currentPageElements : [],
            });
        }
    }

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys
        });
    }
  
    render() {
        const { rolePermissionDatas = [], spinning, currentPageElements = [], expandedKeys = []} = this.state;
        return (
            <Spin spinning={spinning}>
                {
                    isEmpty(rolePermissionDatas) && !spinning ? this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0224) : (
                        <div className="role-permission">
                            <div>
                                <h4>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0169)}</h4>
                                <div style={{height: `${document.documentElement.clientHeight - 180}px`, overflowY: 'auto'}}>
                                    <Tree onSelect={this.onSelect} expandedKeys={expandedKeys} onExpand={this.onExpand}>
                                        {
                                            this.rolePermissionChange(rolePermissionDatas)
                                        }
                                    </Tree> 
                                </div>
                            </div>
                            {
                                currentPageElements.length > 0 ?  
                                    <div>
                                        <h4>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0168)}</h4>
                                        <div style={{maxHeight: `${document.documentElement.clientHeight - 180}px`, overflowY: 'auto'}} className="role-permission-content">
                                            {
                                                currentPageElements.map(
                                                    item => (<Col push={1} span={7} key={item.value}>{item.label}</Col>)
                                                )
                                            }
                                        </div>
                                    </div> : null
                            }
                        </div>
                    )
                }
            </Spin>
        );
    }
}

export default FindRole;