import React from 'react';
import PropTypes from 'prop-types';
import { i18nMessages } from 'src/i18n';
import { Select, Table, Divider, Checkbox } from 'antd';
import { find, includes } from 'lodash';

const Option = Select.Option;

class ECollect5AuthTable extends React.PureComponent {
    static propTypes = {
        envList: PropTypes.array,
        siteList: PropTypes.array,
        allRole: PropTypes.array,
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
                this.props.envList.filter(item => item.id === text)[0]?.name
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
                let defaultValue = '';
                if (find(this.props.roleList, item => item.id === roleId)) {
                    defaultValue = roleId;
                }
                return (
                    <Select
                        defaultValue={defaultValue}
                        style={{ width: 200 }}
                        optionFilterProp="children"
                        showSearch
                        onChange={value => {
                            this.roleSelect(value, record.envId, 'role');
                        }}
                        disabled={disabled}
                        // placeholder={disabled ? '请选择环境' : ''}
                    >
                        {this.props.roleList
                            .filter(item => item.isEdit)
                            .map(roleItem => (
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
                    !record.roleId ||
                    record.isAllProSite === '1';
                let placeholder = '';
                if (
                    record.roleId &&
                    includes(this.state.selectedRowKeys, record.envId)
                ) {
                    const selectRole = find(
                        this.props.allRole,
                        item => item.id === record.roleId
                    );
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
                                    onClick={() =>
                                        this.siteAllSelect(record.envId)
                                    }
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0195
                                    )}
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
            title: ' ',
            dataIndex: 'isAllProSite',
            width: 150,
            render: (text, record) => {
                let disabled =
                    !includes(this.state.selectedRowKeys, record.envId) ||
                    !record.roleId;
                if (
                    record.roleId &&
                    includes(this.state.selectedRowKeys, record.envId)
                ) {
                    const selectRole = find(
                        this.props.allRole,
                        item => item.id === record.roleId
                    );
                    if (selectRole.needSite === 1) {
                        disabled = false;
                    }
                }
                return (
                    <Checkbox
                        disabled={disabled}
                        cbhecked={text === '1'}
                        onChange={e =>
                            this.allSiteChange(e.target.checked, record.envId)
                        }
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0714
                        )}
                    </Checkbox>
                );
            }
        }
    ];

    componentDidMount() {
        const tableData = this.props.envList.map(item => {
            return {
                envId: item.id,
                roleId: '',
                siteIds: [],
                isAllProSite: '0'
            };
        });
        this.setState({ tableData });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectProjectId !== this.props.selectProjectId) {
            const tableData = this.props.envList.map(item => ({
                envId: item.id,
                roleId: '',
                siteIds: [],
                isAllProSite: '0'
            }));
            this.setState({ tableData, tableKey: Math.random() });
        }
    }

    roleSelect = (roleId, envId) => {
        const tableData = this.state.tableData.concat();
        tableData.forEach(item => {
            if (item.envId === envId) {
                item.roleId = roleId;
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

    allSiteChange = (checked, envId) => {
        const tableData = this.state.tableData.concat();
        tableData.forEach(item => {
            if (item.envId === envId) {
                item.isAllProSite = checked ? '1' : '0';
                if (checked) {
                    item.siteIds = this.props.siteList.map(item => ({
                        key: item.value,
                        label: item.label
                    }));
                }
            }
        });
        this.setState({ tableData });
    };

    siteAllSelect = envId => {
        const tableData = this.state.tableData.concat();
        // const site = {};
        // values.forEach(siteItem => {
        //     site[siteItem.key] = siteItem.label;
        // });
        tableData.forEach(item => {
            if (item.envId === envId) {
                item.siteIds = this.props.siteList.map(site => ({
                    key: site.value,
                    label: site.label
                }));
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
                roleType: this.props.edcAppType,
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
                isAllProSites: selectRows.map(item => item.isAllProSite)
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

export default ECollect5AuthTable;
