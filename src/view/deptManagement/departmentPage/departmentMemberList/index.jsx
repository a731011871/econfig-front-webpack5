import React from 'react';
import PropType from 'prop-types';
import {
    Button,
    Table,
    Icon,
    Modal,
    Select,
    Input,
    message,
    DatePicker
} from 'antd';
// import { includes } from 'lodash';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { i18nMessages } from 'src/i18n';
import moment from 'moment/moment';
import { modalFun } from 'src/component/modal';
import ChangeDeptUserModal from './changeDeptUserModal';
import VlolumeAuth from './vlolumeAuth'; // 批量授权单页  SMS用的那个 废弃
// import VlolumeAuth from '@tms/econfig-volumeAuth'; // 批量授权组件
import VlolumeAuthModal from './volumeAuthModal';

const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1342126_4v1ksrtxe18.js'
});
const confirm = Modal.confirm;
const Option = Select.Option;
const Search = Input.Search;

class DepartmentMemberView extends React.PureComponent {
    static propTypes = {
        activeDepartmentId: PropType.string,
        activeDepartmentInfo: PropType.object,
        deptManagementEffects: PropType.object,
        deleteDepartmentMember: PropType.func,
        showDepartmentModal: PropType.func,
        deleteDepartment: PropType.func,
        fetchMember: PropType.func,
        toggleLoading: PropType.func,
        departmentMember: PropType.object,
        intl: PropType.object,
        history: PropType.object,
        location: PropType.object
    };

