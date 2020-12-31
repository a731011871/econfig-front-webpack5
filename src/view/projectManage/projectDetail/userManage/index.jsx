import React from 'react';
import styled from 'styled-components';
import urls, { parseApiUrl } from 'utils/urls';
import { $http } from 'utils/http';
import { i18nMessages } from 'src/i18n';
import CommonTable from 'tms-common-table1x';
import { formatEmpty } from 'utils/utils';
import { Input, Icon, Popconfirm, message, Button, Modal } from 'antd';
import UserSelectModal from './userSelectModal';

const confirm = Modal.confirm;

const CenterTableContainer = styled.div`
    margin-top: 15px;
    .center-table-header {
        padding: 0 18px;
        display: flex;
        height: 45px;
        justify-content: space-between;
        align-items: center;
    }
    .center-table-body {
        padding: 0 10px;
    }
`;

class UserManage extends React.PureComponent {
    state = {
        dataSource: [],
        loading: true,
        searchValue: '',
        total: 0,
        pageNum: 1,
        pageSize: 50,
        appInfo: {},
        showSelectUserModal: false
    };

    async componentWillMount() {
        try {
            this.setState({ loading: true });
            const {
                match: {
                    params: { id, appId }
                }
            } = this.props;
            const tableData = await $http.post(urls.projectUserList, {
                pageNum: 1,
                pageSize: 50,
                appId,
                keyword: this.state.searchValue,
                projectId: id
            });
            const appInfo = await $http.put(`${urls.getAppInfo}/${appId}`);
            console.log(appInfo);
            this.setState({
                dataSource: tableData.list || [],
                total: tableData.total,
                loading: false,
                pageSize: 50,
                pageNum: 1,
                appInfo
            });
        } catch (e) {
            message.error(e.message);
        }
    }

