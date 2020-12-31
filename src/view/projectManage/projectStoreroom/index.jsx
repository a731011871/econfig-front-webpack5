import React from 'react';
import styled from 'styled-components';
import CommonTable from 'tms-common-table1x';
import urls from 'utils/urls';
import { formatEmpty } from 'utils/utils';
import { $http } from 'utils/http';
import { Divider, Button, message } from 'antd';
import { i18nMessages } from 'src/i18n';
import { injectIntl } from 'react-intl';

const StoreContainer = styled.div`
    .divider {
        margin: 0;
    }
    .store-header {
        padding: 0 8px 0 18px;
        display: flex;
        height: 45px;
        justify-content: space-between;
        align-items: center;
        div {
            a {
                margin-right: 10px;
            }
        }
        .store-header-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 70%;
            cursor: pointer;
            span {
                font-size: 16px;
                font-weight: bold;
            }
        }
    }
    .store-body {
        padding: 0 8px;
        .store-body-save {
            display: flex;
            justify-content: flex-end;
        }
    }
`;

@injectIntl
class ProjectStoreroom extends React.PureComponent {
    state = {
        wareHouseList: [],
        checks: [],
        loading: false,
        buttonLoading: false
    };

    componentWillMount() {
        this.getStorageList();
    }

    goBack = () => {
        this.props.history.goBack();
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0124
            ),
            minWidth: 200,
            dataIndex: 'storeroomName'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0254
            ),
            dataIndex: 'country',
            width: 150,
            render: (text, record) =>
                formatEmpty(
                    `${record.countryName || ''} ${record.provinceName ||
                        ''} ${record.cityName || ''} ${record.countyName || ''}`
                )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0056
            ),
            width: 250,
            dataIndex: 'contact',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0263
            ),
            width: 180,
            dataIndex: 'phone',
            render: text => formatEmpty(text)
        }
    ];

    getStorageList = async () => {
        const {
            match: {
                params: { id, appId }
            }
        } = this.props;
        const params = {
            pageNo: 0,
            paging: false,
            pageSize: 0,
            criteria: {
                conditions: [
                    {
                        join: 'AND',
                        subConditions: [
                            {
                                entityName: 'storeroomDo',
                                joint: 'AND',
                                operator: 'contains',
                                propertyName: 'storeroomName',
                                value: ''
                            },
                            {
                                entityName: 'storeroomDo',
                                joint: 'OR',
                                operator: 'contains',
                                propertyName: 'contact',
                                value: ''
                            }
                        ]
                    }
                ]
            }
        };
        try {
            this.setState({ loading: true });
            const data = await $http.post(urls.listStoreroomEnable, params);
            const assignStoreData = await $http.post(urls.assignedStoreroom, {
                projectId: id,
                appId
            });
            this.setState({
                wareHouseList: data.list || [],
                loading: false,
                checks: assignStoreData.map(t => t.id)
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    onSave = async () => {
        try {
            this.setState({ buttonLoading: true });
            const { checks = [] } = this.state;
            const {
                match: {
                    params: { id, appId }
                }
            } = this.props;
            await $http.post(urls.assignStoreroom, {
                appId,
                projectId: id,
                storeroomDoList:
                    checks &&
                    checks.map(t => {
                        return { id: t };
                    })
            });
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0261)
            );
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({
                buttonLoading: false
            });
        }
    };

    render() {
        const projectName = localStorage.getItem('projectName') || '';
        const { wareHouseList = [], loading, checks } = this.state;

        const rowSelection = {
            selectedRowKeys: checks,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    checks: selectedRows && selectedRows.map(t => t.id)
                });
                console.log(selectedRows && selectedRows.map(t => t.id));
                console.log(
                    `selectedRowKeys: ${selectedRowKeys}`,
                    'selectedRows: ',
                    selectedRows
                );
            }
        };

        return (
            <StoreContainer>
                <div className="store-header">
                    <div className="store-header-title" title={projectName}>
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0374
                            )}{' '}
                        </span>
                        {`${projectName}`}
                    </div>
                    <div>
                        <Button onClick={this.goBack}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0094
                            )}
                        </Button>
                    </div>
                </div>
                <Divider className="divider" />
                <div className="store-body">
                    <div className="store-body-save">
                        <Button
                            type="primary"
                            onClick={this.onSave}
                            style={{ margin: '10px 0' }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0062
                            )}
                        </Button>
                    </div>
                    <CommonTable
                        columns={this.columns}
                        dataSource={wareHouseList}
                        rowSelection={rowSelection}
                        loading={loading}
                        pagination={false}
                        outerFilter={false}
                    />
                </div>
            </StoreContainer>
        );
    }
}

export default ProjectStoreroom;
