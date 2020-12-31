import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import styled from 'styled-components';
import { i18nMessages } from 'src/i18n';
import { TreeSelect, Button } from 'antd';

const TreeNode = TreeSelect.TreeNode;

const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
`;

class departmentDrawer extends React.PureComponent {
    static propTypes = {
        onClose: PropTypes.func,
        selectRecord: PropTypes.array.isRequired, // 选中的授权数据
        addDataItem: PropTypes.func.isRequired,
        departmentList: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedOrganIds: props.selectRecord.organIds || []
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

    saveDepartment = () => {
        const record = cloneDeep(this.props.selectRecord);
        record.organIds = this.state.selectedOrganIds;
        this.props.addDataItem([record]);
        this.props.onClose();
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        const { selectedOrganIds } = this.state;
        return (
            <div className="departmentDrawer">
                <TreeSelect
                    dropdownStyle={{
                        maxHeight: 300,
                        overflow: 'auto'
                    }}
                    value={selectedOrganIds}
                    style={{ width: 400 }}
                    placeholder={formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0707
                    )}
                    allowClear
                    multiple
                    treeDefaultExpandAll
                    onChange={values =>
                        this.setState({ selectedOrganIds: values })
                    }
                >
                    {this.renderTreeNodes(this.props.departmentList)}
                </TreeSelect>
                <AbsoluteDiv>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        onClick={this.saveDepartment}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default departmentDrawer;