    fetchData = async ({ pageNum = 1, pageSize = 10 }) => {
        this.setState({ loading: true });
        const {
            match: {
                params: { id, appId }
            }
        } = this.props;
        const tableData = await $http.post(urls.projectUserList, {
            pageNum,
            pageSize,
            appId,
            keyword: this.state.searchValue,
            projectId: id
        });
        this.setState({
            dataSource: tableData.list || [],
            total: tableData.total,
            loading: false,
            pageSize,
            pageNum
        });
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0148
            ),
            width: 150,
            dataIndex: 'accountName',
            render: (text, record) => (
                <a
                    onClick={() => {
                        this.props.history.push(
                            `${this.props.match.url}/authUser/edit/${record.userId}?userProperty=${record.userProperty}`
                        );
                    }}
                >
                    {text}
                </a>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0149
            ),
            minWidth: 140,
            dataIndex: 'userName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0150
            ),
            width: 240,
            dataIndex: 'email',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0223
            ),
            width: 150,
            dataIndex: 'userProperty',
            render: text => {
                if (text === 'CompanyUser') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0626
                            )}
                        </span>
                    );
                } else if (text === 'OutUser') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0006
                            )}
                        </span>
                    );
                } else if (text === 'TMUser') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0006
                            )}
                        </span>
                    );
                } else {
                    return <span>-</span>;
                }
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0151
            ),
            width: 180,
            dataIndex: 'mobile',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0152
            ),
            width: 150,
            dataIndex: 'position',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0153
            ),
            width: 150,
            dataIndex: 'jobNumber',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0255
            ),
            width: 100,
            dataIndex: 'countryName',
            render: (text, record) => {
                const {
                    countryName = '',
                    provinceName = '',
                    cityName = '',
                    countyName = ''
                } = record;
                return (
                    <span>
                        {countryName}
                        {provinceName && `/${provinceName}`}
                        {cityName && `/${cityName}`}
                        {countyName && `/${countyName}`}
                    </span>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0142
            ),
            width: 100,
            dataIndex: 'action',
            render: (text, record) => (
                <span>
                    <Popconfirm
                        title={`${this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0640
                        )}`}
                        onConfirm={() => this.handleDeleteEvent(record.userId)}
                    >
                        <a>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0145
                            )}
                        </a>
                    </Popconfirm>
                </span>
            )
        }
    ];

    // 移除用户
    handleDeleteEvent = async userId => {
        try {
            const { dataSource = [], pageNum, pageSize } = this.state;
            const {
                match: {
                    params: { id, appId }
                }
            } = this.props;
            await $http.post(urls.projectDelUse, {
                userId,
                appId,
                projectId: id
            });
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            if (dataSource.length === 1) {
                this.fetchData({
                    pageSize,
                    pageNum: pageNum === 1 ? 1 : pageNum - 1
                });
            } else {
                this.fetchData({ pageNum, pageSize });
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    tableChange = ({ current = 1, pageSize = 50 }) => {
        this.fetchData({
            pageNum: current,
            pageSize
        });
    };

    // 重置搜索信息
    onReset = () => {
        this.setState(
            {
                searchValue: ''
            },
            () => this.fetchData({})
        );
    };

    // 导出用户列表
    onExport = () => {
        const {
            match: {
                params: { id, appId }
            }
        } = this.props;
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
            async onOk() {
                try {
                    const result = await $http.post(
                        parseApiUrl(urls.exportProjectUser, {
                            appId,
                            projectId: id
                        })
                    );
                    if (result && result.relativeFileUrl) {
                        window.open(result.relativeFileUrl);
                    } else {
                        message.info(
                            this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0203
                            )
                        );
                    }
                } catch (e) {
                    message.error(e.message);
                }
            }
        });
    };

    inviteAuthUser = () => {
        const userInfo = JSON.parse(
            window.sessionStorage.getItem('sso_loginInfo')
        );
        // 如果是项目管理员邀请项目人员，直接跳转页面，不出现人员选择弹层
        if (
            userInfo.userRoles.filter(
                item => item.roleId === 'econfig_project_admin'
            ).length > 0
        ) {
            this.props.history.push(
                `${this.props.match.url}/authUser/invite/0`
            );
            // console.log(this.props.history);
        } else {
            this.setState({
                showSelectUserModal: true
            });
        }
    };

    render() {
        const {
            loading,
            dataSource = [],
            searchValue,
            total,
            pageNum,
            appInfo: { authType }
        } = this.state;
        return (
            <CenterTableContainer>
                <div className="center-table-header">
                    <div className="tms-table-search">
                        <Input
                            value={searchValue}
                            onPressEnter={() => this.fetchData({})}
                            onChange={e => {
                                this.setState({
                                    searchValue: e.target.value
                                });
                            }}
                            style={{ width: '150px' }}
                            placeholder={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0241
                            )}
                        />
                        <Icon
                            type="search"
                            onClick={() => this.fetchData({})}
                        />
                        <a onClick={this.onReset}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0018
                            )}
                        </a>
                    </div>
                    <div>
                        {authType && authType !== '1' && (
                            <Button
                                className="mRight10"
                                type="primary"
                                onClick={this.inviteAuthUser}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0396
                                )}
                            </Button>
                        )}
                        <Button type="primary" onClick={this.onExport}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0029
                            )}
                        </Button>
                    </div>
                </div>
                {this.state.showSelectUserModal && (
                    <UserSelectModal
                        {...this.props}
                        visible={this.state.showSelectUserModal}
                        hideModal={() => {
                            this.setState({ showSelectUserModal: false });
                        }}
                    />
                )}
                <div className="center-table-body">
                    <CommonTable
                        dataSource={dataSource}
                        columns={this.columns}
                        loading={loading}
                        total={total}
                        paginationOptions={{
                            size: 'small',
                            current: pageNum,
                            total,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            defaultPageSize: 50,
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`
                        }}
                        onChange={this.tableChange}
                        outerFilter={false}
                    />
                </div>
            </CenterTableContainer>
        );
    }
}

export default UserManage;
