import React from 'react';
import styled from 'styled-components';
import urls, { parseApiUrl } from 'utils/urls';
import { $http } from 'utils/http';
import TmsTable from 'component/tmsTable';
import { Menu, Button, Divider, message, Popconfirm } from 'antd';
import { drawerFun } from 'component/drawer';
import AddDictionary from './addDictionary';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

const DictionaryContainer = styled.div`
    padding: 0 15px;
    display: flex;
    height: 100%;
    .ant-menu-inline {
        border-right: 0;
    }
    .dictionary-left {
        border-right: 1px solid #e8e8e8;
        .dictionary-left-title {
            font-size: 15px;
            font-weight: 700;
            line-height: 50px;
            padding-left: 20px;
        }
    }
    .dictionary-right {
        width: 100%;
        padding: 0 15px;
        .dictionary-right-title {
            font-size: 15px;
            font-weight: 400;
            line-height: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
    > div {
        display: inline-block;
    }
`;

@injectIntl
class Dictionary extends React.Component {
    state = {
        dictItemAll: [], // 词典列表
        dictItemInfo: {}, // 点击的词典详情
        buttonLoading: false
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0200
            ),
            dataIndex: 'name'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0097
            ),
            width: 100,
            dataIndex: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.handleEdit(record)}>
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0098
                        )}
                    </a>
                    <Divider type="vertical" />
                    <Popconfirm
                        title={`${this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0228
                        )}[${record.name}]?`}
                        onConfirm={() => this.onDeleteDic(record.id)}
                    >
                        <a>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0101
                            )}
                        </a>
                    </Popconfirm>
                </span>
            )
        }
    ];

    componentWillMount() {
        this.getDictItemAll();
    }

    // 获取词典名称列表
    getDictItemAll = async () => {
        try {
            const dictItemAll = await $http.get(urls.findEnumNameByCategory, {
                categoryCode: 'tenant'
            });
            this.setState({ dictItemAll: dictItemAll.rows || [] }, () => {
                if (dictItemAll.rows && dictItemAll.rows.length > 0) {
                    this.handleClickMenu({
                        item: {
                            props: {
                                children: dictItemAll.rows[0].fieldName,
                                eventKey: dictItemAll.rows[0].id
                            }
                        }
                    });
                }
            });
        } catch (e) {
            message.error(e.message);
        }
    };

    handleAdd = () => {
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0259
            ),
            width: 500,
            compontent: props => (
                <AddDictionary
                    tableEvent={this.tableEvent}
                    dictItemInfo={this.state.dictItemInfo}
                    isAdd={true}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    handleEdit = record => {
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0098
            ),
            width: 500,
            compontent: props => (
                <AddDictionary
                    tableEvent={this.tableEvent}
                    dictItemInfo={this.state.dictItemInfo}
                    dictionaryInfo={record}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    onDeleteDic = async dictItemId => {
        try {
            await $http.delete(parseApiUrl(urls.delDictItem, { dictItemId }));
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            this.tableEvent.fetchData({ pageNo: 1, pageSize: 50 });
        } catch (e) {
            message.error(e.message);
        }
    };

    handleClickMenu = ({
        item: {
            props: { children, eventKey }
        }
    }) => {
        this.setState(
            {
                dictItemInfo: {
                    children,
                    eventKey
                }
            },
            () => {
                this.tableEvent.fetchData({ pageNo: 1, pageSize: 50 });
            }
        );
    };

    render() {
        const { dictItemAll = [], dictItemInfo = {} } = this.state;

        return (
            <DictionaryContainer>
                <div className="dictionary-left">
                    <div className="dictionary-left-title">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0104
                        )}
                    </div>
                    <Menu
                        onClick={this.handleClickMenu}
                        style={{ width: 256 }}
                        selectedKeys={[dictItemInfo.eventKey]}
                        mode="inline"
                    >
                        {dictItemAll.map(item => {
                            return (
                                <Menu.Item key={item.id}>
                                    {item.fieldName}
                                </Menu.Item>
                            );
                        })}
                    </Menu>
                </div>
                <div className="dictionary-right">
                    <div className="dictionary-right-title">
                        <div>{dictItemInfo.children}</div>
                        <Button onClick={this.handleAdd} type="primary">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0259
                            )}
                        </Button>
                    </div>
                    <TmsTable
                        intl={this.props.intl}
                        columns={this.columns}
                        url={urls.getDictItemAll}
                        conditions={[
                            {
                                joint: 'AND',
                                operator: 'equal',
                                propertyName: 'dictTypeId',
                                value: dictItemInfo.eventKey
                            }
                        ]}
                        tableEvent={ref => (this.tableEvent = ref)}
                    />
                </div>
            </DictionaryContainer>
        );
    }
}

export default Dictionary;
