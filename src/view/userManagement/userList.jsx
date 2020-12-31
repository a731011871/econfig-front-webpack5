import React from 'react';
import PropTypes from 'prop-types';
import CommonTable from 'tms-common-table1x';
import {
    Button,
    Modal,
    Menu,
    Input,
    message,
    DatePicker,
    Select,
    Form,
    TreeSelect
} from 'antd';
import moment from 'moment';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import ToDeptUserModal from './toDeptUserModal';
import { modalFun } from 'src/component/modal';
import VlolumeAuthModal from 'src/view/deptManagement/departmentPage/departmentMemberList/volumeAuthModal';

import './index.less';

const { TreeNode } = TreeSelect;
const Search = Input.Search;
const confirm = Modal.confirm;

//数据为空过滤
function formatEmpty(text) {
    return text ? text : '-';
}

@injectIntl
class UserList extends React.Component {
    static propTypes = {
        showUserInfo: PropTypes.func,
        changeList: PropTypes.func,
        changeSearchObj: PropTypes.func,
        searchObj: PropTypes.object,
        currentMenu: PropTypes.string
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0081
            ),
            width: 200,
            dataIndex: 'userName',
            render: (text, record) => (
                // <span>{text || '-'}</span>
                <a
                    href="javascript:void(0)"
                    onClick={() => {
                        this.props.showUserInfo(record);
                        // try {
                        //     const systemList = await $http.get(`${urls.getFilterSoftList}?email=${record.email}`);
                        //     const operateId = await $http.post(urls.userCheck,
                        //         {
                        //             'operateType': 'INVITE_USER',
                        //             'backUrl': '/econfig/',
                        //             'backParam': 'email',
                        //             'userInfoDtos': [
                        //                 {
                        //                     'email': 'cwvlmk90753@chacuo.net',
                        //                     'userProperty': 'CompanyUser',
                        //                     'userName': '测试账号1',
                        //                     'accountName': 'TestZh1',
                        //                     'organIds': [
                        //
                        //                     ]
                        //                 }
                        //             ],
                        //             'appIds': systemList.filter(item => item.authType && item.authType !== '-1').map(item => item.appId)
                        //         });
                        //     this.props.history.push(`authuser/invite?operateId=${operateId}`);
                        // } catch (e) {
                        //     message.error(e.message);
                        // }
                    }}
                >
                    {text || '—'}
                </a>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0490
            ),
            width: 230,
            dataIndex: 'accountName',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0083
            ),
            width: 200,
            dataIndex: 'mobile',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0082
            ),
            width: 250,
            dataIndex: 'email',
            render: (text, record) => {
                if (this.props.searchObj.currentMenu === '1') {
                    return formatEmpty(text);
                }
                return (
                    <a
                        href="javascript:void(0)"
                        onClick={() => {
                            this.props.showUserInfo(record);
                        }}
                    >
                        {text || ''}
                    </a>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0085
            ),
            width: 250,
            dataIndex: 'positionName',
            render: text => text || '-'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0470
            ),
            width: 250,
            dataIndex: 'organNames',
            render: text => text || '-'
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0086
            ),
            dataIndex: 'status',
            width: 200,
            render: (status, record) => {
                if (status === '1' && record.enabled === '1') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0652
                            )}
                        </span>
                    );
                } else if (status === '1' && record.enabled === '0') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0653
                            )}
                        </span>
                    );
                } else if (status === '0' && record.enabled === '0') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0274
                            )}
                        </span>
                    );
                } else if (status === '0' && record.enabled === '1') {
                    return (
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0274
                            )}
                        </span>
                    );
                }
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0087
            ),
            width: 250,
            key: 'action',
            render: record => {
                return (
                    <div>
                        <a
                            className="mRight15"
                            key="deptUser"
                            href="javascript:void(0)"
                            onClick={() => {
                                this.props.showUserInfo(record);
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0098
                            )}
                        </a>
                        {this.props.searchObj.currentMenu === '1' ? (
                            [
                                <a
                                    className="mRight15"
                                    key="deptUser"
                                    href="javascript:void(0)"
                                    onClick={() => {
                                        this.setState({
                                            deptUserId: record.userId,
                                            showDeptUserModal: true
                                        });
                                    }}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0305
                                    )}
                                </a>,
                                <a
                                    className="mRight15"
                                    key="disabled"
                                    href="javascript:void(0)"
                                    onClick={() => {
                                        this.changeUserStatus(
                                            record.userId,
                                            record.enabled
                                        );
                                    }}
                                >
                                    {record.enabled === '0'
                                        ? this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0176
                                          )
                                        : this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0177
                                          )}
                                </a>
                            ]
                        ) : (
                            <a
                                data-id={
                                    this.props.searchObj.currentMenu === '1'
                                        ? record.userId
                                        : record.inviteId
                                }
                                data-email={record.email}
                                className="mRight15"
                                href="javascript:void(0)"
                                onClick={this.showRenSendConfirm}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0147
                                )}
                            </a>
                        )}
                    </div>
                );
            }
        }
    ];

    state = {
        loading: false,
        total: 1000,
        activeMemberInfo: {
            id: ''
        },
        keyWords: '',
        showMemberInfo: false,
        data: [],
        positionList: [],
        showDisableByTimeModal: false, // 定时禁用时间弹层
        activeUserId: '', // 选择要定时禁用的用户Id
        disabledTime: '', // 定时禁用的时间
        showDisabledModal: false,
        showDeptUserModal: false,
        deptList: [],
        selectedRowInactivatedKeys: [],
        selectedRowActiveKeys: [],
        enabled: '1' // 禁用状态
    };

    componentWillMount() {
        this.getPositionList();
        this.getDeptList();
        this.fetchData(this.props.searchObj);
    }

    getPositionList = async () => {
        try {
            const positionList = await $http.post(urls.getPositionList, {
                dictTypeName: '用户职位'
            });
            this.setState({ positionList });
        } catch (e) {
            message.error(e.message);
        }
    };

    getDeptList = async () => {
        try {
            const deptList = await $http.get(urls.getDeptList);
            this.setState({ deptList });
        } catch (e) {
            message.error(e.message);
        }
    };

    handleClick = e => {
        this.fetchData({
            ...this.props.searchObj,
            currentMenu: e.key,
            pageNo: 1
        });
        this.props.changeList(e.key);
    };

    setLoding = () => {
        this.setState({
            loading: !this.state.loading
        });
    };

    fetchData = async ({
        currentMenu = '1',
        keyWords,
        pageNo,
        pageSize,
        positionIds = [],
        organIds = [],
        enabled
    }) => {
        this.setLoding();
        const args = {
            criteria: {},
            pageNo,
            pageSize,
            paging: true,
            rows: [
                {
                    status: currentMenu,
                    enabled,
                    content: keyWords,
                    positionIds,
                    organIds
                }
            ]
        };
        try {
            const data = await $http.post(
                `${urls.getUserList}?isRetainOutUser=false`,
                args
            );
            this.setState({
                data: data.list,
                total: data.total,
                keyWords,
                positionIds,
                organIds,
                enabled
            });
            this.props.changeSearchObj({
                currentMenu,
                keyWords,
                pageNo,
                pageSize,
                positionIds,
                organIds,
                enabled
            });
        } catch (e) {
            message.error(e.message);
        }
        this.setLoding();
    };

    // 翻页 排序
    tableOnChange = ({ current = 1, pageSize = 50 }) => {
        this.fetchData({
            ...this.props.searchObj,
            pageNo: current,
            pageSize
        });
    };

    changeUserStatus = async (userId, enabled) => {
        if (enabled === '1') {
            this.setState({ showDisabledModal: true, activeUserId: userId });
            // this.showDisableConfirm(userId);
        } else {
            this.setLoding();
            try {
                await $http.get(`${urls.enableUser}?userId=${userId}`);
                message.success(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0231
                    )
                );
                this.fetchData({
                    ...this.props.searchObj,
                    keyWords: this.state.keyWords,
                    organIds: this.state.organIds,
                    positionIds: this.state.positionIds,
                    pageNo: 1,
                    currentMenu: this.props.searchObj.currentMenu
                });
            } catch (e) {
                message.error(e.message);
            } finally {
                this.setLoding();
            }
        }
    };

    doTimeDisableUsers = async () => {
        if (this.state.disabledTime) {
            try {
                await $http.get(
                    `${urls.disableUser}?userId=${this.state.activeUserId}&disableTime=${this.state.disabledTime}`
                );
                message.success(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0232
                    )
                );
                this.fetchData({
                    ...this.props.searchObj,
                    keyWords: this.state.keyWords,
                    organIds: this.state.organIds,
                    positionIds: this.state.positionIds,
                    pageNo: 1,
                    currentMenu: this.props.searchObj.currentMenu
                });
                this.setState({
                    disabledTime: '',
                    activeUserId: '',
                    showDisableByTimeModal: false
                });
            } catch (e) {
                message.error(e.message);
            }
        } else {
            message.error(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0237)
            );
        }
    };

    showRenSendConfirm = e => {
        const { id, email } = e.target.dataset;
        confirm({
            title: this.props.intl
                .formatMessage(i18nMessages.ECONFIG_FRONT_A0234)
                .replace('xx', email),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    await $http.get(
                        `${urls.resendInviteUser}?id=${id}&isAdmin=false`
                    );
                    this.fetchData({
                        ...this.props.searchObj,
                        currentMenu: '0'
                    });
                    message.success(
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0235
                        )
                    );
                } catch (e) {
                    message.error(e.message);
                }
            },
            onCancel() {}
        });
    };

    onExport = () => {
        const {
            positionIds = [],
            organIds = [],
            currentMenu,
            enabled
        } = this.state;
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0202
            ),
            content: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0222
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    // const condition = {
                    //     '2': {
                    //         status: '1'
                    //     },
                    //     '1': {
                    //         enabled: '1',
                    //         status: '1'
                    //     },
                    //     '3': {
                    //         enabled: '0',
                    //         status: '1'
                    //     },
                    //     '0': {
                    //         status: '0'
                    //     }
                    // };
                    const result = await $http.post(
                        `${urls.userExport}?isCompanyUser=false`,
                        {
                            // ...condition[currentMenu],
                            status: currentMenu,
                            enabled,
                            keyWord: this.state.keyWords,
                            positionIds,
                            organIds
                        }
                    );
                    if (result && result.relativeFileUrl) {
                        // window.location.href = result.relativeFileUrl;
                        window.open(result.relativeFileUrl);
                    } else {
                        message.error(
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

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode
                        value={item.id}
                        title={item.organizeName}
                        key={item.id}
                        organType={item.organType}
                        parentId={item.parentId || ''}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    value={item.id}
                    key={item.id}
                    parentId={item.parentId || ''}
                    organType={item.organType}
                    title={item.organizeName}
                />
            );
        });

    volumeAuth = async () => {
        console.log(this.props.searchObj.currentMenu);
        const {
            selectedRowActiveKeys,
            selectedRowInactivatedKeys
        } = this.state;
        if (
            this.props.searchObj.currentMenu === '1' &&
            selectedRowActiveKeys.length <= 0
        ) {
            message.info(
                this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0051
                ) +
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0551
                    )
            );
            return;
        }
        if (
            this.props.searchObj.currentMenu === '0' &&
            selectedRowInactivatedKeys.length <= 0
        ) {
            message.info(
                this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0051
                ) +
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0551
                    )
            );
            return;
        }
        try {
            const { selectedRowActiveKeys } = this.state;
            const appList = (await $http.get(urls.getAuthAppList)) || [];
            modalFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0704
                ),
                width: 650,
                compontent: props => (
                    <VlolumeAuthModal
                        {...props}
                        appList={appList}
                        intl={this.props.intl}
                        selectedRowKeys={
                            this.props.searchObj.currentMenu === '1'
                                ? selectedRowActiveKeys
                                : selectedRowInactivatedKeys
                        }
                        companyUser={
                            this.props.searchObj.currentMenu === '1'
                                ? true
                                : false
                        }
                    />
                )
            });
        } catch (error) {
            message.error(error.message);
        }
    };

    render() {
        const {
            loading,
            total,
            selectedRowActiveKeys,
            selectedRowInactivatedKeys
        } = this.state;
        const {
            searchObj: { currentMenu }
        } = this.props;
        let columns = this.columns.concat();
        if (currentMenu === '0') {
            columns = columns.filter(
                item =>
                    item.title ===
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0082
                        ) ||
                    item.title ===
                        this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0087
                        )
            );
        }
        const activeRowSelection = {
            selectedRowKeys: selectedRowActiveKeys,
            columnWidth: '60px',
            onChange: selectedRowActiveKeys => {
                this.setState({ selectedRowActiveKeys });
            }
        };
        const inactivatedRowSelection = {
            selectedRowKeys: selectedRowInactivatedKeys,
            columnWidth: '60px',
            fixed: true,
            onChange: selectedRowInactivatedKeys => {
                console.log(selectedRowInactivatedKeys);
                this.setState({ selectedRowInactivatedKeys });
            }
        };
        return (
            <div className="adminList pAll10 Relative">
                <Form
                    layout="inline"
                    className="mRight15"
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <div>
                        {currentMenu === '1' && (
                            <React.Fragment>
                                <Form.Item
                                    label={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0084
                                    )}
                                >
                                    <TreeSelect
                                        multiple
                                        allowClear
                                        showSearch
                                        treeDefaultExpandAll
                                        treeNodeFilterProp="title"
                                        dropdownStyle={{
                                            maxHeight: 300,
                                            overflow: 'auto'
                                        }}
                                        value={this.state.organIds}
                                        style={{ width: 220 }}
                                        placeholder={this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0051
                                        )}
                                        onChange={value => {
                                            // this.setState({ organIds: value });
                                            this.fetchData({
                                                ...this.props.searchObj,
                                                organIds: value,
                                                keyWords: this.state.keyWords,
                                                positionIds: this.state
                                                    .positionIds,
                                                pageNo: 1,
                                                currentMenu: this.props
                                                    .searchObj.currentMenu
                                            });
                                        }}
                                    >
                                        {this.renderTreeNodes(
                                            this.state.deptList
                                        )}
                                    </TreeSelect>
                                </Form.Item>
                                <Form.Item
                                    label={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0085
                                    )}
                                >
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: 220 }}
                                        showSearch
                                        value={this.state.positionIds}
                                        filterOption={(input, option) =>
                                            option.props.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                        placeholder={this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0051
                                        )}
                                        onChange={value => {
                                            // console.log(value);
                                            // this.setState({
                                            //     positionIds: value
                                            // });
                                            this.fetchData({
                                                ...this.props.searchObj,
                                                positionIds: value,
                                                keyWords: this.state.keyWords,
                                                organIds: this.state.organIds,
                                                pageNo: 1,
                                                currentMenu: this.props
                                                    .searchObj.currentMenu
                                            });
                                        }}
                                    >
                                        {this.state.positionList.map(item => (
                                            <Select.Option key={item.id}>
                                                {item.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label={this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0086
                                    )}
                                >
                                    <Select
                                        className="mRight15"
                                        style={{ width: 200 }}
                                        value={this.state.enabled}
                                        onChange={value => {
                                            // this.setState({ enabled: value });
                                            this.fetchData({
                                                ...this.props.searchObj,
                                                positionIds: this.state
                                                    .positionIds,
                                                keyWords: this.state.keyWords,
                                                organIds: this.state.organIds,
                                                pageNo: 1,
                                                enabled: value
                                            });
                                        }}
                                    >
                                        <Select.Option key="" value="">
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0283
                                            )}
                                        </Select.Option>
                                        {/* <Select.Option key="0">
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0274
                                        )}
                                    </Select.Option> */}
                                        <Select.Option key="1">
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0652
                                            )}
                                        </Select.Option>
                                        <Select.Option key="0">
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0653
                                            )}
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </React.Fragment>
                        )}
                        <Form.Item
                            label={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0588
                            )}
                        >
                            <Search
                                placeholder={
                                    currentMenu === '1'
                                        ? this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0587
                                          )
                                        : this.props.intl.formatMessage(
                                              i18nMessages.ECONFIG_FRONT_A0082
                                          )
                                }
                                value={this.state.keyWords}
                                onChange={e => {
                                    this.setState({
                                        keyWords: e.target.value
                                    });
                                }}
                                onSearch={value => {
                                    // this.setState({ keyWords: value });
                                    this.fetchData({
                                        ...this.props.searchObj,
                                        keyWords: value,
                                        organIds: this.state.organIds,
                                        positionIds: this.state.positionIds,
                                        pageNo: 1,
                                        currentMenu: this.props.searchObj
                                            .currentMenu
                                    });
                                }}
                                style={{ width: 280 }}
                            />
                        </Form.Item>
                    </div>

                    <div
                        className="TxtRight"
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <Button
                            className="mRight15"
                            type="primary"
                            disabled={
                                currentMenu === '1'
                                    ? selectedRowActiveKeys.length <= 0
                                    : selectedRowInactivatedKeys.length <= 0
                            }
                            onClick={this.volumeAuth}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0704
                            )}
                        </Button>

                        {currentMenu === '1' && (
                            <Button
                                className="mRight15"
                                onClick={this.onExport}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0029
                                )}
                            </Button>
                        )}
                        <Button
                            type="primary"
                            className=" mRight15"
                            onClick={this.props.showUserInfo}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0037
                            )}
                        </Button>
                    </div>
                </Form>
                <Menu
                    onClick={this.handleClick}
                    selectedKeys={[currentMenu]}
                    mode="horizontal"
                >
                    <Menu.Item key="1">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0333
                        )}
                    </Menu.Item>
                    <Menu.Item key="0">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0334
                        )}
                    </Menu.Item>
                </Menu>
                {this.state.showDisabledModal && (
                    <Modal
                        className="disabledModal"
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0330
                        )}
                        visible={this.state.showDisabledModal}
                        content={null}
                        width={400}
                        onCancel={() => {
                            this.setState({
                                showDisabledModal: false,
                                activeUserId: ''
                            });
                        }}
                        footer={
                            <div className="footer">
                                <Button
                                    onClick={() => {
                                        this.setState({
                                            showDisableByTimeModal: true,
                                            showDisabledModal: false
                                        });
                                    }}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0239
                                    )}
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={async () => {
                                        this.setState({
                                            showDisabledModal: false
                                        });
                                        this.setLoding();
                                        try {
                                            await $http.get(
                                                `${urls.disableUser}?userId=${this.state.activeUserId}`
                                            );
                                            message.success(
                                                this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0232
                                                )
                                            );
                                            this.fetchData({
                                                ...this.props.searchObj,
                                                keyWords: this.state.keyWords,
                                                organIds: this.state.organIds,
                                                positionIds: this.state
                                                    .positionIds,
                                                pageNo: 1,
                                                currentMenu: this.state
                                                    .currentMenu
                                            });
                                        } catch (e) {
                                            message.error(e.message);
                                        } finally {
                                            this.setLoding();
                                        }
                                    }}
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0240
                                    )}
                                </Button>
                            </div>
                        }
                        cancelText={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0239
                        )}
                    />
                )}

                {this.state.showDisableByTimeModal && (
                    <Modal
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0239
                        )}
                        visible={this.state.showDisableByTimeModal}
                        onOk={this.doTimeDisableUsers}
                        onCancel={() => {
                            this.setState({
                                showDisableByTimeModal: false,
                                activeUserId: ''
                            });
                        }}
                    >
                        <span className="mRight15">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0242
                            )}
                        </span>
                        <DatePicker
                            className="InlineBlock"
                            disabledDate={current => {
                                return (
                                    current && current < moment().endOf('day')
                                );
                            }}
                            onChange={(data, disabledTime) => {
                                this.setState({ disabledTime });
                            }}
                        />
                    </Modal>
                )}
                {currentMenu === '1' && (
                    <CommonTable
                        serviceKey="econfigUser"
                        dataSource={this.state.data}
                        columns={columns}
                        onChange={this.tableOnChange}
                        loading={loading}
                        rowSelection={activeRowSelection}
                        outerFilter={false}
                        total={total}
                        rowKey="userId"
                        paginationOptions={{
                            size: 'small',
                            current: this.props.searchObj.pageNo,
                            pageSize: this.props.searchObj.pageSize,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            defaultPageSize: 50
                        }}
                    />
                )}
                {currentMenu === '0' && (
                    <CommonTable
                        serviceKey="econfigUser2"
                        dataSource={this.state.data}
                        columns={columns}
                        onChange={this.tableOnChange}
                        loading={loading}
                        outerFilter={false}
                        total={total}
                        rowKey="inviteId"
                        rowSelection={inactivatedRowSelection}
                        paginationOptions={{
                            size: 'small',
                            current: this.props.searchObj.pageNo,
                            pageSize: this.props.searchObj.pageSize,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            defaultPageSize: 50
                        }}
                    />
                )}
                {this.state.showDeptUserModal && (
                    <ToDeptUserModal
                        visible={this.state.showDeptUserModal}
                        userId={this.state.deptUserId}
                        hideModal={() => {
                            this.setState({
                                showDeptUserModal: false,
                                deptUserId: ''
                            });
                            this.fetchData({
                                ...this.props.searchObj,
                                keyWords: this.state.keyWords,
                                organIds: this.state.organIds,
                                positionIds: this.state.positionIds,
                                pageNo: 1,
                                currentMenu
                            });
                        }}
                    />
                )}
            </div>
        );
    }
}

export default UserList;