    constructor(props) {
        super(props);
        this.state = {
            searchObj: {
                status: '1',
                position: '',
                keyWords: '',
                pageIndex: 1,
                pageSize: 50
            },
            showDisableByTimeModal: false, // 定时禁用时间弹层
            activeUserId: '', // 选择要定时禁用的用户Id
            disabledTime: '', // 定时禁用的时间
            showDisabledModal: false, //
            positionList: [],
            selectedRowKeys: [],
            // 批量授权
            showVlolumeAuth: false,
            selectedUsers: [],
            vlolumeAuthApp: {}
        };
    }

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0081
            ),
            dataIndex: 'userName',
            width: 130,
            render: (text, record) => (
                <a
                    className="Block"
                    style={{
                        width: 50,
                        overflow: ''
                        // marginLeft: record.isLeader ? 16 : 0
                    }}
                    onClick={() => {
                        this.props.history.push({
                            pathname: `/department_manage/edit/${this.props.activeDepartmentInfo.id}/${record.userId}`,
                            searchObj: this.state.searchObj
                        });
                        // try {
                        //     const systemList = await $http.get(
                        //         `${urls.getFilterSoftList}?email=${record.email}`
                        //     );
                        //     const operateId = await $http.post(urls.userCheck, {
                        //         operateType: 'EDIT_USER',
                        //         backUrl: '/econfig/department_manage',
                        //         email: record.email,
                        //         accountId: record.accountId,
                        //         isEditTenantUser: '1',
                        //         isEditPlatformUser: '1',
                        //         isDeleteUser: '1',
                        //         // appIds: ['01','pv2','esupply', 'edc', '07', '11', 'site', '02']
                        //         appIds: systemList
                        //             .filter(
                        //                 item =>
                        //                     item.authType &&
                        //                     item.authType !== '1'
                        //             )
                        //             .map(item => item.appId)
                        //     });
                        //     this.props.history.push(
                        //         `/authuser/edit?operateId=${operateId}`
                        //     );
                        // } catch (e) {
                        //     message.error(e.message);
                        // }
                    }}
                >
                    {record.isLeader === 1 && (
                        <IconFont
                            type="tmyl-econfig-admin"
                            style={{ fontSize: 16 }}
                        />
                    )}
                    <span>{text}</span>
                </a>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0148
            ),
            dataIndex: 'accountName',
            width: 150,
            render: text => <div style={{ width: 50 }}>{text || ''}</div>
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0140
            ),
            dataIndex: 'email',
            width: 250,
            render: text => <div style={{ width: 150 }}>{text || ''}</div>
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0083
            ),
            dataIndex: 'mobile',
            width: 80,
            render: text => <div style={{ width: 90 }}>{text || ''}</div>
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0085
            ),
            dataIndex: 'positionName',
            width: 100,
            render: text => <div style={{ width: 50 }}>{text || ''}</div>
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0470
            ),
            dataIndex: 'organName',
            width: 200,
            render: text => <div style={{ minWidth: 50 }}>{text || ''}</div>
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0086
            ),
            dataIndex: 'status',
            width: 100,
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
            // render: text => (
            //     <div style={{ width: 50 }}>
            //         {text === '1'
            //             ? this.props.intl.formatMessage(
            //                 i18nMessages.ECONFIG_FRONT_A0273
            //             )
            //             : this.props.intl.formatMessage(
            //                 i18nMessages.ECONFIG_FRONT_A0274
            //             )}
            //     </div>
            // )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0087
            ),
            actions: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0030
            ),
            width: 200,
            key: 'action',
            render: (departmentMemberInfo, record) => {
                return (
                    <div style={{ minWidth: 60 }}>
                        <a
                            href="javascript:void(0)"
                            className="mRight8"
                            onClick={() => {
                                this.props.history.push({
                                    pathname: `/department_manage/edit/${this.props.activeDepartmentInfo.id}/${record.userId}`,
                                    searchObj: this.state.searchObj
                                });
                                // try {
                                //     const systemList = await $http.get(
                                //         `${urls.getFilterSoftList}?email=${record.email}`
                                //     );
                                //     const operateId = await $http.post(
                                //         urls.userCheck,
                                //         {
                                //             operateType: 'EDIT_USER',
                                //             backUrl:
                                //                 '/econfig/department_manage',
                                //             email: record.email,
                                //             isEditTenantUser: '1',
                                //             isEditPlatformUser: '1',
                                //             isDeleteUser: '1',
                                //             // appIds: ['01','pv2','esupply', 'edc', '07', '11', 'site', '02']
                                //             appIds: systemList
                                //                 .filter(
                                //                     item =>
                                //                         item.authType &&
                                //                         item.authType !== '1'
                                //                 )
                                //                 .map(item => item.appId)
                                //         }
                                //     );
                                //     this.props.history.push(
                                //         `/authuser/edit?operateId=${operateId}`
                                //     );
                                // } catch (e) {
                                //     message.error(e.message);
                                // }
                            }}
                        >
                            {/* {record.isLeader === 1 && (
                                <IconFont
                                    type="tmyl-econfig-admin"
                                    style={{ fontSize: 16 }}
                                />
                            )} */}
                            <span>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0098
                                )}
                            </span>
                        </a>
                        {departmentMemberInfo.status === '1' ? (
                            <a
                                className="mRight8"
                                dataid={departmentMemberInfo.userId}
                                href="javascript:void(0)"
                                onClick={() => {
                                    this.changeAdminStatus(
                                        departmentMemberInfo.userId,
                                        departmentMemberInfo.enabled
                                    );
                                }}
                            >
                                {departmentMemberInfo.enabled === '0'
                                    ? this.props.intl.formatMessage(
                                          i18nMessages.ECONFIG_FRONT_A0176
                                      )
                                    : this.props.intl.formatMessage(
                                          i18nMessages.ECONFIG_FRONT_A0177
                                      )}
                            </a>
                        ) : (
                            <a
                                className="mRight8"
                                dataid={departmentMemberInfo.userId}
                                dataemail={departmentMemberInfo.email}
                                href="javascript:void(0)"
                                onClick={() =>
                                    this.showRenSendConfirm(
                                        departmentMemberInfo
                                    )
                                }
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0147
                                )}
                            </a>
                        )}
                        {departmentMemberInfo.status === '1' &&
                        departmentMemberInfo.onlyCurrentOrgan ? (
                            <a
                                dataid={departmentMemberInfo.userId}
                                dataemail={departmentMemberInfo.email}
                                href="javascript:void(0)"
                                onClick={() => {
                                    this.setState({
                                        showDeptUserModal: true,
                                        changeDeptUserId:
                                            departmentMemberInfo.userId,
                                        organId: departmentMemberInfo.organId
                                    });
                                }}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0362
                                )}
                            </a>
                        ) : null}
                        {/* <a
                            className="mLeft15"
                            dataid={departmentMemberInfo.userId}
                            dataemail={departmentMemberInfo.email}
                            href="javascript:void(0)"
                            onClick={() => {
                                this.setState({
                                    showDeptUserModal: true,
                                    changeDeptUserId:
                                            departmentMemberInfo.userId
                                });
                            }}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0362
                            )}
                        </a> */}
                    </div>
                );
            }
        }
    ];

    async componentWillMount() {
        try {
            const positionList = await $http.post(urls.getPositionList, {
                dictTypeName: '用户职位'
            });
            if (this.props.location.searchObj) {
                this.fetchMember(this.props.location.searchObj);
            }
            this.setState({ positionList });
        } catch (e) {}
    }

    deleteDeptConfirm = () => {
        const _this = this;
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0228
            ),
            content: '',
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: () => {
                _this.props.deleteDepartment();
            },
            onCancel() {}
        });
    };

    fetchMember = (searchObj, clearSelectRowKeys = false) => {
        this.setState({
            searchObj,
            selectedRowKeys: clearSelectRowKeys
                ? []
                : this.state.selectedRowKeys
        });
        this.props.fetchMember(
            searchObj.status,
            searchObj.keyWords,
            searchObj.pageIndex,
            searchObj.pageSize,
            searchObj.position
        );
    };

    onExport = () => {
        const { id, organizeName } = this.props.activeDepartmentInfo;
        const searchObj = this.state.searchObj;
        const _this = this;
        console.log(searchObj);
        confirm({
            title: _this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0202
            ),
            content: _this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0222
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            async onOk() {
                try {
                    const obj = {};
                    if (searchObj.status === '2') {
                        obj.status = '';
                    } else if (searchObj.status === '1') {
                        obj.status = '1';
                        obj.enabled = '1';
                    } else if (searchObj.status === '0') {
                        obj.status = '0';
                    } else if (searchObj.status === '3') {
                        obj.enabled = '0';
                        obj.status = '1';
                    }
                    const result = await $http.post(`${urls.userExport}`, {
                        // status:
                        //     searchObj.status === '2' ? '' : searchObj.status,
                        departmentName: organizeName,
                        organId: id,
                        position: searchObj.position,
                        keyWord: searchObj.keyWords,
                        ...obj
                    });
                    if (result && result.relativeFileUrl) {
                        // location.href = result.relativeFileUrl;
                        window.open(result.relativeFileUrl);
                    } else {
                        message.info(
                            _this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0282
                            )
                        );
                    }
                } catch (e) {
                    message.error(e.message);
                }
            }
        });
    };

    changeAdminStatus = async (userId, enabled) => {
        if (enabled === '1') {
            this.setState({ showDisabledModal: true, activeUserId: userId });
            // this.showDisableConfirm(userId);
        } else {
            this.props.toggleLoading();
            try {
                await $http.get(`${urls.enableUser}?userId=${userId}`);
                message.success(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0231
                    )
                );
                this.props.deptManagementEffects.fetchDepartment();
                this.fetchMember(this.state.searchObj);
            } catch (e) {
                message.error(e.message);
            } finally {
                this.props.toggleLoading();
            }
        }
    };

    showRenSendConfirm = departmentMemberInfo => {
        const { userId, email } = departmentMemberInfo;
        confirm({
            title: this.props.intl
                .formatMessage(i18nMessages.ECONFIG_FRONT_A0234)
                .replace('xx', email),
            content: null,
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: async () => {
                try {
                    await $http.get(
                        `${urls.resendUser}?userId=${userId}&email=${email}`
                    );
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

    doTimeDisableUsers = async () => {
        if (this.state.disabledTime) {
            this.props.toggleLoading();
            try {
                await $http.get(
                    `${urls.disableUser}?userId=${this.state.activeUserId}&disableTime=${this.state.disabledTime}`
                );
                message.success(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0232
                    )
                );
                this.fetchMember(this.state.searchObj);
                this.setState({
                    disabledTime: '',
                    activeUserId: '',
                    showDisableByTimeModal: false
                });
            } catch (e) {
                message.error(e.message);
            } finally {
                this.props.toggleLoading();
            }
        } else {
            message.error(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0237)
            );
        }
    };

    clearSearch = () => {
        this.setState({
            searchObj: {
                status: '1',
                keyWords: '',
                pageIndex: 1,
                pageSize: 50
            }
        });
    };

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    volumeAuth = async () => {
        try {
            const { selectedRowKeys } = this.state;
            const appList = (await $http.get(urls.getAuthAppList)) || [];

            // const selectedUsers = userList
            //     .asMutable({ deep: true })
            //     .filter(item => includes(selectedRowKeys, item.userId));
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
                        selectedRowKeys={selectedRowKeys}
                    />
                )
            });
        } catch (error) {
            message.error(error.message);
        }
    };

    closeVolumeAuth = reload => {
        // 是否要刷新列表
        this.setState(
            {
                showVlolumeAuth: false,
                vlolumeAuthApp: {}
            },
            () => {
                if (reload) {
                    this.props.deptManagementEffects.fetchDepartment();
                    this.fetchMember(this.state.searchObj);
                }
            }
        );
    };

    render() {
        const formatMessage = this.props.intl.formatMessage;
        const {
            selectedRowKeys,
            showVlolumeAuth,
            selectedUsers,
            vlolumeAuthApp
        } = this.state;
        const {
            organizeName,
            organizeCasecadeUserCount
        } = this.props.activeDepartmentInfo;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
            // getCheckboxProps: item => ({
            //     // disabled: item.status === '1' || !item.email
            //     disabled: !item.email
            // })
        };
        return (
            <div className="departmentMember memberView flex mLeft10">
                {showVlolumeAuth && (
                    <VlolumeAuth
                        appId={vlolumeAuthApp.appId}
                        appName={vlolumeAuthApp.appName}
                        selectedUsers={selectedUsers.map((item, index) => ({
                            ...item,
                            uniqueId: `${new Date().getTime()}${index}`
                        }))}
                        {...this.props}
                        closeVolumeAuth={this.closeVolumeAuth}
                    />
                )}

                {/* 批量授权组件测试 */}
                {/* {showVlolumeAuth && (
                    <VlolumeAuth
                        visible={showVlolumeAuth}
                        appIds={['site']}
                        userIds={selectedRowKeys}
                        onClose={this.closeVolumeAuth}
                    />
                )} */}
                <div className="mBottom15 Font16">
                    <span>
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0471)}：
                    </span>
                    <span>
                        {`${organizeName} (${formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0496
                        ).replace('xx', organizeCasecadeUserCount)})`}
                    </span>
                </div>
                <div className="header Relative">
                    <span className="Bold Font16 LineHeight32">
                        {' '}
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0245)}
                    </span>
                    <Button
                        type="primary"
                        className="mLeft15"
                        disabled={!this.props.activeDepartmentId}
                        onClick={() => {
                            this.props.history.push({
                                pathname: `/department_manage/new/${this.props.activeDepartmentId}`,
                                searchObj: this.state.searchObj
                            });
                        }}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0280
                        )}
                    </Button>
                    <Button
                        className="mLeft15"
                        disabled={!this.props.activeDepartmentId}
                        onClick={this.onExport}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0029)}
                    </Button>
                    <Button
                        className="mLeft15"
                        type="primary"
                        disabled={!selectedRowKeys.length}
                        onClick={this.volumeAuth}
                        // onClick={() => this.setState({ showVlolumeAuth: true })}
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0704)}
                    </Button>
                    {/*{this.props.activeDepartmentId && (*/}
                    {/*<Button*/}
                    {/*type="primary"*/}
                    {/*className="Right mRight15"*/}
                    {/*onClick={() => {*/}
                    {/*this.props.showDepartmentModal();*/}
                    {/*}}*/}
                    {/*>*/}
                    {/*{formatMessage(i18nMessages.ECONFIG_FRONT_A0032)}*/}
                    {/*</Button>*/}
                    {/*)}*/}
                    {/*{this.props.activeDepartmentId && (*/}
                    {/*<Button*/}
                    {/*type="primary"*/}
                    {/*className="Right mRight15"*/}
                    {/*disabled={!this.props.activeDepartmentInfo.parentId}*/}
                    {/*onClick={this.deleteDeptConfirm}*/}
                    {/*>*/}
                    {/*{formatMessage(i18nMessages.ECONFIG_FRONT_A0033)}*/}
                    {/*</Button>*/}
                    {/*)}*/}
                </div>
                <div className="filterAndSearchBox mTop15">
                    <div className="InlineBlock mRight40 TxtMiddle mBottom20">
                        <span className="mRight8 TxtMiddle">
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0472)}
                        </span>
                        <Search
                            className="TxtMiddle"
                            placeholder={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0467
                            )}
                            enterButton={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0493
                            )}
                            value={this.state.searchObj.keyWords}
                            onChange={e => {
                                this.setState({
                                    searchObj: {
                                        ...this.state.searchObj,
                                        keyWords: e.target.value
                                    }
                                });
                            }}
                            onSearch={value => {
                                this.fetchMember({
                                    ...this.state.searchObj,
                                    keyWords: value
                                });
                            }}
                            style={{ width: 340 }}
                        />
                    </div>
                    <div className="InlineBlock mRight40 TxtMiddle mBottom20">
                        <span className="mRight8">
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0085)}
                        </span>
                        <Select
                            className="mRight15"
                            style={{ width: 200 }}
                            allowClear
                            value={this.state.searchObj.position || ''}
                            onChange={value => {
                                this.fetchMember({
                                    ...this.state.searchObj,
                                    position: value
                                });
                            }}
                        >
                            {this.state.positionList.map(item => (
                                <Option key={item.id}>{item.name}</Option>
                            ))}
                        </Select>
                    </div>
                    <div className="InlineBlock TxtMiddle mBottom20">
                        <span className="mRight8">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0086
                            )}
                        </span>
                        <Select
                            className="mRight15"
                            style={{ width: 200 }}
                            defaultValue="1"
                            value={this.state.searchObj.status || '1'}
                            onChange={value => {
                                this.fetchMember({
                                    ...this.state.searchObj,
                                    status: value
                                });
                            }}
                        >
                            <Option key="2">
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0283
                                )}
                            </Option>
                            <Option key="0">
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0274
                                )}
                            </Option>
                            <Option key="1">
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0652
                                )}
                            </Option>
                            <Option key="3">
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0653
                                )}
                            </Option>
                        </Select>
                    </div>
                </div>
                <div className="memberList">
                    <Table
                        rowSelection={rowSelection}
                        rowKey="userId"
                        pagination={{
                            size: 'small',
                            current: this.state.searchObj.pageIndex,
                            pageSize: this.state.searchObj.pageSize,
                            total: this.props.departmentMember.total || 0,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            defaultPageSize: 50,
                            showTotal: total =>
                                `${this.props.intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            onChange: (pageIndex, pageSize) => {
                                this.fetchMember(
                                    {
                                        ...this.state.searchObj,
                                        pageIndex,
                                        pageSize
                                    },
                                    true
                                );
                            },
                            onShowSizeChange: (pageIndex, pageSize) => {
                                this.fetchMember({
                                    ...this.state.searchObj,
                                    pageIndex,
                                    pageSize
                                });
                            }
                        }}
                        dataSource={this.props.departmentMember.list || []}
                        columns={this.columns}
                    />
                </div>
                {this.state.showDeptUserModal && (
                    <ChangeDeptUserModal
                        visible={this.state.showDeptUserModal}
                        intl={this.props.intl}
                        userId={this.state.changeDeptUserId}
                        organId={this.state.organId}
                        sourceOrganId={this.props.activeDepartmentId}
                        hideModal={() => {
                            this.setState({
                                showDeptUserModal: false,
                                changeDeptUserId: '',
                                organId: ''
                            });
                            this.props.deptManagementEffects.fetchDepartment();
                            this.fetchMember(this.state.searchObj);
                            // this.fetchMember(this.state.searchObj);
                        }}
                    />
                )}
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
                                        this.props.toggleLoading();
                                        try {
                                            await $http.get(
                                                `${urls.disableUser}?userId=${this.state.activeUserId}`
                                            );
                                            message.success(
                                                this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0232
                                                )
                                            );
                                            this.props.deptManagementEffects.fetchDepartment();
                                            this.fetchMember(
                                                this.state.searchObj
                                            );
                                        } catch (e) {
                                            message.error(e.message);
                                        } finally {
                                            this.props.toggleLoading();
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
            </div>
        );
    }
}

export default DepartmentMemberView;
