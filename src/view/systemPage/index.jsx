import React from 'react';
import CommonTable from 'tms-common-table1x';
import { Drawer, Modal, message } from 'antd';
import SystemInfoDrawer from './systemInfoDrawer';
import { $http } from '../../utils/http';
import urls from '../../utils/urls';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
// import PwdComponent from '@tms/pwd-component';

const confirm = Modal.confirm;

//数据为空过滤
function formatEmpty(text) {
    return text || text === 0 ? text : '-';
}

@injectIntl
class SystemPage extends React.Component {
    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0011
            ),
            dataIndex: 'softName',
            render: (text, record) => (
                <a
                    href="javascript:void(0)"
                    onClick={() => {
                        this.setState({
                            showSystemInfo: true,
                            activeSystemInfo: record
                        });
                    }}
                >
                    {formatEmpty(text)}
                </a>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0012
            ),
            dataIndex: 'date',
            render: (text, record) => (
                <span>
                    {`${record.startDate || ''} - ${record.endDate || ''}`}
                </span>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0013
            ),
            dataIndex: 'maxUser',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0014
            ),
            dataIndex: 'usedUser',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0015
            ),
            dataIndex: 'maxProject',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0016
            ),
            dataIndex: 'usedProject',
            render: text => formatEmpty(text)
        },
        {
            width: 150,
            key: 'action',
            render: record => {
                if (record.softName === 'eTrial') {
                    const projectInfo = {
                        id: '',
                        projectName: ''
                    };

                    sessionStorage.setItem(
                        'projectInfo',
                        JSON.stringify(projectInfo)
                    );
                    return (
                        <div
                            onClick={() => {
                                if (this.state.eTrial) {
                                    window.open('/trial/#/?isTrial=true');
                                } else {
                                    message.error(
                                        this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0625
                                        )
                                    );
                                }
                            }}
                        >
                            <a className="mLeft10">
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0017
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
        activeSystemInfo: {
            id: ''
        },
        showSystemInfo: false,
        dataSource: [],
        showPwd: false
    };

    componentWillMount() {
        this.fetchData();
    }

    setLoading = () => {
        this.setState({
            loading: !this.state.loading
        });
    };

    fetchData = async () => {
        this.setLoading();
        try {
            const data = await $http.get(
                `${urls.getSystemList}?isIncludeBasic=true&isFilterApp=true`
            );
            const eTrial = await $http.post(urls.checkIsDisplayTrailConfig);
            this.setState({ dataSource: data, eTrial });
        } catch (e) {
            message.error(e.message);
        }

        this.setLoading();
    };

    tableOnChange = ({ current = 1, order = {}, pageSize = 10 }) => {
        const sortTextMap = {
            ascend: 'ASC',
            descend: 'DESC'
        };
        const orderFiledMap = {
            registeCode: 'registe_code',
            firstPublicDate: 'first_public_date'
        };
        let params = {};
        if (order.field) {
            this.setState({
                sortedInfo: {
                    order: order.order,
                    columnKey: order.field
                }
            });
            params.sortField = orderFiledMap[order.field];
            params.sortOrder = sortTextMap[order.order];
        } else {
            this.setState({
                sortedInfo: null
            });
        }
        params = Object.assign({}, params, { pageSize, pageNum: current });
        console.log('最后的 结果', params);
        this.fetchData(params);
    };

    hideSystemInfoDrawer = () => {
        this.setState({ showSystemInfo: false, activeSystemInfo: { id: '' } });
    };

    showConfirm = e => {
        // const _this = this;
        const { id } = e.target.dataset;
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0258
            ),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: () => {
                console.log('初始化设置', id);
            },
            onCancel() {}
        });
    };

    render() {
        const { loading } = this.state;
        return (
            <div className="adminList pAll10">
                {/* <PwdComponent
                    visible={this.state.showPwd}
                    onClose={() => {
                        this.setState({ showPwd: false });
                    }}
                    onOk={() => {
                        this.setState({ showPwd: false });
                    }}
                />
                <Button
                    type="primary"
                    className="mBottom16"
                    onClick={() => {
                        this.setState({ showPwd: true });
                    }}
                >
                    二次密码登录验证组件
                </Button> */}
                <Drawer
                    className="systemInfoDrawer"
                    title={
                        this.state.activeSystemInfo.id
                            ? this.props.intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0227
                              )
                            : this.props.intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0102
                              )
                    }
                    width={720}
                    placement="right"
                    destroyOnClose
                    closable
                    bodyStyle={{ padding: 0 }}
                    onClose={this.hideSystemInfoDrawer}
                    visible={this.state.showSystemInfo}
                >
                    <SystemInfoDrawer
                        systemInfo={this.state.activeSystemInfo}
                        hideDrawer={this.hideSystemInfoDrawer}
                    />
                </Drawer>
                <CommonTable
                    serviceKey="cspAdmin"
                    dataSource={this.state.dataSource}
                    columns={this.columns}
                    onChange={this.tableOnChange}
                    loading={loading}
                    outerFilter={false}
                    pagination={false}
                />
            </div>
        );
    }
}

export default SystemPage;
