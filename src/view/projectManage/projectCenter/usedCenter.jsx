import React from 'react';
import styled from 'styled-components';
import urls, { parseApiUrl } from 'utils/urls';
import { $http } from 'utils/http';
import { debounce, intersection } from 'lodash';
import CommonTable from 'tms-common-table1x';
import { formatEmpty } from 'utils/utils';
import { i18nMessages } from 'src/i18n';
import { Input, Icon, Divider, message, Modal } from 'antd';
import { drawerFun } from 'component/drawer';
import EditCenter from './editCenter';
import AuthSearchComponent from 'src/component/authSearchComponent';

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

class UsedCenter extends React.PureComponent {
    state = {
        dataSource: [],
        loading: true,
        searchValue: '',
        total: 0,
        pageSize: 50,
        pageIndex: 1,
        showAuthSearch: false,
        authSearchParams: {}
    };

    componentWillMount() {
        this.fetchData();
    }

    fetchData = async () => {
        try {
            this.setState({ loading: true });
            const { pageIndex, pageSize, searchValue } = this.state;
            const {
                match: {
                    params: { id }
                }
            } = this.props;
            const tableData = await $http.post(urls.getAssignedSiteList, {
                pageIndex,
                pageSize,
                aliasNameOrSecondaryCode: searchValue,
                projectId: id
            });
            this.setState({
                dataSource: tableData.data || [],
                total: tableData.total,
                pageIndex,
                pageSize,
                loading: false
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0218
            ),
            // width: 150,
            dataIndex: 'secondaryCode',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0265
            ),
            // width: '150px',
            dataIndex: 'siteName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0214
            ),
            // width: 200,
            dataIndex: 'aliasName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0091
            ),
            // width: 200,
            dataIndex: 'address',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0154
            ),
            width: 120,
            dataIndex: 'countryName',
            render: text => 
                formatEmpty(text)
            
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0210
            ),
            width: 120,
            dataIndex: 'professionName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0215
            ),
            width: 100,
            dataIndex: 'isTest',
            render: text => {
                return text === 1
                    ? this.props.intl.formatMessage(
                          i18nMessages.ECONFIG_FRONT_A0590
                      )
                    : this.props.intl.formatMessage(
                          i18nMessages.ECONFIG_FRONT_A0591
                      );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0216
            ),
            width: 100,
            dataIndex: 'mainCraName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0217
            ),
            width: 100,
            dataIndex: 'mainPiName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0097
            ),
            width: '160px',
            dataIndex: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.onDistributionEdit(record)}>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0098
                        )}
                    </a>
                    <Divider type="vertical" />
                    {/* <Popover
                        placement="leftBottom"
                        // title={`${this.props.intl.formatMessage(
                        //     i18nMessages.ECONFIG_FRONT_A0267
                        // )}[${record.siteName}]`}
                        content={() => this.deleteSite(record)}
                        onConfirm={() => this.handleDeleteEvent(record)}
                    > */}
                    <a onClick={() => this.deleteSite(record)}>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0212
                        )}
                    </a>
                    {/* </Popover> */}
                </span>
            )
        }
    ];

    deleteSite = debounce(
        async siteInfo => {
            try {
                const authSoftList = await $http.get(urls.listSiteSoft, {
                    siteId: siteInfo.siteId
                });
                if (authSoftList && authSoftList.length > 0) {
                    Modal.info({
                        title: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0202
                        ),
                        content: (
                            <div style={{ wordBreak: 'break-all' }}>
                                <div className="mBottom8">
                                    {parseApiUrl(
                                        this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0663
                                        ),
                                        {
                                            apps: authSoftList
                                                .map(t => t.appName)
                                                .join(',')
                                        }
                                    )}
                                </div>
                                <div>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0655
                                    )}
                                    <a
                                        onClick={() =>
                                            this.showAuthSearch(
                                                siteInfo,
                                                authSoftList.map(
                                                    item => item.appId
                                                )
                                            )
                                        }
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0466
                                        )}
                                    </a>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0664
                                    )}
                                </div>
                            </div>
                        ),
                        okText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        ),
                        onOk() {}
                    });
                } else {
                    confirm({
                        title: `${this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0267
                        )}【${siteInfo.siteName || siteInfo.aliasName}】？`,
                        okText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        ),
                        cancelText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0281
                        ),
                        onOk: () => this.handleDeleteEvent(siteInfo)
                    });
                }
            } catch (error) {
                message.error(error.message);
            }
        },
        800,
        { leading: true, trailing: false }
    );

    handleDeleteEvent = async record => {
        try {
            const {
                match: {
                    params: { appId }
                }
            } = this.props;
            const { dataSource = [], pageIndex } = this.state;
            await $http.delete(`${urls.delSite}/${appId}/${record.id}`);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            if (dataSource.length === 1 && pageIndex !== 1) {
                this.setState({ pageIndex: pageIndex - 1 }, () => {
                    this.fetchData();
                });
            } else {
                this.fetchData();
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    showAuthSearch = async (siteInfo, appIds) => {
        try {
            const result = await $http.get(urls.getFilterSoftList);
            const allAppIds = result.map(item => item.appId);
            const s = intersection(allAppIds, appIds);
            if (s.length > 0) {
                this.setState({
                    showAuthSearch: true,
                    authSearchParams: {
                        appId: s[0],
                        defaultSearchParams: {
                            siteInfo: {
                                key: siteInfo.hospitalId,
                                label: siteInfo.siteName
                            },
                            projectInfo: {
                                key: siteInfo.projectId,
                                label: localStorage.getItem('projectName')
                            }
                        }
                    }
                });
            } else {
                message.info(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0671
                    )
                );
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    onDistributionEdit = record => {
        const { allUsedCenterEvent } = this.props;
        console.log(allUsedCenterEvent);
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0098
            ),
            width: 550,
            compontent: props => (
                <EditCenter
                    isEdit={true}
                    allUsedCenterEvent={allUsedCenterEvent}
                    usedFetchData={this.fetchData}
                    centerInfo={record}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    tableChange = ({ current = 1, pageSize = 50 }) => {
        this.setState(
            {
                pageIndex: current,
                pageSize
            },
            () => this.fetchData()
        );
    };

    onReset = () => {
        this.setState(
            {
                searchValue: ''
            },
            () => this.fetchData()
        );
    };

    onExport = () => {
        const {
            match: {
                params: { id }
            }
        } = this.props;
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0202
            ),
            content: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0384
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            async onOk() {
                try {
                    const result = await $http.post(urls.exportAssignedSite, {
                        projectId: id
                    });
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

    render() {
        const {
            loading,
            dataSource = [],
            searchValue,
            pageIndex,
            total,
            pageSize,
            showAuthSearch,
            authSearchParams
        } = this.state;

        return (
            <CenterTableContainer>
                {showAuthSearch && (
                    <AuthSearchComponent
                        visible={showAuthSearch}
                        intl={this.props.intl}
                        appId={authSearchParams.appId}
                        defaultSearchParams={
                            authSearchParams.defaultSearchParams
                        }
                        onCancel={() =>
                            this.setState({
                                showAuthSearch: false,
                                authSearchParams: {}
                            })
                        }
                    />
                )}
                <div className="center-table-header">
                    <div>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0268
                        )}
                    </div>
                    <div className="tms-table-search">
                        <a className="action-export" onClick={this.onExport}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0029
                            )}
                        </a>
                        <Input
                            value={searchValue}
                            onPressEnter={() => this.fetchData()}
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
                        <Icon type="search" onClick={() => this.fetchData()} />
                        <a onClick={this.onReset}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0018
                            )}
                        </a>
                    </div>
                </div>
                <div className="center-table-body">
                    <CommonTable
                        dataSource={dataSource}
                        columns={this.columns}
                        loading={loading}
                        scroll={{ y: 240 }}
                        total={total}
                        paginationOptions={{
                            size: 'small',
                            pageSize,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            current: pageIndex
                        }}
                        onChange={this.tableChange}
                        outerFilter={false}
                    />
                </div>
            </CenterTableContainer>
        );
    }

    componentDidMount() {
        if (this.props && this.props.usedCenter) {
            this.props.usedCenter(this);
        }
    }
}

export default UsedCenter;
