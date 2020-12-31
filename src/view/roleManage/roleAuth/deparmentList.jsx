import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'antd';
const TreeNode = Tree.TreeNode;

const deparmentList = props => {
    const { departmentList } = props;
    const [expandedKeys, setExpandedKeys] = useState([]);
    const renderTreeNodes = data =>
        data.map(item => {
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode
                        title={item.organizeName}
                        key={item.id}
                        dataRef={item}
                    >
                        {renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    key={item.id}
                    dataRef={item}
                    title={item.organizeName}
                />
            );
        });
    const onSelect = (selectedKeys, { node }) => {
        this.props.changeSelectDept(node.props.eventKey);
    };
    const onExpand = expandedKeys => {
        setExpandedKeys(expandedKeys);
    };
    return (
        <Tree
            onSelect={onSelect}
            expandedKeys={expandedKeys}
            onExpand={onExpand}
        >
            {renderTreeNodes(departmentList)}
        </Tree>
    );
};

deparmentList.propTypes = {
    departmentList: PropTypes.array.isRequired,
    changeSelectDept: PropTypes.func.isRequired
};

export default deparmentList;
