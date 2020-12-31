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
        const { defaultSearchParams = {} } = props;
        const {
            appId = '',
            projectInfo,
            roleInfo,
            siteInfo,
            userInfo
        } = defaultSearchParams;
        this.state = {
            searchObj: {
                pageIndex: 1,
                pageSize: 50,
                authType: '',
                appId,
                projectIds: projectInfo ? [projectInfo] : [],
                roleIds: roleInfo ? [roleInfo] : [],
                siteIds: siteInfo ? [siteInfo] : [],
                userIds: userInfo ? [userInfo] : [],
                startTime:
                    projectInfo || roleInfo || siteInfo || userInfo
                        ? ''
                        : moment()
                            .subtract(1, 'year')
                            .format('YYYY-MM-DD HH:mm:ss'),
                endTime:
                    projectInfo || roleInfo || siteInfo || userInfo
                        ? ''
                        : moment().format('YYYY-MM-DD HH:mm:ss'),
                status: '',
                userProperty: '',
                date:
                    projectInfo || roleInfo || siteInfo || userInfo
                        ? []
                        : [moment().subtract(1, 'year'), moment()]
            },
            userTotal: 0,
            userList: [],
            showAuthPage: false,
            selectUserId: ''
            // visible: false
        };
    }

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0081
            ),
            dataIndex: 'userName',
            width: 120,
            render: (userName, record) => {
                console.log(record);
                return (
                    <a
                        onClick={() => {
                            // this.props.history.push(`${this.props.match.path}/${record.userId}`);
                            // this.props.history.push({
                            //     pathname: `${this.props.match.path}/${
                            //         record.userId
                            //     }`,
                            //     searchObj: this.state.searchObj
                            // });
                            this.setState({
                                showAuthPage: true,
                                selectUserId: record.userId
                            });
                        }}
                    >
                        {userName}
                    </a>
                );
            }
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
            dataIndex: 'projectNames',
            render: text => text && this.getTableContent(text)
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
            dataIndex: 'authApp'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0287
            ),
            width: 200,
            dataIndex: 'envName'
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
            dataIndex: 'siteNames',
            render: text => text && this.getTableContent(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0475
            ),
            width: 180,
            dataIndex: 'productNames',
            render: text => text && this.getTableContent(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0476
            ),
            width: 180,
            dataIndex: 'storageNames',
            render: text => text && this.getTableContent(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0477
            ),
            width: 150,
            dataIndex: 'changeDate'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0478
            ),
            width: 150,
            dataIndex: 'authUserName'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0473
            ),
            width: 150,
            dataIndex: 'status',
            render: text => {
                if (text === '已激活') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0273
                            )}
                        </span>
                    );
                } else if (text === '未激活') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0274
                            )}
                        </span>
                    );
                }
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0223
            ),
            width: 150,
            dataIndex: 'userProperty',
            render: text => {
                if (text === '内部用户') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0589
                            )}
                        </span>
                    );
                } else if (text === '外部用户') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0006
                            )}
                        </span>
                    );
                }
            }
        }
    ];

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

    fetchMember = async searchObj => {
        console.log(searchObj);
        this.setState({ searchObj });
        try {
            this.props.toggleLoading();
            const userResult = await $http.post(urls.getAuthSearchList, {
                ...searchObj,
                ...{
                    projectIds: searchObj.projectIds?.map(item => item.key),
                    siteIds: searchObj.siteIds?.map(item => item.key),
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
        const authType = this.state.searchObj.authType;
        console.log(authType);
        let dataIndexs = [
            'tenantName',
            'userName',
            'email',
            'appName',
            'changeDate',
            'authUserName',
            'roleName',
            'status',
            'userProperty'
        ];
        if (authType === '2') {
            dataIndexs = dataIndexs.concat(['projectNames']);
        } else if (authType === '3') {
            dataIndexs = dataIndexs.concat(['productNames', 'projectNames']);
        } else if (includes(['4', '6'], authType)) {
            dataIndexs = dataIndexs.concat(['projectNames', 'siteNames']);
        } else if (authType === '5') {
            dataIndexs = dataIndexs.concat(['projectNames', 'storageNames']);
        } else if (authType === '7') {
            dataIndexs = dataIndexs.concat([
                'envName',
                'projectNames',
                'siteNames',
                'storageNames'
            ]);
        } else if (authType === '8') {
            dataIndexs = dataIndexs.concat([
                'envName',
                'projectNames',
                'siteNames'
            ]);
        } else if (authType === '9') {
            dataIndexs = dataIndexs.concat(['authApp', 'authProjectName']);
        }
        const columns = this.columns.filter(item =>
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
                    columns={columns}
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
