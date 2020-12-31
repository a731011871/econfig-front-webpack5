import React from 'react';
// import CommonTable from 'tms-common-table1x';
import {
    Drawer,
    Modal,
    Button,
    message,
    Menu,
    Tag,
    Icon,
    Spin,
    Input,
    Table
} from 'antd';
import styled from 'styled-components';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import EnvironmentDrawer from './environmentDrawer';

import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

// const { CommonFullTextSearch } = CommonTable;
const confirm = Modal.confirm;
const Search = Input.Search;
const AbsoluteDiv = styled.div`
    position: absolute;
    left: 12px;
    top: 75px;
    right: 0;
`;
//数据为空过滤
function formatEmpty(text) {
    return text ? text : '-';
}

@injectIntl
class EnvironmentPage extends React.Component {
    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0122
            ),
            width: 200,
            dataIndex: 'name',
            render: (text, record) =>
                record.appId !== '*' ? (
                    <a
                        href="javascript:void(0)"
                        style={{ width: '100%' }}
                        className="Block"
                        onClick={() => {
                            this.setState({
                                showEnvironmentInfo: true,
                                activeEnvironmentInfo: record
                            });
                        }}
                    >
                        {formatEmpty(text)}
                    </a>
                ) : (
                    formatEmpty(text)
                )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0123
            ),
            minWidth: 200,
            dataIndex: 'envType',
            render: text => (
                <span>
                    {text.toString() === '1'
                        ? this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0355
                        )
                        : text.toString() === '2'
                            ? this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0354
                            )
                            : this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0356
                            )}
                </span>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0120
            ),
            width: 300,
            dataIndex: 'status',
            render: text =>
                text === '1' ? (
                    <Tag className="tms-tag-enable">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0144
                        )}
                    </Tag>
                ) : (
                    // <EnableButton>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0144)}</EnableButton>
                    <Tag className="tms-tag-disable">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0143
                        )}
                    </Tag>
                    // <DisableButton>{this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0143)}</DisableButton>
                )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0121
            ),
            width: 150,
            key: 'action',
            render: record => {
                if (record.appId !== '*') {
                    return (
                        <div>
                            <a
                                data-id={record.id}
                                href="javascript:void(0)"
                                onClick={() => {
                                    this.setState({
                                        showEnvironmentInfo: true,
                                        activeEnvironmentInfo: record
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
                                    i18nMessages.ECONFIG_FRONT_A0145
                                )}
                            </a>
                        </div>
                    );
                }
            }
        }
    ];

    state = {
        loading: false,
        activeEnvironmentInfo: {
            id: ''
        },
        showEnvironmentInfo: false,
        envList: [],
        systemList: [],
        currentSelectApp: '',
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
        try {
            let envData = [];
            const systemResult = await $http.get(urls.getFilterSoftList);
            const systemList = systemResult.filter(
                item => item.appId === 'esupply' || item.appId === 'edc'
            );
            console.log('list', systemList);
            if (systemList && systemList.length > 0) {
                const params = {
                    criteria: {
                        conditions: [
                            {
                                joint: 'AND',
                                operator: 'in',
                                propertyName: 'appId',
                                value: `${systemList[0].appId},*`
                            },

                            {
                                joint: 'AND',
                                operator: 'contains',
                                propertyName: 'envName',
                                value: keyWords || ''
                            },
                            {
                                joint: 'AND',
                                operator: 'notEqual',
                                propertyName: 'envType',
                                value: '4'
                            }
                        ]
                    },
                    needPaging: false,
                    pageNo: 0,
                    pageSize: 0
                };
                envData = await $http.post(urls.getEnvList, params);
            }
            console.log('systemList', systemList);
            console.log('envList', envData.rows);
            this.setState({
                envList: envData.rows || [],
                currentSelectApp:
                    systemList.length > 0 ? systemList[0].appId : '',
                systemList: systemList || []
            });
        } catch (e) {
            message.error(e.message);
        }

        this.setLoading();
    };

    fetchEnvList = async keyWords => {
        try {
            const params = {
                criteria: {
                    conditions: [
                        {
                            joint: 'AND',
                            operator: 'in',
                            propertyName: 'appId',
                            value: `${this.state.currentSelectApp},*`
                        },

                        {
                            joint: 'AND',
                            operator: 'contains',
                            propertyName: 'name',
                            value: keyWords || ''
                        },
                        {
                            joint: 'AND',
                            operator: 'notEqual',
                            propertyName: 'envType',
                            value: '4'
                        }
                    ]
                },
                needPaging: false,
                pageNo: 0,
                pageSize: 0
            };
            const envData = await $http.post(urls.getEnvList, params);
            this.setState({ envList: envData.rows || [] });
        } catch (e) {
            message.error(e.message);
        }
    };

    tableOnChange = ({ values = {} }) => {
        console.log('values', values);
        this.fetchEnvList(values.keyWords);
    };

    hideEnvironmentInfoDrawer = () => {
        this.setState({
            showEnvironmentInfo: false,
            activeEnvironmentInfo: { id: '' }
        });
    };

    addEnv = async dto => {
        try {
            await $http.post(
                urls.addEnv,
                Object.assign({}, dto, { appId: this.state.currentSelectApp })
            );
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0262)
            );
            this.fetchEnvList();
        } catch (e) {
            message.error(e.message);
        }
    };

    deleteEnv = async id => {
        try {
            await $http.delete(`${urls.deleteEnv}/${id}`);
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
            );
            this.fetchEnvList();
        } catch (e) {
            message.error(e.message);
        }
    };

    updateEnv = async dto => {
        try {
            await $http.put(
                `${urls.updateEnv}/${this.state.activeEnvironmentInfo.id}`,
                dto,
                this.state.activeEnvironmentInfo
            );
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0230)
            );
            this.fetchEnvList();
        } catch (e) {
            message.error(e.message);
        }
    };

    showConfirm = e => {
        const _this = this;
        const { id } = e.target.dataset;
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0252
            ),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: () => {
                _this.deleteEnv(id);
            },
            onCancel() {}
        });
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
        const IconComponent = () => (
            <svg
                viewBox="64 64 896 896"
                className=""
                data-icon="exclamation-circle"
                width="120px"
                height="120px"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z" />
            </svg>
        );
        if (!loading && this.state.systemList.length > 0) {
            return (
                <div className="adminList pAll10 Relative">
                    <Menu
                        className="mBottom15"
                        selectedKeys={[this.state.currentSelectApp]}
                        mode="horizontal"
                        onClick={e => {
                            this.setState({ currentSelectApp: e.key }, () => {
                                this.fetchEnvList();
                            });
                        }}
                    >
                        {this.state.systemList.map(item => (
                            <Menu.Item key={item.appId}>
                                {item.appName}
                            </Menu.Item>
                        ))}
                    </Menu>
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
                                this.fetchEnvList(value);
                            }}
                            style={{ width: 200 }}
                        />
                        <Button
                            type="primary"
                            className="Right mRight15"
                            onClick={() => {
                                this.setState({
                                    showEnvironmentInfo: true
                                });
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0259
                            )}
                        </Button>
                    </AbsoluteDiv>
                    <Drawer
                        className="environmentInfoDrawer"
                        title={
                            this.state.activeEnvironmentInfo.id
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
                        onClose={this.hideEnvironmentInfoDrawer}
                        visible={this.state.showEnvironmentInfo}
                    >
                        <EnvironmentDrawer
                            environmentInfo={this.state.activeEnvironmentInfo}
                            hideDrawer={this.hideEnvironmentInfoDrawer}
                            addEnv={this.addEnv}
                            updateEnv={this.updateEnv}
                        />
                    </Drawer>
                    <Table
                        style={{ marginTop: 65 }}
                        loading={loading}
                        columns={this.columns}
                        dataSource={this.state.envList}
                        pagination={false}
                    />
                    {/*<CommonTable*/}
                    {/*serviceKey="cspAdmin"*/}
                    {/*firstLineItems={firstLineItems}*/}
                    {/*dataSource={this.state.envList}*/}
                    {/*columns={this.columns}*/}
                    {/*onChange={this.tableOnChange}*/}
                    {/*loading={loading}*/}
                    {/*outerFilter={false}*/}
                    {/*pagination={false}*/}
                    {/*/>*/}
                </div>
            );
        } else if (!loading && this.state.systemList.length === 0) {
            return (
                <div className="nullContent TxtCenter h100 flexColumn jusCenter">
                    <Icon component={IconComponent} />
                    <div className="Font24 Bold mTop15">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0336
                        )}
                    </div>
                </div>
            );
        }
        return (
            <div className="h100 flexColumn jusCenter TxtCenter">
                <Spin size="big" />
            </div>
        );
    }
}

export default EnvironmentPage;
