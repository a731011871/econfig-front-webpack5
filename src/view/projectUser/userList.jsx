import React from 'react';
import PropTypes from 'prop-types';
import CommonTable from 'tms-common-table1x';
import styled from 'styled-components';
import { Button, Modal, Menu, Input, message, DatePicker } from 'antd';
import moment from 'moment';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import './index.less';

const Search = Input.Search;
const confirm = Modal.confirm;
const AbsoluteDiv = styled.div`
    position: absolute;
    top: 12px;
    right: 0;
`;

//数据为空过滤
function formatEmpty(text) {
    return text ? text : '-';
}

@injectIntl
class UserList extends React.Component {
    static propTypes = {
        showUserInfo: PropTypes.func,
        changeList: PropTypes.func,
        currentMenu: PropTypes.string
    };

    static defaultProps = {
        currentMenu: '1'
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0081
            ),
            width: 200,
            dataIndex: 'userName',
            render: (text, record) => (
                // <span>{text || '—'}</span>
                <a
                    href="javascript:void(0)"
                    onClick={() => {
                        this.props.showUserInfo(record);
                    }}
                >
                    {text || '—'}
                </a>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0490
            ),
            width: 230,
            dataIndex: 'accountName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0083
            ),
            width: 200,
            dataIndex: 'mobile',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0082
            ),
            width: 250,
            dataIndex: 'email',
            render: (text, record) => {
                if (this.props.currentMenu === '1') {
                    return formatEmpty(text);
                }
                return (
                    <a
                        href="javascript:void(0)"
                        onClick={() => {
                            this.props.showUserInfo(record);
                        }}
                    >
                        {text || ''}
                    </a>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0085
            ),
            width: 250,
            dataIndex: 'positionName',
            render: text => text || '-'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0087
            ),
            width: 250,
            key: 'action',
            render: record => {
                return (
                    <div>
                        <a
                            className="mRight15"
                            key="deptUser"
                            href="javascript:void(0)"
                            onClick={() => {
                                this.props.showUserInfo(record);
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0098
                            )}
                        </a>
                        {this.props.currentMenu === '1' ? (
                            <a
                                className="mRight15"
                                key="disabled"
                                href="javascript:void(0)"
                                onClick={() => {
                                    this.removeUser(record);
                                }}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0383
                                )}
                            </a>
                        ) : (
                            <a
                                data-id={
                                    this.props.currentMenu === '1'
                                        ? record.userId
                                        : record.inviteId
                                }
                                data-email={record.email}
                                className="mRight15"
                                href="javascript:void(0)"
                                onClick={this.showRenSendConfirm}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0147
                                )}
                            </a>
                        )}
                    </div>
                );
            }
        }
    ];

    state = {
        loading: false,
        total: 1000,
        activeMemberInfo: {
            id: ''
        },
        pageNo: 1,
        pageSize: 50,
        showMemberInfo: false,
        data: [],
        keyWords: '',
        showDisableByTimeModal: false, // 定时禁用时间弹层
        activeUserId: '', // 选择要定时禁用的用户Id
        disabledTime: '', // 定时禁用的时间
        showDisabledModal: false
    };

    componentWillMount() {
        this.fetchData(this.props.currentMenu);
    }

    handleClick = e => {
        this.fetchData(e.key, this.state.keyWords, 1, this.state.pageSize);
        this.props.changeList(e.key);
    };

    setLoding = () => {
        this.setState({
            loading: !this.state.loading
        });
    };

    fetchData = async (status, content, pageNo, pageSize) => {
        this.setLoding();
        const args = {
            pageNum: pageNo || this.state.pageNo,
            pageSize: pageSize || this.state.pageSize,
            paging: true,
            list: [
                {
                    status,
                    content: content || this.state.keyWords
                }
            ]
        };
        try {
            const data = await $http.post(urls.getProjectUserList, args);
            this.setState({
                data: data.list || [],
                total: data.total || 0,
                pageNo: pageNo || this.state.pageNo,
                pageSize: pageSize || this.state.pageSize
            });
        } catch (e) {
            message.error(e.message);
        }
        this.setLoding();
    };

    // 翻页 排序
    tableOnChange = ({ current = 1, pageSize = 50 }) => {
        this.fetchData(
            this.props.currentMenu,
            this.state.keyWords,
            current,
            pageSize
        );
    };

    addAdmin = async dto => {
        try {
            await $http.post(`${urls.newAdmin}`, dto);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0229)
            );
            this.fetchData(this.props.currentMenu === '1');
        } catch (e) {
            message.error(e.message);
        }
    };

    updateAdmin = async dto => {
        try {
            await $http.post(`${urls.updateAdmin}`, dto);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0230)
            );
            this.fetchData(this.props.currentMenu === '1');
        } catch (e) {
            message.error(e.message);
        }
    };

    removeUser = record => {
        confirm({
            width: 600,
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0383
            ),
            content: (
                <div>
                    <div className="mBottom8">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0659
                        )}
                        <a
                            onClick={() => {
                                this.props.showUserInfo(record);
                                Modal.destroyAll();
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0343
                            )}
                        </a>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0660
                        )}
                    </div>
                    <div>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0658
                        )}
                    </div>
                </div>
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                this.setLoding();
                try {
                    const data = await $http.post(
                        `${urls.deleteProjectUserRelation}?userId=${record.userId}`
                    );
                    if (!data) {
                        message.error(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0380
                            )
                        );
                    } else {
                        message.success(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0219
                            )
                        );
                    }
                    this.fetchData('1');
                } catch (e) {
                    message.error(e.message);
                } finally {
                    this.setLoding();
                }
            }
        });
    };

    showRenSendConfirm = e => {
        const { id, email } = e.target.dataset;
        confirm({
            title: this.props.intl
                .formatMessage(i18nMessages.ECONFIG_FRONT_A0234)
                .replace('xx', email),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    await $http.get(
                        `${urls.resendInviteUser}?id=${id}&isAdmin=false`
                    );
                    this.fetchData('0');
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0235
                        )
                    );
                } catch (e) {
                    message.error(e.message);
                }
            },
            onCancel() {}
        });
    };

    onExport = () => {
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0202
            ),
            content: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0222
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    const result = await $http.post(
                        `${urls.userExport}?isCompanyUser=false`,
                        {
                            keyWord: this.state.keyWords
                        }
                    );
                    // location.href = result.relativeFileUrl;
                    window.open(result.relativeFileUrl);
                } catch (e) {
                    message.error(e.message);
                }
            }
        });
    };

    render() {
        const { loading, total } = this.state;
        let columns = this.columns.concat();
        if (this.props.currentMenu === '0') {
            columns = columns.filter(
                item =>
                    item.title ===
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0082
                        ) ||
                    item.title ===
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0087
                        )
            );
        }
        return (
            <div className="adminList pAll10 Relative">
                <Menu
                    onClick={this.handleClick}
                    selectedKeys={[this.props.currentMenu]}
                    mode="horizontal"
                >
                    <Menu.Item key="1">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0333
                        )}
                    </Menu.Item>
                    <Menu.Item key="0">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0334
                        )}
                    </Menu.Item>
                </Menu>
                {this.state.showDisabledModal && (
                    <Modal
                        className="disabledModal"
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0330
                        )}
                        visible={this.state.showDisabledModal}
                        content={null}
                        width={400}
                        onCancel={() => {
                            this.setState({
                                showDisabledModal: false,
                                activeUserId: ''
                            });
                        }}
                        footer={
                            <div className="footer">
                                <Button
                                    onClick={() => {
                                        this.setState({
                                            showDisableByTimeModal: true,
                                            showDisabledModal: false
                                        });
                                    }}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0239
                                    )}
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={async () => {
                                        this.setState({
                                            showDisabledModal: false
                                        });
                                        this.setLoding();
                                        try {
                                            await $http.get(
                                                `${urls.disableUser}?userId=${this.state.activeUserId}`
                                            );
                                            message.success(
                                                this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0232
                                                )
                                            );
                                            this.fetchData('1');
                                        } catch (e) {
                                            message.error(e.message);
                                        } finally {
                                            this.setLoding();
                                        }
                                    }}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0240
                                    )}
                                </Button>
                            </div>
                        }
                        cancelText={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0239
                        )}
                    />
                )}
                <AbsoluteDiv className="TxtRight">
                    <Search
                        className="mRight15"
                        placeholder={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0241
                        )}
                        value={this.state.keyWords}
                        onChange={e => {
                            this.setState({
                                keyWords: e.target.value
                            });
                        }}
                        onSearch={value => {
                            this.setState({ keyWords: value });
                            this.fetchData(this.props.currentMenu, value, 1);
                        }}
                        style={{ width: 200 }}
                    />
                    {this.props.currentMenu === '1' && (
                        <Button className="mRight15" onClick={this.onExport}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0029
                            )}
                        </Button>
                    )}
                    <Button
                        type="primary"
                        className=" mRight15"
                        onClick={this.props.showUserInfo}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0037
                        )}
                    </Button>
                </AbsoluteDiv>
                {this.state.showDisableByTimeModal && (
                    <Modal
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0239
                        )}
                        visible={this.state.showDisableByTimeModal}
                        onOk={this.doTimeDisableUsers}
                        onCancel={() => {
                            this.setState({
                                showDisableByTimeModal: false,
                                activeUserId: ''
                            });
                        }}
                    >
                        <span className="mRight15">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0242
                            )}
                        </span>
                        <DatePicker
                            className="InlineBlock"
                            disabledDate={current => {
                                return (
                                    current && current < moment().endOf('day')
                                );
                            }}
                            onChange={(data, disabledTime) => {
                                this.setState({ disabledTime });
                            }}
                        />
                    </Modal>
                )}
                {this.props.currentMenu === '1' && (
                    <CommonTable
                        serviceKey="econfigUser"
                        dataSource={this.state.data}
                        columns={columns}
                        onChange={this.tableOnChange}
                        loading={loading}
                        outerFilter={false}
                        total={total}
                        paginationOptions={{
                            size: 'small',
                            current: this.state.pageNo,
                            pageSize: this.state.pageSize,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            defaultPageSize: 50
                        }}
                    />
                )}
                {this.props.currentMenu === '0' && (
                    <CommonTable
                        serviceKey="econfigUser2"
                        dataSource={this.state.data}
                        columns={columns}
                        onChange={this.tableOnChange}
                        loading={loading}
                        outerFilter={false}
                        total={total}
                        paginationOptions={{
                            size: 'small',
                            current: this.state.pageNo,
                            pageSize: this.state.pageSize,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            defaultPageSize: 50
                        }}
                    />
                )}
            </div>
        );
    }
}

export default UserList;
