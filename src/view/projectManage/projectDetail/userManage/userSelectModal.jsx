import React from 'react';
import PropTypes from 'prop-types';
import urls from 'utils/urls';
import { find, debounce } from 'lodash';
import { $http } from 'utils/http';
import { message, Select, Row, Modal, Spin } from 'antd';
import {i18nMessages} from 'src/i18n';
import { injectIntl } from 'react-intl';

const Option = Select.Option;

@injectIntl
class userSelectModal extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        hideModal: PropTypes.func,
        history: PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.state = {
            userList: [],
            fetching: false,
            selectUserId: ''
        };
    }

    componentDidMount() {
        this.searchUser();
    }

    searchUser = debounce(async (keyWord) => {
        try {
            this.setState({ fetching: true });
            const userList = await $http.post(urls.getAllCompanyUsers, {
                pageIndex: 1,
                pageSize: 20,
                status: '1',
                userPropertys: ['CompanyUser', 'TMUser', 'OutUser'],
                keyWord: keyWord ||''
            });
            this.setState({ userList, fetching: false });
        } catch (e) {
            message.error(e.message);
        }
    }, 500);

    onOk = () => {
        if (this.state.selectUserId) {
            console.log(this.state.userList);
            const userProperty = find(this.state.userList, item => item.userId === this.state.selectUserId).userProperty;
            this.props.history.push(`${this.props.match.url}/authUser/invite/${this.state.selectUserId}?userProperty=${userProperty}`);
        } else {
            message.error(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0398)
            );
        }
    };

    render() {
        const { fetching } = this.state;
        return (
            <Modal
                title={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0397)}
                width={600}
                visible={this.props.visible}
                onOk={this.onOk}
                confirmLoading={this.state.confirmLoading}
                onCancel={this.props.hideModal}
            >
                <Row>
                    <span className="mRight15">{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0397)}:</span>
                    {this.state.userList && (
                        <Select
                            style={{ width: 400 }}
                            showSearch
                            placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0414)}
                            onSearch={this.searchUser}
                            showArrow={false}
                            defaultActiveFirstOption={false}
                            filterOption={false}
                            onSelect={(selectUserId) => { this.setState({ selectUserId }); }}
                            notFoundContent={
                                fetching ? (
                                    <Spin size="envTypesmall" />
                                ) : (
                                    this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0170
                                    )
                                )
                            }
                        >
                            {this.state.userList.map(item => (
                                <Option key={item.userId} value={item.userId}>
                                    {`${item.userName || ''}${item.userName ? `(${item.accountName})` : item.accountName}`}
                                </Option>
                            ))}
                        </Select>
                    )}
                </Row>
            </Modal>
        );
    }
}

export default userSelectModal;
