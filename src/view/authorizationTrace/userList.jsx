import React from 'react';
import PropTypes from 'prop-types';
import { Table, message, Tooltip } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { includes, slice, find } from 'lodash';
import styled from 'styled-components';
import SearchForm from './searchForm';
import UserAuthPage from './userAuthPage';
import { LoadingHoc } from '../../component/LoadingHoc';
import { injectIntl } from 'react-intl';
import { i18nMessages } from '../../i18n';
import moment from 'moment/moment';
// import AuthSearchComponent from '../../component/authSearchComponent';

const UserAuthPageBox = styled.div`
    position: fixed;
    top: 50px;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    overflow: scroll;
    z-index: 99;
`;

@LoadingHoc
@injectIntl
class userList extends React.PureComponent {
    static propTypes = {
        defaultSearchParams: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            searchObj: {
                pageIndex: 1,
                pageSize: 50,
                authType: '',
                appId: '',
                projectIds: [],
                roleIds: [],
                cspHospitalIds: [],
                userIds: [],
                operateUserIds: [],
                sortOrder: 'ASC',
                sortField: 'operateTime',
                organIds: [],
                operateTimeStart: moment()
                    .subtract(1, 'month')
                    .format('YYYY-MM-DD 00:00:00'),
                operateTimeEnd: moment().format('YYYY-MM-DD 23:59:59'),
                status: '',
                userProperty: '',
                date: [moment().subtract(1, 'month'), moment()]
            },
            userTotal: 0,
            userList: [],
            showAuthPage: false,
            selectUserId: ''
            // visible: false
        };
    }

    async componentDidMount() {
        try {
            const result = await $http.get(urls.getFilterSoftList);
            const list = result.filter(
                item => item.authType && item.authType !== '-1'
            );
            const { appId } = this.state.searchObj;
            const authType = appId
                ? find(list, item => item.appId === appId).authType
                : list.length > 0
                ? list[0].authType
                : '';
            const searchObj = {
                ...this.state.searchObj,
                authType,
                appId: appId ? appId : list.length > 0 ? list[0].appId : ''
            };
            this.setState({
                systemList: list || [],
                searchObj
            });
            this.fetchMember(searchObj);
        } catch (e) {
            message.error(e.message);
        }
    }

    tableChange = ({}, filters, { order, field }) => {
        const sortInfo = {
            sortField: field ? field : '',
            sortOrder: order ? (order === 'ascend' ? 'ASC' : 'DESC') : 'ASC'
        };
        this.fetchMember({ ...this.state.searchObj, ...sortInfo });
    };

    fetchMember = async searchObj => {
        console.log(searchObj);
        this.setState({ searchObj });
        try {
            this.props.toggleLoading();
            const userResult = await $http.post(urls.getAuthTraceList, {
                ...searchObj,
                ...{
                    projectIds: searchObj.projectIds?.map(item => item.key),
                    cspHospitalIds: searchObj.cspHospitalIds?.map(
                        item => item.key
                    ),
                    roleIds: searchObj.roleIds?.map(item => item.key),
                    userIds: searchObj.userIds?.map(item => item.key)
                }
            });
            this.setState({
                userList: userResult.data || [],
                userTotal: userResult.total || 0
            });
        } catch (e) {
            message.error(e.message);
        } finally {
            this.props.toggleLoading();
        }
    };

    getTableContent = text => {
        if (text.length > 2) {
            return (
                <Tooltip
                    placement="bottom"
                    overlayStyle={{
                        maxHeight: 150,
                        overflow: 'scroll'
                    }}
                    title={text.join(', ')}
                >
                    <div>{slice(text, 0, 3).join(', ')}</div>
                </Tooltip>
            );
        } else {
            return <div>{slice(text, 0, 3).join(', ')}</div>;
        }
    };

    render() {
        // const { visible } = this.state;
        const { defaultSearchParams = {} } = this.props;
        const { sortOrder, authType } = this.state.searchObj;
        const columns = [
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0478
                ),
                width: 150,
                dataIndex: 'operateUserName'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0730
                ),
                width: 200,
                sorter: true,
                sortOrder: sortOrder
                    ? sortOrder === 'ASC'
                        ? 'ascend'
                        : 'descend'
                    : false,
                dataIndex: 'operateTime'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0718
                ),
                width: 100,
                dataIndex: 'actionName'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0081
                ),
                dataIndex: 'userName',
                width: 120
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0082
                ),
                width: 200,
                dataIndex: 'email'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0148
                ),
                width: 200,
                dataIndex: 'accountName'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0257
                ),
                width: 100,
                dataIndex: 'appName'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0335
                ),
                width: 250,
                dataIndex: 'projectName',
                render: (text, record) => {
                    if (record.projectId === 'ALL') {
                        return this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0302
                        );
                    } else if (
                        record.appId === 'esupply' &&
                        record.projectId === ''
                    ) {
                        return 'All Projects';
                    } else if (record.projectId === 'NONE') {
                        return this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0732
                        );
                    }
                    return text;
                }
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0335
                ),
                width: 250,
                dataIndex: 'authProjectName'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0584
                ),
                width: 250,
                dataIndex: 'authAppName'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0287
                ),
                width: 200,
                dataIndex: 'envName',
                render: (text, record) =>
                    record.envId === 'ALL'
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0627
                          )
                        : text
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0134
                ),
                width: 130,
                dataIndex: 'roleName'
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0474
                ),
                width: 180,
                dataIndex: 'siteName',
                render: (text, record) =>
                    record.siteId === 'ALL'
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0714
                          )
                        : record.siteId === 'NONE'
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0733
                          )
                        : text
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0475
                ),
                width: 180,
                dataIndex: 'productName'
                // render: text => text && this.getTableContent(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0476
                ),
                width: 180,
                dataIndex: 'storeRoomName',
                render: (text, record) =>
                    record.storeRoomId === 'ALL'
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0342
                          )
                        : record.storeRoomId === 'NONE'
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0734
                          )
                        : text
                // render: text => text && this.getTableContent(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0705
                ),
                width: 180,
                dataIndex: 'organName',
                render: (text, record) =>
                    record.organId === 'ALL'
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0709
                          )
                        : record.organId === 'NONE'
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0735
                          )
                        : text
                // render: text => text && this.getTableContent(text)
            }
        ];
        console.log(authType);
        let dataIndexs = [
            'operateUserName',
            'userName',
            'email',
            'appName',
            'changeDate',
            'roleName',
            'status',
            'userProperty',
            'operateTime',
            'actionName'
        ];
        if (authType === '2') {
            dataIndexs = dataIndexs.concat(['projectName']);
        } else if (authType === '3') {
            dataIndexs = dataIndexs.concat(['productName', 'projectName']);
        } else if (includes(['4', '6'], authType)) {
            dataIndexs = dataIndexs.concat(['projectName', 'siteName']);
        } else if (authType === '5') {
            dataIndexs = dataIndexs.concat(['projectName', 'storeRoomName']);
        } else if (authType === '7') {
            dataIndexs = dataIndexs.concat([
                'envName',
                'projectName',
                'siteName',
                'storeRoomName'
            ]);
        } else if (authType === '8') {
            dataIndexs = dataIndexs.concat([
                'envName',
                'projectName',
                'siteName'
            ]);
        } else if (authType === '9') {
            dataIndexs = dataIndexs.concat(['authAppName', 'authProjectName']);
        } else if (authType === '10') {
            dataIndexs = dataIndexs.concat(['organName']);
        }
        const useColumns = columns.filter(item =>
            includes(dataIndexs, item.dataIndex)
        );
        return (
            <div className="pAll10">
                {/* <Button
                    onClick={() => {
                        this.setState({ visible: true });
                    }}
                >
                    asdasd
                </Button> */}
                {/* {visible && (
                    <AuthSearchComponent
                        intl={this.props.intl}
                        appId="pv2"
                        defaultSearchParams={{
                            projectInfo: {
                                key: '2c94a528723a058701724ab42988011b',
                                label: 'asdasd',
                            },
                            roleInfo: null,
                            siteInfo: null,
                            userInfo: {
                                key: 'asdasdasdasd',
                                label: 'lei.zhao@mobilemd.cn'
                            }
                        }}
                        visible={visible}
                        onCancel={() => this.setState({ visible: false })}
                    />
                )} */}
                <SearchForm
                    defaultSearchParams={defaultSearchParams}
                    searchObj={this.state.searchObj}
                    fetchMember={this.fetchMember}
                    toggleLoading={this.props.toggleLoading}
                    intl={this.props.intl}
                />
                <Table
                    key={this.state.searchObj.authType}
                    pagination={{
                        size: 'small',
                        total: this.state.userTotal || 0,
                        showTotal: total =>
                            `${this.props.intl
                                .formatMessage(i18nMessages.ECONFIG_FRONT_A0205)
                                .replace('xx', total)}`,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 50,
                        current: this.state.searchObj.pageIndex,
                        pageSize: this.state.searchObj.pageSize,
                        onChange: (pageIndex, pageSize) => {
                            this.fetchMember({
                                ...this.state.searchObj,
                                pageIndex,
                                pageSize
                            });
                        },
                        onShowSizeChange: (pageIndex, pageSize) => {
                            this.fetchMember({
                                ...this.state.searchObj,
                                pageIndex,
                                pageSize
                            });
                        }
                    }}
                    dataSource={this.state.userList}
                    columns={useColumns}
                    onChange={this.tableChange}
                    scroll={{ x: 'auto' }}
                />
                {this.state.showAuthPage && (
                    <UserAuthPageBox className="userAuthPageBox">
                        <UserAuthPage
                            {...this.props}
                            userId={this.state.selectUserId}
                            hideAuthPage={isDelete => {
                                this.setState({
                                    showAuthPage: false,
                                    selectUserId: ''
                                });
                                if (isDelete) {
                                    this.fetchMember(this.state.searchObj);
                                }
                            }}
                        />
                    </UserAuthPageBox>
                )}
            </div>
        );
    }
}

export default userList;
