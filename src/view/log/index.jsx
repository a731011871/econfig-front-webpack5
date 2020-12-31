import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import urls from 'utils/urls';
import { $http } from 'utils/http';
import CommonTable from 'tms-common-table1x';
import { message, Select } from 'antd';
import { i18nMessages } from 'src/i18n';
import { injectIntl } from 'react-intl';
const { CommonTime, CommonFullTextSearch } = CommonTable;
import { modalFun } from 'src/component/modal';
import { getCurrentLanguage } from 'utils/utils';

const LogContainer = styled.div`
    padding: 15px;
`;

@injectIntl
class Log extends React.Component {
    state = {
        atcs: [],
        originAtcs: {}, // 操作类型翻译映射
        logs: [],
        total: '',
        loading: false
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0046
            ),
            width: 150,
            dataIndex: 'operUserName',
            render: text => {
                if (text === '系统操作') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0639
                            )}
                        </span>
                    );
                }
                return <span>{text}</span>;
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0047
            ),
            width: 200,
            dataIndex: 'operActName'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0048
            ),
            dataIndex: 'operObjectName',
            render: (text, record) => {
                if (record.operModuleName === '用户授权') {
                    return (
                        <a onClick={() => this.onDetail(record.id)}>{text}</a>
                    );
                }
                return <span>{text}</span>;
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0049
            ),
            width: 200,
            dataIndex: 'operTime'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0050
            ),
            width: 200,
            dataIndex: 'operIpAddr'
        }
    ];

    onDetail = async id => {
        try {
            const result = await $http.get(`${urls.getEsLogInfo}?id=${id}`);
            console.log(result);
            if (result.length === 0) {
                message.info(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0189
                    )
                );
            } else {
                modalFun({
                    title: this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0549
                    ),
                    width: 800,
                    compontent: () => (
                        <div>
                            {result.map((item, key) => {
                                return (
                                    <div key={key}>
                                        <h3
                                            style={
                                                key !== 0
                                                    ? { marginTop: 12 }
                                                    : {}
                                            }
                                        >
                                            {item.title}
                                        </h3>
                                        <div style={{ marginLeft: '10px' }}>
                                            {item.content &&
                                                item.content.map((c, index) => (
                                                    <div
                                                        style={{
                                                            marginTop: 10
                                                        }}
                                                        key={index}
                                                    >
                                                        {c}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                });
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    componentWillMount() {
        console.log(this.context.globalization);
        this.getActs(() => {
            this.getEslogs({});
        });
    }

    getEslogs = async ({
        pageIndex = 1,
        pageSize = 50,
        operUserName,
        operTimeFrom = '',
        operTimeTo = '',
        operActName
    }) => {
        try {
            const { originAtcs = [] } = this.state;
            this.setState({ loading: true });
            const language = getCurrentLanguage();
            let logs = [];
            const result = await $http.get(urls.getEslogs, {
                pageIndex,
                pageSize,
                operActName,
                operUserName,
                operTimeFrom,
                operTimeTo
            });
            // if(language === 'en_US') {
            if (language === 'en_US' && this.context.globalization) {
                const operObjectNames =
                    (await $http.post(urls.translateBatch, {
                        fromWords:
                            result.data.map(item => item.operObjectName) || [],
                        fromLang: 'english',
                        toLang: 'chinese',
                        renterID: '',
                        entityTag: '0',
                        field: 'common'
                    })) || {};
                const ns = operObjectNames.toWord || [];
                logs = result.data.map(item => {
                    return {
                        ...item,
                        operObjectName: ns[item.operObjectName],
                        operActName: originAtcs[item.operActName] || '-'
                    };
                });
            } else {
                logs = result.data || [];
            }
            this.setState({ logs, total: result.total, loading: false });
        } catch (e) {
            message.error(e.message);
            this.setState({
                loading: false
            });
        }
    };

    getActs = async (callback = () => {}) => {
        try {
            const resultAtcs = [],
                originAtcs = {};
            let atcs = [];
            const language = getCurrentLanguage();
            const result = await $http.get(urls.getActs);
            Object.keys(result || []).forEach(function(key) {
                resultAtcs.push({
                    id: key,
                    name: key
                });
            });
            // if(language === 'en_US') {
            if (language === 'en_US' && this.context.globalization) {
                const translateAtcs =
                    (await $http.post(urls.translateBatch, {
                        fromWords: resultAtcs.map(item => item.name) || [],
                        fromLang: 'english',
                        toLang: 'chinese',
                        renterID: '',
                        entityTag: '0',
                        field: 'common'
                    })) || {};
                const ns = translateAtcs.toWord || [];
                atcs = resultAtcs.map(item => {
                    return {
                        ...item,
                        name: ns[item.name]
                    };
                });
                atcs.map(item => {
                    originAtcs[item.id] = item.name;
                });
            } else {
                atcs = resultAtcs;
            }
            console.log(originAtcs);
            this.setState({ atcs, originAtcs }, () => {
                if (callback) callback();
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    tableChange = ({
        current,
        pageSize,
        values: { operUserName, operActName, operTime }
    }) => {
        const operTimeFrom =
            operTime === undefined ? '' : operTime[0].format('YYYY-MM-DD');
        const operTimeTo =
            operTime === undefined ? '' : operTime[1].format('YYYY-MM-DD');
        this.getEslogs({
            pageSize,
            operTimeFrom,
            operTimeTo,
            pageIndex: current,
            operUserName: operUserName || '',
            operActName: operActName || '',
            operTime: operTime || ''
        });
    };

    render() {
        const { atcs = [], logs = [], total = 0, loading } = this.state;

        const firstLineItems = [
            {
                fieldName: 'operActName',
                component: (
                    <Select
                        allowClear
                        showSearch
                        size="small"
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0047
                        )}
                        placeholder={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0672
                        )}
                        filterOption={(input, option) =>
                            option.props.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {atcs.map(item => {
                            return (
                                <Select.Option title={item.name} key={item.id}>
                                    {item.name}
                                </Select.Option>
                            );
                        })}
                    </Select>
                )
            },
            {
                fieldName: 'operTime',
                component: (
                    <CommonTime
                        label={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0049
                        )}
                        placeholder={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0198
                        )}
                        dateProps={{
                            // showTime: true,
                            format: 'YYYY-MM-DD'
                        }}
                    />
                )
            },
            {
                fieldName: 'operUserName',
                component: onFormSearch => (
                    <CommonFullTextSearch
                        onPressEnter={() => {
                            onFormSearch();
                        }}
                        placeholder={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0199
                        )}
                    />
                )
            }
        ];

        return (
            <LogContainer>
                <CommonTable
                    serviceKey="cspAdmin"
                    firstLineItems={firstLineItems}
                    dataSource={logs}
                    columns={this.columns}
                    loading={loading}
                    outerFilter={false}
                    onChange={this.tableChange}
                    resetText={this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0018
                    )}
                    defaultPageSize={50}
                    scroll={{ x: 'auto', y: 'calc(100vh - 280px)' }}
                    paginationOptions={{
                        size: 'small',
                        total: total || 0,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 50,
                        showTotal: total =>
                            `${this.props.intl
                                .formatMessage(i18nMessages.ECONFIG_FRONT_A0205)
                                .replace('xx', total)}`
                    }}
                    total={total}
                />
            </LogContainer>
        );
    }

    static contextTypes = {
        globalization: PropTypes.boolean
    };
}

export default Log;
