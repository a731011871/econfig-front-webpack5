import React from 'react';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import { getCurrentLanguage } from 'utils/utils';
// import styled from 'styled-components';
import CommonTable from 'tms-common-table1x';
import { Divider, Popconfirm, message } from 'antd';
import { drawerFun } from 'component/drawer';
// import AddSignature from './addSignature';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import TableHeader from 'component/tableHeader';
import AddCro from './addCro';

@injectIntl
class Cro extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            croList: [],
            croTotal: 0,
            searchObj: {
                name: '',
                pageSize: 50,
                pageIndex: 1
            }
        };
    }

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0699
            ),
            width: '150px',
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
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0698
            ),
            width: 120,
            dataIndex: 'socialCreditCode'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0121
            ),
            width: '100px',
            key: 'action',
            render: (text, record) => {
                const language = getCurrentLanguage();
                if (record.tenantId === '*') {
                    return null;
                }
                return (
                    <span>
                        <a onClick={() => this.showCroInfo('edit', record)}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0098
                            )}
                        </a>
                        <Divider type="vertical" />
                        <Popconfirm
                            title={`${this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0252
                            )}[${
                                language === 'zh_CN'
                                    ? record.name || record.localeNameEn
                                    : record.localeNameEn || record.name
                            }]?`}
                            onConfirm={() => this.handleDeleteEvent(record.id)}
                        >
                            <a>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0145
                                )}
                            </a>
                        </Popconfirm>
                    </span>
                );
            }
        }
    ];

    componentWillMount() {
        this.getCroList({});
    }

    getCroList = async ({ name = '', pageIndex = 1, pageSize = 50 }) => {
        try {
            const croResult = await $http.get(urls.getTenantEnterpriseList, {
                type: 'enterprise_cro',
                name,
                pageIndex,
                pageSize
            });
            this.setState({
                croList: croResult.data || [],
                croTotal: croResult.total,
                searchObj: { name, pageIndex, pageSize }
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    showCroInfo = (type, croInfo = {}) => {
        const { formatMessage } = this.props.intl;
        const { ECONFIG_FRONT_A0692, ECONFIG_FRONT_A0693 } = i18nMessages;
        drawerFun({
            title:
                type === 'new'
                    ? formatMessage(ECONFIG_FRONT_A0692)
                    : formatMessage(ECONFIG_FRONT_A0693),
            width: 500,
            compontent: props => (
                <AddCro
                    {...props}
                    intl={this.props.intl}
                    appId={this.props.appId}
                    croInfo={croInfo}
                    getCroList={() => this.getCroList(this.state.searchObj)}
                />
            )
        });
    };

    tableChange = ({ current, pageSize }) => {
        this.getCroList({
            pageSize,
            pageIndex: current
        });
    };

    handleDeleteEvent = async enterpriseId => {
        try {
            await $http.delete(
                `${urls.updateEnterprise}?type=enterprise_cro&enterpriseId=${enterpriseId}`
            );
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            this.getCroList(this.state.searchObj);
        } catch (e) {
            message.error(e.message);
        }
    };

    render() {
        const { croList, searchObj, croTotal } = this.state;
        const language = getCurrentLanguage();
        const columns = this.columns.concat();
        const { formatMessage } = this.props.intl;
        const { ECONFIG_FRONT_A0691 } = i18nMessages;
        if (language === 'zh_CN') {
            columns.unshift({
                title: formatMessage(ECONFIG_FRONT_A0691),
                dataIndex: 'name',
                width: 150,
                render: (text, record) => text || record.localeNameEn
            });
        } else {
            columns.unshift({
                title: formatMessage(ECONFIG_FRONT_A0691),
                dataIndex: 'localeNameEn',
                language: 'en',
                width: 150,
                render: (text, record) => text || record.name
            });
        }
        return (
            <div className="table-padding">
                <TableHeader
                    onSearch={name =>
                        this.getCroList({ ...this.state.searchObj, name })
                    }
                    onAdd={() => this.showCroInfo('new')}
                />
                <CommonTable
                    serviceKey="id"
                    dataSource={croList}
                    columns={columns}
                    loading={false}
                    onChange={this.tableChange}
                    outerFilter={false}
                    paginationOptions={{
                        size: 'small',
                        current: searchObj.pageIndex,
                        pageSize: searchObj.pageSize,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        total: croTotal,
                        showTotal: total =>
                            `${this.props.intl
                                .formatMessage(i18nMessages.ECONFIG_FRONT_A0205)
                                .replace('xx', total)}`
                    }}
                    total={croTotal}
                />
            </div>
        );
    }
}

export default Cro;
