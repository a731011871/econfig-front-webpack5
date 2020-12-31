import React from 'react';
import PropTypes from 'prop-types';
import { Modal, TreeSelect, message, Select, Row } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
const TreeNode = TreeSelect.TreeNode;

const Option = Select.Option;

@injectIntl
class toDeptUserModal extends React.PureComponent {
    static propTypes = {
        userId: PropTypes.string,
        hideModal: PropTypes.func
    };

    state = {
        confirmLoading: false,
        organId: '',
        deptList: [],
        positionList: []
    };

    componentWillMount = async () => {
        try {
            const deptList = await $http.get(urls.getDeptList);
            const positionList = await $http.post(urls.getPositionList, {
                dictTypeName: '用户职位'
            });
            this.setState({ deptList, positionList });
        } catch (e) {
            message.error(e.message);
        }
    };

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode
                        title={`${item.organizeName}`}
                        value={item.id}
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
                    value={item.id}
                    title={`${item.organizeName}`}
                />
            );
        });

    onOk = async () => {
        if (this.state.organId) {
            this.setState({ confirmLoading: true });
            try {
                await $http.get(
                    `${urls.toDeptUser}/${this.state.organId}/${
                        this.props.userId
                    }?position=${this.state.position || ''}`
                );
                message.success(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0219
                    )
                );
                this.props.hideModal();
            } catch (e) {
                message.error(e.message);
            } finally {
                this.setState({ confirmLoading: false });
            }
        } else if (!this.state.organId) {
            message.error(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0361)
            );
            this.setState({ confirmLoading: false });
        }
    };

    render() {
        return (
            <Modal
                title={this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0305
                )}
                width={600}
                visible={this.props.visible}
                onOk={this.onOk}
                confirmLoading={this.state.confirmLoading}
                onCancel={this.props.hideModal}
            >
                <Row>
                    <span className="mRight15">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0306
                        )}
                        :
                    </span>
                    {this.state.deptList && (
                        <TreeSelect
                            style={{ width: 400 }}
                            dropdownStyle={{
                                maxWidth: 400,
                                maxHeight: 200,
                                overflow: 'auto'
                            }}
                            value={this.state.organId}
                            allowClear
                            onSelect={value => {
                                this.setState({
                                    organId: value
                                });
                            }}
                            treeDefaultExpandAll
                        >
                            {this.renderTreeNodes(this.state.deptList)}
                        </TreeSelect>
                    )}
                </Row>
                <Row className="mTop15">
                    <span className="mRight15">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0079
                        )}
                        :
                    </span>
                    {this.state.positionList && (
                        <Select
                            style={{ width: 400 }}
                            onSelect={value => {
                                this.setState({ position: value });
                            }}
                        >
                            {this.state.positionList.map(item => (
                                <Option key={item.id}>{item.name}</Option>
                            ))}
                        </Select>
                    )}
                </Row>
            </Modal>
        );
    }
}

export default toDeptUserModal;
