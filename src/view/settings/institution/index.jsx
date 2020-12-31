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
import AddInstitution from './addInstitution';

@injectIntl
class Institution extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            institutionList: [],
            institutionTotal: 0,
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
                i18nMessages.ECONFIG_FRONT_A0700
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
                i18nMessages.ECONFIG_FRONT_A0690
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
                        <a
                            onClick={() =>
                                this.showInstitutionInfo('edit', record)
                            }
                        >
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
        this.getInstitutionList({});
    }

    getInstitutionList = async ({
        name = '',
        pageIndex = 1,
        pageSize = 50
    }) => {
        try {
            const institutionResult = await $http.get(
                urls.getTenantEnterpriseList,
                {
                    type: 'enterprise_institution',
                    name,
                    pageIndex,
                    pageSize
                }
            );
            this.setState({
                institutionList: institutionResult.data || [],
                institutionTotal: institutionResult.total,
                searchObj: { name, pageIndex, pageSize }
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    showInstitutionInfo = (type, institutionInfo = {}) => {
        const { formatMessage } = this.props.intl;
        const { ECONFIG_FRONT_A0694, ECONFIG_FRONT_A0695 } = i18nMessages;
        drawerFun({
            title:
                type === 'new'
                    ? formatMessage(ECONFIG_FRONT_A0694)
                    : formatMessage(ECONFIG_FRONT_A0695),
            width: 500,
            compontent: props => (
                <AddInstitution
                    {...props}
                    intl={this.props.intl}
                    appId={this.props.appId}
                    institutionInfo={institutionInfo}
                    getInstitutionList={() =>
                        this.getInstitutionList(this.state.searchObj)
                    }
                />
            )
        });
    };

    tableChange = ({ current, pageSize }) => {
        this.getInstitutionList({
            pageSize,
            pageIndex: current
        });
    };

    handleDeleteEvent = async enterpriseId => {
        try {
            await $http.delete(
                `${urls.updateEnterprise}?type=enterprise_institution&enterpriseId=${enterpriseId}`
            );
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            this.getInstitutionList(this.state.searchObj);
        } catch (e) {
            message.error(e.message);
        }
    };

    render() {
        const { institutionList, searchObj, institutionTotal } = this.state;
        const language = getCurrentLanguage();
        const columns = this.columns.concat();
        const { formatMessage } = this.props.intl;
        const {
            // ECONFIG_FRONT_A0686,
            ECONFIG_FRONT_A0689
        } = i18nMessages;
        if (language === 'zh_CN') {
            columns.unshift({
                title: formatMessage(ECONFIG_FRONT_A0689),
                dataIndex: 'name',
                width: 150,
                render: (text, record) => text || record.localeNameEn
            });
        } else {
            columns.unshift({
                title: formatMessage(ECONFIG_FRONT_A0689),
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
                        this.getInstitutionList({
                            ...this.state.searchObj,
                            name
                        })
                    }
                    onAdd={() => this.showInstitutionInfo('new')}
                />
                <CommonTable
                    serviceKey="id"
                    dataSource={institutionList}
                    columns={columns}
                    loading={false}
                    onChange={this.tableChange}
                    outerFilter={false}
                    paginationOptions={{
                        size: 'small',
                        current: searchObj.pageIndex,
                        pageSize: searchObj.pageSize,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        total: institutionTotal,
                        showTotal: total =>
                            `${this.props.intl
                                .formatMessage(i18nMessages.ECONFIG_FRONT_A0205)
                                .replace('xx', total)}`
                    }}
                    total={institutionTotal}
                />
            </div>
        );
    }
}

export default Institution;
