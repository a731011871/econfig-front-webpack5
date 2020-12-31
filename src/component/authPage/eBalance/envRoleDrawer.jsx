import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {cloneDeep, includes, findIndex, find} from 'lodash';
import { Button, Table, Select } from 'antd';
import { i18nMessages } from 'src/i18n';

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

class envRoleDrawer extends React.PureComponent {
    static propTypes = {
        appId: PropTypes.string,
        onClose: PropTypes.func,
        envList: PropTypes.array,
        roleList: PropTypes.array,
        adminRoleList: PropTypes.array,
        selectProjects: PropTypes.array,
        intl: PropTypes.object,
        type: PropTypes.oneOf(['new', 'edit'])
    };

    columns = [
        {
            title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0287),
            dataIndex: 'envId',
            width: 200,
            render: text =>
                this.props.envList.filter(item => item.id === text)[0].name
        },
        {
            title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0134),
            dataIndex: 'roleId',
            width: 200,
            render: (roleId, record) => {
                let defaultValue = '';
                let { roleList, adminRoleList } = this.props;
                if (find(roleList.concat(adminRoleList), item => item.id === roleId)) {
                    defaultValue = roleId;
                }
                /**
                 *  角色中有部分角色是不可编辑的，选择时需要把isEdit的留下来，没有isEdit字段的筛选掉
                 *  编辑时  需要额外把isEdit不存在  但是被选中的角色保留下来*/
                if (this.props.type === 'edit') {
                    roleList = roleList.filter(item => item.isEdit || item.id === defaultValue);
                    adminRoleList = adminRoleList.filter(item => item.isEdit || item.id === defaultValue);
                } else {
                    roleList = roleList.filter(item => item.isEdit);
                    adminRoleList = adminRoleList.filter(item => item.isEdit);
                }
                return (
                    <Select
                        defaultValue={defaultValue}
                        style={{ width: 120 }}
                        onChange={value => {
                            this.roleSelect(value, record.envId);
                        }}
                    >
                        {record.envId !== 'ALL' &&
                        roleList.map(roleItem => (
                            <Option
                                key={roleItem.id}
                                title={roleItem.roleName}
                            >
                                {roleItem.roleName}
                            </Option>
                        ))}
                        {record.envId === 'ALL' &&
                        adminRoleList.map(roleItem => (
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
            projectData: []
        };
    }

    componentDidMount() {
        if (this.isEdit) {
            console.log('edit');
            const project = this.props.selectProjects[0];
            const selectedRowKeys = [];
            const projectData = project.envIds.map((item, index) => ({
                envId: item,
                roleId: project.roleIds[index],
                siteIds: project.siteIds[index],
                storageMap: project.storageMap[index]
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
                        roleId: project.roleIds[envIndex]
                    };
                } else {
                    return { envId: item.id, roleId: '' };
                }
            });
            console.log(projectData);
            this.setState({ tableData, selectedRowKeys, projectData });
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
        const projectData = cloneDeep(this.state.projectData);
        const selectProjects = cloneDeep(this.props.selectProjects);
        const { selectedRowKeys } = this.state;
        const selectRows = this.state.tableData.filter(item =>
            includes(selectedRowKeys, item.envId)
        );
        if (this.props.type === 'edit') {
            projectData.forEach(projectItem => {
                selectRows.forEach(selectItem => {
                    console.log(selectItem);
                    if (selectItem.roleId &&
                        selectItem.envId === projectItem.envId &&
                        selectItem.roleId === projectItem.roleId
                    ) {
                        selectItem.siteIds = projectItem.siteIds;
                        selectItem.storageMap = projectItem.storageMap;
                    } else if (selectItem.envId === projectItem.envId && selectItem.roleId !== projectItem.roleId){
                        selectItem.siteIds = [];
                    }
                });
            });
            console.log(selectRows);
            const projects = {projectIds: selectProjects[0].projectIds};
            projects.envIds = selectRows.map(item => item.envId);
            projects.roleIds = selectRows.map(item => item.roleId);
            projects.siteIds = selectRows.map(item => item.siteIds || []);
            projects.storageMap = selectRows.map(item => item.storageMap || []);
            this.props.saveRoleAndEnv([projects]);
        } else {
            selectProjects.forEach(projectItem => {
                projectItem.envIds = selectRows.map(item => item.envId);
                projectItem.roleIds = selectRows.map(item => item.roleId);
                projectItem.siteIds = selectRows.map((item, index) =>
                    projectItem.siteIds[index] ? projectItem.siteIds[index] : []
                );
                projectItem.storageMap = selectRows.map((item, index) =>
                    projectItem.storageMap[index] ? projectItem.storageMap[index] : []
                );
            });
            this.props.saveRoleAndEnv(selectProjects);
        }
        this.props.onClose();
    };

    render() {
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };
        console.log(this.props.selectProjects);
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
                        {this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                    </Button>
                </AbsoluteDiv>
            </div>
        );
    }
}

export default envRoleDrawer;
