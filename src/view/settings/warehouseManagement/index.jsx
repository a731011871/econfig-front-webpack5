import React from 'react';
// import CommonTable from 'tms-common-table1x';
import { Drawer, Modal, Button, message, Table, Input } from 'antd';
import styled from 'styled-components';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import WarehouseDrawer from './warehouseDrawer';

import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

// const { CommonFullTextSearch } = CommonTable;
const confirm = Modal.confirm;
const Search = Input.Search;
// const DisableButton = styled.div`
//     width: 60px;
//     text-align: center;
//     background: #fff2e9;
//     color: #ff542d;
//     border-radius: 3px;
// `;
// const EnableButton = styled.div`
//     width: 60px;
//     text-align: center;
//     background: #e4fffb;
//     color: #00c2c1;
//     border-radius: 3px;
// `;
const AbsoluteDiv = styled.div`
    position: absolute;
    left: 12px;
    top: 12px;
    right: 0;
`;
//数据为空过滤
function formatEmpty(text) {
    return text ? text : '-';
}

@injectIntl
class WareHousePage extends React.Component {
    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0124
            ),
            dataIndex: 'storeroomName',
            width: 150,
            render: (text, record) => (
                <a
                    href="javascript:void(0)"
                    style={{ width: '100%' }}
                    className="overflow_ellipsis"
                    title={text}
                    onClick={() => {
                        this.setState({
                            showWareHouseInfo: true,
                            activeWareHouseInfo: record
                        });
                    }}
                >
                    {formatEmpty(text)}
                </a>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0254
            ),
            dataIndex: 'country',
            width: 150,
            render: (text, record) =>
                formatEmpty(
                    `${record.countryName || ''} ${record.provinceName || ''} ${
                        record.cityName || ''
                    } ${record.countyName || ''}`
                )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0056
            ),
            width: 120,
            dataIndex: 'contact',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0263
            ),
            width: 150,
            dataIndex: 'phone',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0126
            ),
            width: 150,
            dataIndex: 'cycle',
            render: text => formatEmpty(text)
        },
        // {
        //     title: this.props.intl.formatMessage(
        //         i18nMessages.ECONFIG_FRONT_A0086
        //     ),
        //     width: 100,
        //     dataIndex: 'status',
        //     render: text =>
        //         text === '1' ? (
        //             <EnableButton>
        //                 {this.props.intl.formatMessage(
        //                     i18nMessages.ECONFIG_FRONT_A0144
        //                 )}
        //             </EnableButton>
        //         ) : (
        //             <DisableButton>
        //                 {this.props.intl.formatMessage(
        //                     i18nMessages.ECONFIG_FRONT_A0143
        //                 )}
        //             </DisableButton>
        //         )
        // },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0087
            ),
            width: 150,
            key: 'action',
            render: record => {
                return (
                    <div>
                        <a
                            data-id={record.id}
                            href="javascript:void(0)"
                            onClick={() => {
                                this.setState({
                                    showWareHouseInfo: true,
                                    activeWareHouseInfo: record
                                });
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0098
                            )}
                        </a>
                        <a
                            className="mLeft10"
                            data-id={record.id}
                            href="javascript:void(0)"
                            onClick={this.showConfirm}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0101
                            )}
                        </a>
                    </div>
                );
            }
        }
    ];

    state = {
        loading: false,
        activeWareHouseInfo: {
            id: ''
        },
        showWareHouseInfo: false,
        data: [],
        wareHouseList: [],
        keyWords: ''
    };

    componentDidMount() {
        this.fetchData();
    }

    setLoading = () => {
        this.setState({
            loading: !this.state.loading
        });
    };

    fetchData = async keyWords => {
        this.setLoading();
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
                                value: keyWords || ''
                            },
                            {
                                entityName: 'storeroomDo',
                                joint: 'OR',
                                operator: 'contains',
                                propertyName: 'contact',
                                value: keyWords || ''
                            }
                        ]
                    }
                ]
            }
        };
        try {
            const data = await $http.post(urls.getWareHouseList, params);
            this.setState({ wareHouseList: data.list || [] });
        } catch (e) {
            message.error(e.message);
        }

        this.setLoading();
    };

    tableOnChange = ({ values = {} }) => {
        console.log('values', values);
        this.fetchData(values.keyWords);
    };

    hideWareHouseInfoDrawer = () => {
        this.setState({
            showWareHouseInfo: false,
            activeWareHouseInfo: { id: '' }
        });
    };

    showConfirm = e => {
        const _this = this;
        const { id } = e.target.dataset;
        confirm({
            title: `${this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0228
            )}?`,
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: () => {
                _this.deleteWareHouse(id);
            },
            onCancel() {}
        });
    };

    addWareHouse = async dto => {
        try {
            await $http.post(urls.addWareHouse, dto);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0262)
            );
            this.fetchData();
        } catch (e) {
            message.error(e.message);
        }
    };

    updateWareHouse = async dto => {
        try {
            await $http.put(`${urls.updateWareHouse}/${dto.id}`, dto);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0230)
            );
            this.fetchData();
        } catch (e) {
            message.error(e.message);
        }
    };

    deleteWareHouse = async id => {
        try {
            await $http.delete(`${urls.deleteWareHouse}/${id}`);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            this.fetchData();
        } catch (e) {
            message.error(e.message);
        }
    };

    render() {
        const { loading } = this.state;
        // const firstLineItems = [
        //     {
        //         fieldName: 'keyWords',
        //         component: (
        //             <CommonFullTextSearch
        //                 placeholder={this.props.intl.formatMessage(
        //                     i18nMessages.ECONFIG_FRONT_A0241
        //                 )}
        //             />
        //         )
        //     }
        // ];
        return (
            <div className="adminList pAll10 Relative">
                <AbsoluteDiv>
                    <Search
                        placeholder={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0241
                        )}
                        value={this.state.keyWords}
                        onChange={e => {
                            this.setState({
                                keyWords: e.target.value
                            });
                        }}
                        onSearch={value => {
                            this.fetchData(value);
                        }}
                        style={{ width: 200 }}
                    />
                    <Button
                        type="primary"
                        className="Right mRight15"
                        onClick={() => {
                            this.setState({ showWareHouseInfo: true });
                        }}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0259
                        )}
                    </Button>
                </AbsoluteDiv>
                <Drawer
                    className="wareHouseInfoDrawer"
                    title={
                        this.state.activeWareHouseInfo.id
                            ? this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0098
                            )
                            : this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0259
                            )
                    }
                    width={720}
                    placement="right"
                    destroyOnClose
                    closable
                    onClose={this.hideWareHouseInfoDrawer}
                    visible={this.state.showWareHouseInfo}
                >
                    <WarehouseDrawer
                        wareHouseInfo={this.state.activeWareHouseInfo}
                        hideDrawer={this.hideWareHouseInfoDrawer}
                        addWareHouse={this.addWareHouse}
                        updateWareHouse={this.updateWareHouse}
                    />
                </Drawer>
                <Table
                    className="mTop45"
                    loading={loading}
                    columns={this.columns}
                    dataSource={this.state.wareHouseList}
                    pagination={false}
                />
                {/*<CommonTable*/}
                {/*serviceKey="cspAdmin"*/}
                {/*firstLineItems={firstLineItems}*/}
                {/*dataSource={this.state.wareHouseList}*/}
                {/*columns={this.columns}*/}
                {/*onChange={this.tableOnChange}*/}
                {/*loading={loading}*/}
                {/*outerFilter={false}*/}
                {/*pagination={false}*/}
                {/*/>*/}
            </div>
        );
    }
}

export default WareHousePage;
