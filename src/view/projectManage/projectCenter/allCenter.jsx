import React from 'react';
import styled from 'styled-components';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import CommonTable from 'tms-common-table1x';
import { formatEmpty, getCurrentLanguage } from 'utils/utils';
import { Input, Icon, message } from 'antd';
import { drawerFun } from 'component/drawer';
import EditCenter from './editCenter';
import { i18nMessages } from 'src/i18n';

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

class AllCenter extends React.PureComponent {
    state = {
        dataSource: [],
        loading: true,
        searchValue: ''
    };

    componentWillMount() {
        this.fetchData();
    }

    fetchData = async () => {
        try {
            this.setState({ loading: true });
            const result =
                (await $http.get(urls.restEnterpriseSearch, {
                    name: this.state.searchValue,
                    type: 'enterprise_institution'
                })) || {};
            this.setState({
                dataSource: result.data || [],
                loading: false
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0689
            ),
            width: 200,
            dataIndex: 'name',
            render: (text, record) => {
                const language = getCurrentLanguage();
                if (language === 'zh_CN') {
                    return record.name || record.localeNameEn || '-';
                } else {
                    return record.localeNameEn || record.name || '-';
                }
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0061
            ),
            // width: 200,
            dataIndex: 'address',
            render: (text, record) => {
                const language = getCurrentLanguage();
                if (language === 'zh_CN') {
                    return record.address || record.localeAddressEn || '-';
                } else {
                    return record.localeAddressEn || record.address || '-';
                }
            }
        },

        // {
        //     title: this.props.intl.formatMessage(
        //         i18nMessages.ECONFIG_FRONT_A0255
        //     ),
        //     width: 120,
        //     dataIndex: 'area',
        //     render: (text, record) => {
        //         return formatEmpty(
        //             `${record.countryName || ''} ${record.provinceName ||
        //                 ''} ${record.cityName || ''} ${record.countyName || ''}`
        //         );
        //     }
        // },
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
                i18nMessages.ECONFIG_FRONT_A0208
            ),
            width: 120,
            dataIndex: 'provinceName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0209
            ),
            width: 120,
            dataIndex: 'cityName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0210
            ),
            width: 200,
            dataIndex: 'extendData',
            render: item => {
                return item?.map(c => c.professionalName).join(',') || '-';
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0030
            ),
            width: '60px',
            dataIndex: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.onDistribution(record)}>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0266
                        )}
                    </a>
                </span>
            )
        }
    ];

    onDistribution = record => {
        const { usedCenterEvent } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0164
            ),
            width: 550,
            compontent: props => (
                <EditCenter
                    usedCenterEvent={usedCenterEvent}
                    fetchData={() => this.fetchData()}
                    centerInfo={record}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    onReset = () => {
        this.setState(
            {
                searchValue: ''
            },
            () => this.fetchData()
        );
    };

    render() {
        const { loading, dataSource = [], searchValue } = this.state;

        return (
            <CenterTableContainer>
                <div className="center-table-header">
                    <div>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0211
                        )}
                    </div>
                    <div className="tms-table-search">
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
                        pagination={null}
                        outerFilter={false}
                    />
                </div>
            </CenterTableContainer>
        );
    }

    componentDidMount() {
        if (this.props && this.props.allUsedCenter) {
            this.props.allUsedCenter(this);
        }
    }
}

export default AllCenter;
