import React from 'react';
import { Table, message } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import SearchForm from './searchForm';
import { injectIntl } from 'react-intl';
import { i18nMessages } from '../../i18n';

@injectIntl
class userList extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    state = {
        dataSource: [],
        total: 0,
        pageIndex: 1,
        pageSize: 50,
        tableLoading: false,
        searchObj: {},
        sortOrder: 'ASC',
        sortField: 'operateTime',
    }

    fetch = async () => {
        try {
            this.setState({tableLoading: true});
            const result = await $http.post(urls.searchAppTraceLog, {
                pageIndex: this.state.pageIndex,
                pageSize: this.state.pageSize,
                ...this.state.searchObj,
                sortOrder: this.state.sortOrder,
                sortField: this.state.sortField
            });
            this.setState({
                dataSource: result.data || [],
                total: result.total || 0,
            });
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({tableLoading: false});
        }
    };

    tableChange = ({}, filters, { order, field }) => {
        const sortInfo = {
            sortField: field ? field : '',
            sortOrder: order ? (order === 'ascend' ? 'ASC' : 'DESC') : 'ASC'
        };
        this.setState({
            ...sortInfo
        }, () => {
            this.fetch();
        });
    };

    render() {

        const columns = [
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0721
                ),
                dataIndex: 'funcModule',
                width: '200px'
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0722),
                width: '200px',
                dataIndex: 'appId'
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0335),
                width: '200px',
                dataIndex: 'projectName'
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0474),
                width: '200px',
                dataIndex: 'siteName',
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0046),
                width: '200px',
                dataIndex: 'operateUserName'
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0723),
                width: '200px',
                dataIndex: 'operateUserRole'
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0049),
                width: '200px',
                dataIndex: 'operateTime',
                sorter: true,
                sortOrder: this.state.sortOrder
                    ? this.state.sortOrder === 'ASC'
                        ? 'ascend'
                        : 'descend'
                    : false,
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0048),
                width: '200px',
                dataIndex: 'operateContent'
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0724),
                width: '200px',
                dataIndex: 'operateObject',
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0718),
                width: '200px',
                dataIndex: 'operateAct',
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0725),
                width: '200px',
                dataIndex: 'operateColumn',
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0726),
                width: '200px',
                dataIndex: 'modifyBeforeVal'
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0727),
                width: '200px',
                dataIndex: 'modifyAfterVal'
            },
            {
                title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0728),
                width: '200px',
                dataIndex: 'operateClientIp',
            }
        ];
        
        return (
            <div className="pAll10">
                <SearchForm
                    intl={this.props.intl}
                    fetch={(searchObj) => {
                        this.setState({searchObj, pageIndex: 1}, () => {
                            this.fetch();
                        });
                    }}
                />
                <Table
                    dataSource={this.state.dataSource}
                    columns={columns}
                    scroll={{ x: '2800px' }}
                    loading={this.state.tableLoading}
                    onChange={this.tableChange}
                    pagination={{
                        size: 'small',
                        total: this.state.total,
                        showTotal: total =>
                            `${this.props.intl
                                .formatMessage(i18nMessages.ECONFIG_FRONT_A0205)
                                .replace('xx', total)}`,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 50,
                        current: this.state.pageIndex,
                        pageSize: this.state.pageSize,
                        onChange: (pageIndex, pageSize) => {
                            this.setState({ pageIndex, pageSize }, () => {
                                this.fetch();
                            });
                        },
                        onShowSizeChange: (pageIndex, pageSize) => {
                            this.setState({ pageIndex, pageSize }, () => {
                                this.fetch();
                            });
                        }
                    }}
                />
            </div>
        );
    }
}

export default userList;
