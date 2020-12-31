import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { cloneDeep, includes, findIndex, find } from 'lodash';
import { Button, Table, Select } from 'antd';
import { i18nMessages } from 'src/i18n/index';

const Option = Select.Option;
const AbsoluteDiv = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #fff;
`;

class roleAndEnvDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        onClose: PropTypes.func,
        envList: PropTypes.array,
        roleList: PropTypes.array,
        selectAuthItem: PropTypes.array,
        type: PropTypes.oneOf(['new', 'edit']) // new-点击"添加角色/环境"进入侧滑   edit-点击项目名称进入侧滑
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0287
            ),
            dataIndex: 'envId',
            width: 200,
            render: text =>
                this.props.envList.filter(item => item.id === text)[0].name
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0134
            ),
            dataIndex: 'roleId',
            width: 200,
            render: (roleId, record) => {
                let defaultValue = '';
                if (find(this.props.roleList, item => item.id === roleId)) {
                    defaultValue = roleId;
                }
                /**
                 *  角色中有部分角色是不可编辑的，选择时需要把isEdit的留下来，没有isEdit字段的筛选掉
                 *  编辑时  需要额外把isEdit不存在  但是被选中的角色保留下来*/
                let { roleList } = this.props;
                if (this.props.type === 'edit') {
                    roleList = roleList.filter(
                        item => item.isEdit || item.id === defaultValue
                    );
                } else {
                    roleList = roleList.filter(item => item.isEdit);
                }
                return (
                    <Select
                        defaultValue={defaultValue}
                        style={{ width: 120 }}
                        onChange={value => {
                            this.roleSelect(value, record.envId, 'project');
                        }}
                    >
                        {roleList.map(roleItem => (
                            <Option key={roleItem.id} title={roleItem.roleName}>
                                {roleItem.roleName}
                            </Option>
                        ))}
                    </Select>
                );
            }
        }
    ];

    get isEdit() {
        return this.props.type === 'edit';
    }

    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            tableData: [],
            selectAuthTableData: []
        };
    }

    componentDidMount() {
        if (this.isEdit) {
            console.log('edit');
            let project = cloneDeep(this.props.selectAuthItem);
            project = {
                ...project,
                envIds: project.envIds.map(item =>
                    item === '' ? '建库环境' : item
                )
            };
            const selectedRowKeys = [];
            const selectAuthTableData = project.envIds.map((item, index) => ({
                envId: item === '' ? '建库环境' : item,
                roleId: project.roleIds[index],
                siteIds: project.siteIds[index],
                isAllProSite: project.isAllProSites[index]
            }));

            const tableData = this.props.envList.map(item => {
                if (includes(project.envIds, item.id)) {
                    const envIndex = findIndex(
                        project.envIds,
                        envItem => item.id === envItem
                    );
                    selectedRowKeys.push(item.id);
                    return {
                        envId: item.id,
                        roleId: project.roleIds[envIndex] || '',
                        isAllProSite: project.isAllProSites[envIndex] || '0'
                    };
                } else {
                    return { envId: item.id, roleId: '', isAllProSite: '0' };
                }
            });
            console.log(selectAuthTableData);
            this.setState({ tableData, selectedRowKeys, selectAuthTableData });
        } else {
            const tableData = this.props.envList.map(item => {
                return { envId: item.id, roleId: '' };
            });
            this.setState({ tableData });
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

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };

    saveRoleAndEnv = () => {
        const selectAuthTableData = cloneDeep(this.state.selectAuthTableData);
        const selectAuthItem = cloneDeep(this.props.selectAuthItem);
        const { selectedRowKeys } = this.state;
        const selectRows = this.state.tableData.filter(item =>
            includes(selectedRowKeys, item.envId)
        );
        selectRows.forEach(tableRow => {
            selectAuthTableData.forEach(authData => {
                if (tableRow.envId === authData.envId) {
                    tableRow.siteIds = authData.siteIds;
                    tableRow.isAllProSite = authData.isAllProSite;
                }
            });
        });
        const projects = {
            projectIds: selectAuthItem.projectIds,
            roleType: selectAuthItem.roleType
        };
        projects.envIds = selectRows.map(item => item.envId);
        projects.roleIds = selectRows.map(item => item.roleId);
        projects.siteIds = selectRows.map(item => item.siteIds || []);
        projects.isAllProSites = selectRows.map(item => item.isAllProSite);
        this.props.saveRoleAndEnv([projects]);
        this.props.onClose();
    };

    render() {
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };
        return (
            <div className="projectDrawer">
                <Table
                    rowKey={record => record.envId}
                    rowSelection={rowSelection}
                    dataSource={this.state.tableData}
                    columns={this.columns}
                    pagination={false}
                />
                <AbsoluteDiv>
                    <span className="mLeft15 mTop20 Left InlineBlock">
                        {/*已选{this.state.selectedRowKeys.length}个环境*/}
                        {this.props.intl
                            .formatMessage(i18nMessages.ECONFIG_FRONT_A0289)
                            .replace(
                                'xx',
                                this.state.selectedRowKeys.length || 0
                            )}
                    </span>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="mRight15 mBottom15 mTop15"
                        onClick={this.saveRoleAndEnv}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0062
                        )}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default roleAndEnvDrawer;
