import React from 'react';
import CommonTable from 'tms-common-table1x';
import styled from 'styled-components';
import { Button, Drawer, Modal, Menu, message, Input } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import MemberInfoDrawer from './memberInfoDrawer';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

const confirm = Modal.confirm;
const Search = Input.Search;
const AbsoluteDiv = styled.div`
    position: absolute;
    top: 12px;
    right: 0;
`;
const OverEllipsisDiv = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
`;

//数据为空过滤
function formatEmpty(text) {
    return text ? text : '-';
}

@injectIntl
class AdminList extends React.Component {
    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0081
            ),
            dataIndex: 'userName',
            width: 200,
            render: (text, record) =>
                record.userProperty === 'TMUser' ||
                record.isProjectAdmin === '1' ? (
                        formatEmpty(text)
                    ) : (
                        <a
                            href="javascript:void(0)"
                            onClick={() => {
                                this.setState({
                                    showMemberInfo: true,
                                    activeMemberInfo: record
                                });
                            }}
                        >
                            {text || ''}
                        </a>
                    )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0082
            ),
            width: 300,
            dataIndex: 'inviteEmail',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0134
            ),
            dataIndex: 'roleName',
            render: text => (
                <OverEllipsisDiv
                    title={text}
                    style={{ wordBreak: 'break-all' }}
                >
                    {text || '-'}
                </OverEllipsisDiv>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0142
            ),
            width: 200,
            key: 'action',
            render: record => {
                return (
                    <div>
                        {this.state.currentMenu === '1' ? (
                            <span>
                                {record.userProperty !== 'TMUser' &&
                                    record.isProjectAdmin !== '1' && (
                                    <a
                                        href="javascript:void(0)"
                                        className="mRight15"
                                        // disabled={record.isCompanyAdmin === '1'}
                                        onClick={() => {
                                            this.setState({
                                                showMemberInfo: true,
                                                activeMemberInfo: record
                                            });
                                        }}
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0098
                                        )}
                                    </a>
                                )}
                                <a
                                    className="mRight15"
                                    href="javascript:void(0)"
                                    // disabled={record.isCompanyAdmin === '1'}
                                    onClick={() => {
                                        this.changeAdminStatus(
                                            record.userId,
                                            record.enabled === '0' ? '1' : '0'
                                        );
                                    }}
                                >
                                    {record.enabled === '0'
                                        ? this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0176
                                        )
                                        : this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0177
                                        )}
                                </a>
                            </span>
                        ) : (
                            <a
                                data-id={record.id}
                                data-email={record.inviteEmail}
                                className="mRight15"
                                // disabled={record.isCompanyAdmin === '1'}
                                href="javascript:void(0)"
                                onClick={this.showRenSendConfirm}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0147
                                )}
                            </a>
                        )}
                        <a
                            data-status={record.status}
                            // disabled={record.isCompanyAdmin === '1'}
                            data-id={
                                record.status === '1'
                                    ? record.userId
                                    : record.id
                            }
                            href="javascript:void(0)"
                            onClick={this.showConfirm}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0145
                            )}
                        </a>
                    </div>
                );
            }
        }
    ];

    state = {
        loading: false,
        activeMemberInfo: {
            id: ''
        },
        showMemberInfo: false,
        data: [],
        currentMenu: '1',
        searchObj: {
            pageNum: 1,
            pageSize: 50
        },
        keyWords: ''
    };

    componentWillMount() {
        this.fetchData(true);
    }

    handleClick = e => {
        this.fetchData(e.key === '1', {
            pageNum: 1,
            pageSize: this.state.searchObj.pageSize
        });
        this.setState({
            currentMenu: e.key
        });
    };

    setLoding = () => {
        this.setState({
            loading: !this.state.loading
        });
    };

    fetchData = async (isActive, searchObj, keyWords) => {
        this.setLoding();
        try {
            const data = await $http.post(
                isActive
                    ? `${urls.getActiveAdminList}?context=${encodeURIComponent(
                        keyWords || this.state.keyWords
                    )}`
                    : urls.getNotActiveAdminList,
                searchObj || this.state.searchObj
            );
            this.setState({
                data,
                keyWords: keyWords || this.state.keyWords,
                searchObj: searchObj || this.state.searchObj
            });
        } catch (e) {
            message.error(e.message);
        }
        this.setLoding();
    };

    hideMemberInfoDrawer = () => {
        this.setState({ showMemberInfo: false, activeMemberInfo: { id: '' } });
    };

    addAdmin = async dto => {
        try {
            await $http.post(`${urls.newAdmin}`, dto);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0229)
            );

            this.fetchData(this.state.currentMenu === '1');
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
            this.fetchData(this.state.currentMenu === '1');
        } catch (e) {
            message.error(e.message);
        }
    };

    changeAdminStatus = async (userId, enabled) => {
        try {
            await $http.get(
                `${urls.checkAdminStatus}?userId=${userId}&enabled=${enabled}`
            );
            message.success(
                enabled === '1'
                    ? this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0231
                    )
                    : this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0232
                    )
            );
            this.fetchData(true);
        } catch (e) {
            message.error(e.message);
        }
    };

    deleteAdmin = async (isActive, id) => {
        try {
            if (isActive) {
                await $http.get(`${urls.delActiveAdmin}?id=${id}`);
            } else {
                await $http.get(`${urls.delNotActiveAdmin}?id=${id}`);
            }
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            this.fetchData(isActive);
        } catch (e) {
            message.error(e.message);
        }
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
                    await $http.get(`${urls.resendInviteUser}?id=${id}`);
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0235
                        )
                    );
                    this.fetchData(false);
                } catch (e) {
                    message.error(e.message);
                }
            },
            onCancel() {}
        });
    };

    showConfirm = e => {
        const _this = this;
        const { status, id } = e.target.dataset;
        confirm({
            title: `${this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0252
            )}?`,
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: () => {
                _this.deleteAdmin(status === '1', id);
            },
            onCancel() {}
        });
    };

    render() {
        const { loading } = this.state;
        const columns =
            this.state.currentMenu === '2'
                ? this.columns.slice(1)
                : this.columns;
        return (
            <div className="adminList pAll10 Relative">
                <Menu
                    onClick={this.handleClick}
                    selectedKeys={[this.state.currentMenu]}
                    mode="horizontal"
                >
                    <Menu.Item key="1">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0064
                        )}
                    </Menu.Item>
                    <Menu.Item key="2">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0065
                        )}
                    </Menu.Item>
                </Menu>
                <AbsoluteDiv className="TxtRight">
                    {this.state.currentMenu === '1' && (
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
                                this.fetchData(
                                    true,
                                    {
                                        pageNum: 1,
                                        pageSize: this.state.searchObj.pageSize
                                    },
                                    value
                                );
                            }}
                            style={{ width: 200 }}
                        />
                    )}
                    <Button
                        type="primary"
                        className=" mRight15"
                        onClick={() => {
                            this.setState({ showMemberInfo: true });
                        }}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0063
                        )}
                    </Button>
                </AbsoluteDiv>
                <Drawer
                    className="memberInfoDrawer"
                    title={
                        this.state.activeMemberInfo.id
                            ? this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0098
                            )
                            : this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0063
                            )
                    }
                    width={600}
                    placement="right"
                    destroyOnClose
                    closable
                    onClose={this.hideMemberInfoDrawer}
                    visible={this.state.showMemberInfo}
                >
                    <MemberInfoDrawer
                        memberInfo={this.state.activeMemberInfo}
                        addAdmin={this.addAdmin}
                        updateAdmin={this.updateAdmin}
                        hideDrawer={this.hideMemberInfoDrawer}
                    />
                </Drawer>
                {this.state.currentMenu === '1' && (
                    <CommonTable
                        serviceKey="cspAdmin"
                        dataSource={this.state.data.list || []}
                        columns={columns}
                        onChange={this.tableOnChange}
                        loading={loading}
                        total={this.state.data.total}
                        outerFilter={false}
                        pagination={true}
                        paginationOptions={{
                            size: 'small',
                            total: this.state.data.total || 0,
                            current: this.state.searchObj.pageNum,
                            pageSize: this.state.searchObj.pageSize,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            defaultPageSize: 50,
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            onChange: (pageNum, pageSize) => {
                                this.fetchData(true, {
                                    pageNum,
                                    pageSize
                                });
                            },
                            onShowSizeChange: (pageNum, pageSize) => {
                                this.fetchData(true, {
                                    pageNum,
                                    pageSize
                                });
                            }
                        }}
                    />
                )}
                {this.state.currentMenu === '2' && (
                    <CommonTable
                        serviceKey="cspAdmin"
                        dataSource={this.state.data.list || []}
                        columns={columns}
                        onChange={this.tableOnChange}
                        loading={loading}
                        outerFilter={false}
                        total={this.state.data.total}
                        pagination={true}
                        paginationOptions={{
                            size: 'small',
                            total: this.state.data.total || 0,
                            current: this.state.searchObj.pageNum,
                            pageSize: this.state.searchObj.pageSize,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            defaultPageSize: 50,
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            onChange: (pageNum, pageSize) => {
                                this.fetchData(false, {
                                    pageNum,
                                    pageSize
                                });
                            },
                            onShowSizeChange: (pageNum, pageSize) => {
                                this.fetchData(false, {
                                    pageNum,
                                    pageSize
                                });
                            }
                        }}
                    />
                )}
            </div>
        );
    }
}

export default AdminList;
