import React from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'antd';
import { LoadingHoc } from '../../component/LoadingHoc';

const TreeNode = Tree.TreeNode;
@LoadingHoc
class ModuleView extends React.Component {
    static propTypes = {
        moduleTreeDate: PropTypes.array,
    }

    componentDidMount() {
        this.props.toggleLoading();
        setTimeout(() => {
            this.setState({
                treeData: [
                    {
                        title: 'Expand to load',
                        key: '0',
                        children: [
                            { title: 'child1', key: '0-0' },
                            { title: 'child2', key: '0-1' },
                            { title: 'child3', key: '0-2' },
                            { title: 'child4', key: '0-3' }
                        ]
                    },
                    {
                        title: 'Expand to load',
                        key: '1',
                        children: [
                            { title: 'child1', key: '1-0' },
                            { title: 'child2', key: '1-1' },
                            { title: 'child3', key: '1-2' },
                            { title: 'child4', key: '1-3' }
                        ]
                    },
                    {
                        title: 'Tree Node',
                        key: '2',
                        children: [
                            { title: 'child1', key: '2-0' },
                            { title: 'child2', key: '2-1' },
                            { title: 'child3', key: '2-2' },
                            { title: 'child4', key: '2-3' }
                        ]
                    }
                ]
            });
            this.props.toggleLoading();
        }, 500);
    }

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children) {
                return (
                    <TreeNode title={item.name} key={item.code} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode title={item.name} dataRef={item} key={item.code} />;
        });

    render() {
        return (
            <Tree showLine>{this.renderTreeNodes(this.props.moduleTreeDate)}</Tree>
        );
    }
}

export default ModuleView;
