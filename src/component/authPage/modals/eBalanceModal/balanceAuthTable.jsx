import React from 'react';
import PropTypes from 'prop-types';
import { i18nMessages } from 'src/i18n';
import { Select, Table, Divider } from 'antd';
import { includes, find } from 'lodash';

const Option = Select.Option;

class balanceAuthTable extends React.PureComponent {
    static propTypes = {
        envList: PropTypes.array,
        siteList: PropTypes.array,
        storageList: PropTypes.array,
        roleList: PropTypes.array,
        onChangeData: PropTypes.func,
        selectProjectId: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            tableData: [],
            tableKey: 0
        };
    }

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0287
            ),
            dataIndex: 'envId',
            width: 100,
            render: text =>
                this.props.envList.filter(item => item.id === text)[0].name
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0134
            ),
            dataIndex: 'roleId',
            width: 150,
            render: (roleId, record) => {
                const disabled = !includes(
                    this.state.selectedRowKeys,
                    record.envId
                );
                let adminRoleList = [];
                let roleList = [];
                // 判断前一次选中的role是否在roleList中，如果不在，赋值为''
                let defaultValue = '';
                if (find(this.props.roleList, item => item.id === roleId)) {
                    defaultValue = roleId;
                }

                // 拆分用户列表
                if (this.props.selectProjectId === 'ALL') {
                    roleList = this.props.roleList.filter(
                        item =>
                            item.needProject === 0 &&
                            item.nullProjectDefaultValue === 'ALL' &&
                            item.needEnv === 1 &&
                            item.needSite === 0
                    );
                    adminRoleList = this.props.roleList.filter(
                        item => item.roleType === 'admin'
                    );
                } else {
                    roleList = this.props.roleList.filter(
                        item => item.needProject === 1 && item.needEnv === 1
                    );
                    adminRoleList = this.props.roleList.filter(
                        item =>
                            item.roleType === 'admin' && item.needProject === 1
                    );
                }

                return (
                    <Select
                        value={defaultValue}
                        style={{ width: 190 }}
                        optionFilterProp="children"
                        showSearch
                        onChange={value => {
                            this.roleSelect(value, record.envId);
                        }}
                        disabled={disabled}
                        placeholder={this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0298)}
                    >
                        {record.envId !== 'ALL'
                            ? roleList.filter(item => item.isEdit).map(roleItem => (
                                <Option
                                    key={roleItem.id}
                                    title={roleItem.roleName}
                                >
                                    {roleItem.roleName}
                                </Option>
                            ))
                            : adminRoleList.filter(item => item.isEdit).map(roleItem => (
                                <Option
                                    key={roleItem.id}
                                    title={roleItem.roleName}
                                >
                                    {roleItem.roleName}
                                </Option>
                            ))}
                    </Select>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0069
            ),
            dataIndex: 'siteIds',
            width: 200,
            render: (siteIds, record) => {
                let disabled =
                    !includes(this.state.selectedRowKeys, record.envId) ||
                    !record.roleId;
                let placeholder = '';
                const selectRole = find(
                    this.props.roleList,
                    item => item.id === record.roleId
                );
                if (
                    record.roleId && selectRole &&
                    includes(this.state.selectedRowKeys, record.envId)
                ) {
                    if (selectRole.needSite === 0) {
                        disabled = true;
                        placeholder =
                            selectRole.nullSiteDefaultValue === 'ALL'
                                ? this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0296
                                )
                                : this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0197
                                );
                    }
                }
                // else if (
                //     includes(this.state.selectedRowKeys, record.envId) &&
                //     !record.roleId
                // ) {
                //     placeholder = '请选择角色';
                // } else if (
                //     !includes(this.state.selectedRowKeys, record.envId) ||
                //     !record.roleId
                // ) {
                //     placeholder = '请选择环境';
                // }
                return (
                    <Select
                        value={siteIds}
                        style={{ width: 390 }}
                        optionFilterProp="children"
                        showSearch
                        labelInValue
                        mode="multiple"
                        onChange={value => {
                            this.siteSelect(value, record.envId);
                        }}
                        disabled={disabled}
                        placeholder={placeholder}
                        dropdownRender={menu => (
                            <div>
                                {menu}
                                <Divider style={{ margin: '4px 0' }} />
                                <a
                                    style={{
                                        display: 'Block',
                                        padding: '5px 12px'
                                    }}
                                    onMouseDown={e => {
                                        e.preventDefault();
                                    }}
                                    onClick={() => this.siteAllSelect(record.envId)}
                                >
                                    {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0195)}
                                </a>
                            </div>
                        )}
                    >
                        {this.props.siteList.map(siteItem => (
                            <Option key={siteItem.value} title={siteItem.label}>
                                {siteItem.label}
                            </Option>
                        ))}
                    </Select>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0165
            ),
            dataIndex: 'storageMap',
            width: 150,
            render: (storageMap, record) => {
                let disabled =
                    !includes(this.state.selectedRowKeys, record.envId) ||
                    !record.roleId;
                let placeholder = '';
                const selectRole = find(
                    this.props.roleList,
                    item => item.id === record.roleId
                );
                if (
                    record.roleId && selectRole &&
                    includes(this.state.selectedRowKeys, record.envId)
                ) {
                    if (selectRole.needStoreroom === 0) {
                        disabled = true;
                        placeholder =
                            selectRole.nullStoreroomDefaultValue === 'ALL'
                                ? this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0342
                                )
                                :  this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0196
                                );
                    }
                }
                // else if (
                //     includes(this.state.selectedRowKeys, record.envId) &&
                //     !record.roleId
                // ) {
                //     placeholder = '请选择角色';
                // } else if (
                //     !includes(this.state.selectedRowKeys, record.envId) ||
                //     !record.roleId
                // ) {
                //     placeholder = '请选择环境';
                // }
                return (
                    <Select
                        value={storageMap}
                        style={{ width: 200 }}
                        optionFilterProp="children"
                        showSearch
                        labelInValue
                        mode="multiple"
                        onChange={value => {
                            this.storageSelect(value, record.envId);
                        }}
                        disabled={disabled}
                        placeholder={placeholder}
                    >
                        {this.props.storageList.map(roleItem => (
                            <Option key={roleItem.value} title={roleItem.label}>
                                {roleItem.label}
                            </Option>
                        ))}
                    </Select>
                );
            }
        }
    ];

    componentDidMount() {
        const tableData = this.props.envList.map(item => {
            return { envId: item.id, roleId: '', siteIds: [], storageMap: [] };
        });
        this.setState({ tableData });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectProjectId !== this.props.selectProjectId) {
            const tableData = this.props.envList.map(item => {
                return { envId: item.id, roleId: '', siteIds: [], storageMap: [] };
            });
            this.setState({
                tableData,
                tableKey: Math.random()
            });
        }
    }

    roleSelect = (roleId, envId) => {
        const { roleList } = this.props;
        const tableData = this.state.tableData.concat();
        tableData.forEach(item => {
            if (item.envId === envId) {
                item.roleId = roleId;
                const role = find(roleList, item => item.id === roleId);
                if (role.needSite === 0) {
                    item.siteIds = [];
                }
                if (role.needStoreroom === 0) {
                    item.storageMap = [];
                }
            }
        });
        this.setState({ tableData });
    };

    siteSelect = (values, envId) => {
        const tableData = this.state.tableData.concat();
        // const site = {};
        // values.forEach(siteItem => {
        //     site[siteItem.key] = siteItem.label;
        // });
        tableData.forEach(item => {
            if (item.envId === envId) {
                item.siteIds = values;
            }
        });
        this.setState({ tableData });
    };

    siteAllSelect = (envId) => {
        const tableData = this.state.tableData.concat();
        // const site = {};
        // values.forEach(siteItem => {
        //     site[siteItem.key] = siteItem.label;
        // });
        tableData.forEach(item => {
            if (item.envId === envId) {
                item.siteIds = this.props.siteList.map(site => ({ key: site.value, label: site.label }));
            }
        });
        this.setState({ tableData });
    };

    storageSelect = (values, envId) => {
        const tableData = this.state.tableData.concat();
        // const storage = {};
        // values.forEach(storageItem => {
        //     storage[storageItem.key] = storageItem.label;
        // });
        tableData.forEach(item => {
            if (item.envId === envId) {
                item.storageMap = values;
            }
        });
        this.setState({ tableData });
    };

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };

    getData = () => {
        const { selectedRowKeys } = this.state;
        const selectRows = this.state.tableData.filter(item =>
            includes(selectedRowKeys, item.envId)
        );
        const projectList = [
            {
                projectIds: [this.props.selectProjectId],
                envIds: selectRows.map(item => item.envId),
                roleIds: selectRows.map(item => item.roleId),
                siteIds: selectRows.map(item => {
                    const site = {};
                    item.siteIds.forEach(siteItem => {
                        site[siteItem.key] = siteItem.label;
                    });
                    return site;
                }),
                storageMap: selectRows.map(item => {
                    const storage = {};
                    item.storageMap.forEach(storageItem => {
                        storage[storageItem.key] = storageItem.label;
                    });
                    return storage;
                })
            }
        ];
        return projectList;
    };

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };

    render() {
        const { selectedRowKeys, tableKey } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };
        return (
            <div>
                <Table
                    key={tableKey}
                    rowKey={record => record.envId}
                    rowSelection={rowSelection}
                    dataSource={this.state.tableData}
                    columns={this.columns}
                    pagination={false}
                    scroll={{ x: true }}
                />
            </div>
        );
    }
}

export default balanceAuthTable;
