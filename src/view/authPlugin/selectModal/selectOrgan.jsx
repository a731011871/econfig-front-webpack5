import React from 'react';
import PropTypes from 'prop-types';
import { i18nMessages } from 'src/i18n';
import { Modal, TreeSelect } from 'antd';

const TreeNode = TreeSelect.TreeNode;

export default class SelectOrgan extends React.PureComponent {
    static propTypes = {
        selectValue: PropTypes.array,
        visible: PropTypes.bool,
        deparmentList: PropTypes.array,
        onSelectOrgan: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            organIds: []
        };
    }

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode
                        value={item.id}
                        title={item.organizeName}
                        key={item.id}
                        organType={item.organType}
                        parentId={item.parentId || ''}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    value={item.id}
                    key={item.id}
                    parentId={item.parentId || ''}
                    organType={item.organType}
                    title={item.organizeName}
                />
            );
        });

    onOk = () => {
        this.props.onSelectOrgan(this.state.organIds);
    };

    render() {
        const { formatMessage } = this.props;
        return (
            <Modal
                className="roleProjectOrganModal"
                title={formatMessage(i18nMessages.ECONFIG_FRONT_A0641)}
                width={640}
                onOk={this.onOk}
                onCancel={this.props.onCancel}
                visible={this.props.visible}
            >
                <div className="mBottom8">
                    {formatMessage(i18nMessages.ECONFIG_FRONT_A0645)}
                </div>
                <TreeSelect
                    style={{ width: 450 }}
                    dropdownStyle={{
                        maxHeight: 300,
                        overflow: 'auto'
                    }}
                    placeholder={this.props.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0051
                    )}
                    allowClear
                    multiple
                    treeDefaultExpandAll
                    onChange={organIds => this.setState({ organIds })}
                >
                    {this.renderTreeNodes(this.props.departmentList)}
                </TreeSelect>
            </Modal>
        );
    }
}
