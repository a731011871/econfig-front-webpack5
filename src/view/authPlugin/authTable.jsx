import React from 'react';
import PropTypes from 'prop-types';
import { find, uniq, uniqBy, includes } from 'lodash';
import styled from 'styled-components';
import { Button, Input, Table, TreeSelect, Icon, Popover } from 'antd';
import SelectSite from './selectModal/selectSite';
import SelectRole from './selectModal/selectRole';
import SelectOrgan from './selectModal/selectOrgan';
import AuthRow from './authRow/authRow';
import { i18nMessages } from 'src/i18n';
import FilterColumnContent from './filterColumnContent';

const Search = Input.Search;
const TreeNode = TreeSelect.TreeNode;
const TableBox = styled(Table)`
    tbody {
        td {
            position: relative;
        }
    }
`;

export default class AuthTable extends React.PureComponent {
    static propTypes = {
        operateData: PropTypes.object.isRequired,
        roleList: PropTypes.array.isRequired,
        allRoleList: PropTypes.array.isRequired,
        siteList: PropTypes.array.isRequired,
        formatMessage: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            allRoleList: props.allRoleList || [],
            roleList: props.roleList || [],
            buttonDisalbed: true, // 批量添加角色，批量添加中心按钮禁用
            projectId: props.operateData?.projectId || '',
            searchKeyWord: '',
            showSelectSiteModal: false,
            showSelectRoleModal: false,
            showSelectOrganModal: false,
            selectAuthInfo: {}, // 单个角色添加中心时候保存下的uniqueId, roleId和当前已选择的siteIds
            tableData: props.operateData?.baseUserDtos,
            filterColumns: [
                'userName',
                'email',
                'roleIds',
                'siteIds',
                'action'
            ], //要显示的列
            showFilterContent: false // 控制筛选列组件显示
        };
    }

    get operateId() {
        return window.location.search?.split('=')[1] || '';
    }

    onSelectChange = selectedRowKeys => {
        this.setState({
            selectedRowKeys,
            buttonDisalbed: selectedRowKeys.length <= 0
        });
    };

    showSelectSiteModal = (uniqueId, roleId, siteIds) => {
        this.setState({
            showSelectSiteModal: true,
            selectAuthInfo: { uniqueId, roleId, siteIds }
        });
    };

    hideSelectSiteModal = () => {
        this.setState({
            showSelectSiteModal: false,
            selectAuthInfo: {}
        });
    };

    changeRole = (uniqueId, authId, roleId) => {
        const { roleList } = this.state;
        const tableData = this.state.tableData.concat();
        tableData.forEach(dataItem => {
            if (dataItem.uniqueId === uniqueId) {
                dataItem.authData.forEach(item => {
                    // 更换角色时候检查新老角色的needSite状态，如果needSite相等，则siteIds保留。不相等 siteIds清空
                    const oldRole = find(
                        roleList,
                        roleItem => roleItem.id === item.roleId
                    );
                    const newRole = find(
                        roleList,
                        roleItem => roleItem.id === roleId
                    );
                    if (item.authId === authId) {
                        item.roleId = roleId;
                        if (oldRole && oldRole.needSite !== newRole.needSite) {
                            item.siteIds = [];
                        }
                    }
                });
            }
        });
        this.setState({ tableData });
    };

    onSelectRole = roleIds => {
        const { selectedRowKeys, projectId } = this.state;
        const {
            operateData: { source: appId }
        } = this.props;
        const tableData = this.state.tableData.concat();
        tableData.forEach(dataItem => {
            if (includes(selectedRowKeys, dataItem.uniqueId)) {
                let newAuthData = dataItem.authData || [];
                if (appId === 'sms') {
                    newAuthData[0] = newAuthData[0]
                        ? Object.assign(newAuthData[0], {
                            roleId: roleIds,
                            siteIds: []
                        })
                        : {
                            authId: `${new Date().getTime()}-auth`,
                            roleId: roleIds,
                            projectId,
                            siteIds: []
                        };
                } else {
                    newAuthData = newAuthData
                        .concat(
                            roleIds.map((roleId, index) => ({
                                authId: `${new Date().getTime()}-${index}`,
                                roleId,
                                projectId,
                                siteIds: []
                            }))
                        )
                        .filter(item => item.roleId);
                }
                dataItem.authData = uniqBy(newAuthData, item => item.roleId);
            }
        });
        this.setState({ tableData, showSelectRoleModal: false });
    };

    deleteAuth = (uniqueId, roleId) => {
        const tableData = this.state.tableData.concat();
        tableData.forEach(dataItem => {
            if (uniqueId === dataItem.uniqueId) {
                dataItem.authData = dataItem.authData.filter(
                    item => item.roleId !== roleId
                );
            }
        });
        this.setState({
            tableData
        });
    };

    onSelectSite = siteIds => {
        const { roleList, selectAuthInfo, selectedRowKeys } = this.state;
        const tableData = this.state.tableData.concat();
        tableData.forEach(dataItem => {
            if (dataItem.authData) {
                /**
                 * 选择中心有单个角色选择中心和批量选择中心
                 * selectAuthInfo.uniqueId存在时为单个角色选择中心，uniqueId和roleId双重匹配
                 * selectAuthInfo.uniqueId不存在时为批量添加中心， 直接给所有用户的所有角色(角色需要存在且needSite === 1)添加中心，然后去重，防止重复添加
                 */
                if (
                    selectAuthInfo.uniqueId &&
                    selectAuthInfo.uniqueId === dataItem.uniqueId
                ) {
                    dataItem.authData.forEach(authItem => {
                        if (authItem.roleId === selectAuthInfo.roleId) {
                            authItem.siteIds = siteIds;
                        }
                    });
                } else if (
                    !selectAuthInfo.uniqueId &&
                    includes(selectedRowKeys, dataItem.uniqueId)
                ) {
                    dataItem.authData.forEach(authItem => {
                        const role = find(
                            roleList,
                            item => item.id === authItem.roleId
                        );
                        if (role && role.needSite === 1) {
                            authItem.siteIds = uniq(
                                authItem.siteIds.concat(siteIds)
                            );
                        }
                    });
                }
            }
        });
        this.setState({
            showSelectSiteModal: false,
            selectAuthInfo: {},
            tableData
        });
    };

    deleteSite = (uniqueId, roleId, siteId) => {
        const tableData = this.state.tableData.concat();
        tableData.forEach(dataItem => {
            if (uniqueId === dataItem.uniqueId) {
                dataItem.authData.forEach(authItem => {
                    if (authItem.roleId === roleId) {
                        authItem.siteIds = authItem.siteIds.filter(
                            item => item !== siteId
                        );
                    }
                });
            }
        });
        this.setState({
            tableData
        });
    };

    onSelectOrgan = organIds => {
        //如果所属部门被删空，手动赋值顶级部门
        const { departmentList } = this.props;
        const { selectedRowKeys } = this.state;
        const tableData = this.state.tableData.concat();
        tableData.forEach(dataItem => {
            if (
                includes(selectedRowKeys, dataItem.uniqueId) &&
                dataItem.userProperty === 'CompanyUser'
            ) {
                dataItem.organIds = organIds.length
                    ? organIds
                    : dataItem.userProperty === 'CompanyUser'
                        ? [departmentList[0].id]
                        : [];
            }
        });
        this.setState({
            tableData,
            showSelectOrganModal: false
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

    organChange = (values, uniqueId) => {
        //如果所属部门被删空，手动赋值顶级部门
        const { departmentList } = this.props;
        const tableData = this.state.tableData.concat();
        tableData.forEach(dataItem => {
            if (uniqueId === dataItem.uniqueId) {
                dataItem.organIds = values.length
                    ? values
                    : dataItem.userProperty === 'CompanyUser'
                        ? [departmentList[0].id]
                        : [];
            }
        });
        this.setState({
            tableData
        });
    };

    columns = [
        {
            title: this.props.formatMessage(i18nMessages.ECONFIG_FRONT_A0081),
            dataIndex: 'userName',
            // fixed: 'left',
            width: '110px',
            render: text => (
                <div
                    title={text}
                    className="overflow_ellipsis mAll15"
                    style={{ width: 80 }}
                >
                    {text}
                </div>
            )
        },
        {
            title: this.props.formatMessage(i18nMessages.ECONFIG_FRONT_A0082),
            dataIndex: 'email',
            width: '205px',
            // fixed: 'left',
            render: text => (
                <div
                    title={text}
                    className="overflow_ellipsis mAll15"
                    style={{ width: 150 }}
                >
                    {text}
                </div>
            )
        },
        {
            title: this.props.formatMessage(i18nMessages.ECONFIG_FRONT_A0223),
            dataIndex: 'userProperty',
            width: '150px',
            render: text => (
                <div
                    title={text}
                    className="overflow_ellipsis mAll15"
                    style={{ width: 110 }}
                >
                    {text === 'CompanyUser'
                        ? this.props.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0543
                        )
                        : text === 'OutUser'
                            ? this.props.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0006
                            )
                            : ''}
                </div>
            )
        },
        {
            title: this.props.formatMessage(i18nMessages.ECONFIG_FRONT_A0470),
            dataIndex: 'organIds',
            width: '260px',
            render: (text, row) => (
                <div
                    // title={text}
                    className="overflow_ellipsis mAll15"
                    style={{ width: 220 }}
                >
                    <TreeSelect
                        disabled={row.userProperty !== 'CompanyUser'}
                        style={{ width: '100%' }}
                        dropdownStyle={{
                            maxHeight: 300,
                            overflow: 'auto'
                        }}
                        placeholder={
                            row.userProperty === 'CompanyUser'
                                ? this.props.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0051
                                )
                                : null
                        }
                        value={text || []}
                        allowClear
                        multiple
                        treeDefaultExpandAll
                        onChange={values =>
                            this.organChange(values, row.uniqueId)
                        }
                    >
                        {this.renderTreeNodes(this.props.departmentList)}
                    </TreeSelect>
                </div>
            )
        },
        {
            title: this.props.formatMessage(i18nMessages.ECONFIG_FRONT_A0134),
            dataIndex: 'roleIds',
            width: '196px',
            render: (text, row) => {
                const roleList = this.state.roleList;
                const siteList = this.props.siteList;
                const { projectId = '' } = this.props.operateData;
                return {
                    children: (
                        <AuthRow
                            projectId={projectId}
                            formatMessage={this.props.formatMessage}
                            rowData={row}
                            roleList={roleList}
                            siteList={siteList}
                            changeRole={this.changeRole}
                            showSelectSiteModal={this.showSelectSiteModal}
                            deleteSite={this.deleteSite}
                            deleteAuth={this.deleteAuth}
                        />
                    ),
                    props: {
                        colSpan: 3
                    }
                };
            }
        },
        {
            title: this.props.formatMessage(i18nMessages.ECONFIG_FRONT_A0474),
            dataIndex: 'siteIds',
            width: '495px',
            render: () => {
                return {
                    children: null,
                    props: {
                        colSpan: 0
                    }
                };
            }
        },
        {
            title: this.props.formatMessage(i18nMessages.ECONFIG_FRONT_A0030),
            dataIndex: 'action',
            render: () => {
                return {
                    children: null,
                    props: {
                        colSpan: 0
                    }
                };
            }
        }
    ];

    /**
     * 获取有完整授权的角色个数
     */
    getHasAuthNum = () => {
        let hasAuthNumber = 0;
        const { tableData, roleList, searchKeyWord } = this.state;
        // 数字需要以筛选的行数计算 不能计算全部行数据
        const filterTableData = searchKeyWord
            ? tableData.filter(
                item =>
                    item.email.indexOf(searchKeyWord) > -1 ||
                      item.userName.indexOf(searchKeyWord) > -1
            )
            : tableData;
        const {
            operateData: { roleIds }
        } = this.props;
        filterTableData.forEach(item => {
            // 人员的有效授权数
            const authNum = item.authData
                ? item.authData
                    .filter(authItem =>
                        roleIds && roleIds.length > 0
                            ? includes(roleIds, authItem.roleId)
                            : true
                    )
                    .filter(authItem => {
                        if (authItem.roleId) {
                            const role = find(
                                roleList,
                                roleItem => roleItem.id === authItem.roleId
                            );
                            if (
                                role &&
                                  (role.needSite === 0 ||
                                      (role.needSite === 1 &&
                                          authItem.siteIds.length > 0))
                            ) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }).length
                : 0;
            if (
                authNum > 0 &&
                authNum ===
                    item.authData.filter(authItem =>
                        roleIds && roleIds.length > 0
                            ? includes(roleIds, authItem.roleId)
                            : true
                    ).length
            ) {
                hasAuthNumber += 1;
            }
        });
        return `${hasAuthNumber}/${filterTableData.length}`;
    };

    render() {
        const {
            selectedRowKeys,
            tableData,
            showSelectSiteModal,
            showSelectRoleModal,
            showSelectOrganModal,
            selectAuthInfo,
            roleList,
            buttonDisalbed,
            searchKeyWord,
            filterColumns,
            showFilterContent
        } = this.state;
        const {
            siteList,
            operateData,
            formatMessage,
            departmentList
        } = this.props;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };
        const columns = this.columns;
        return (
            <div className="authTable">
                <div className="topHeader">
                    <span style={{ marginRight: 60, fontSize: 16 }}>
                        <span>
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0633)}：
                        </span>
                        <span>{this.getHasAuthNum()}</span>
                    </span>
                    <Button
                        disabled={buttonDisalbed}
                        type="primary"
                        onClick={() =>
                            this.setState({ showSelectRoleModal: true })
                        }
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0293)}
                    </Button>
                    {operateData.projectId && (
                        <Button
                            disabled={buttonDisalbed}
                            type="primary"
                            onClick={() =>
                                this.setState({ showSelectSiteModal: true })
                            }
                        >
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0164)}
                        </Button>
                    )}
                    <Button
                        disabled={buttonDisalbed}
                        onClick={() =>
                            this.setState({ showSelectOrganModal: true })
                        }
                        type="primary"
                    >
                        {formatMessage(i18nMessages.ECONFIG_FRONT_A0641)}
                    </Button>

                    <div style={{ float: 'right' }}>
                        <Search
                            placeholder={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0634
                            )}
                            style={{
                                display: 'inline-block',
                                width: 250,
                                marginRight: 12
                            }}
                            onSearch={text =>
                                this.setState({ searchKeyWord: text })
                            }
                        />
                        <Popover
                            placement="bottomRight"
                            title={formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0642
                            )}
                            visible={showFilterContent}
                            onVisibleChange={showFilterContent =>
                                this.setState({ showFilterContent })
                            }
                            content={
                                <FilterColumnContent
                                    columns={columns}
                                    formatMessage={formatMessage}
                                    filterColumns={filterColumns}
                                    onClose={filterColumns =>
                                        this.setState({
                                            showFilterContent: false,
                                            filterColumns
                                        })
                                    }
                                />
                            }
                            trigger="click"
                        >
                            <Button
                                style={{
                                    display: 'inline-block',
                                    paddingLeft: 8,
                                    paddingRight: 8
                                }}
                            >
                                <Icon type="filter" />
                            </Button>
                        </Popover>
                    </div>
                </div>
                <TableBox
                    style={{ marginTop: 21 }}
                    rowKey="uniqueId"
                    bordered
                    rowClassName="tableRow"
                    rowSelection={rowSelection}
                    dataSource={
                        searchKeyWord
                            ? tableData.filter(
                                item =>
                                    item.email.indexOf(searchKeyWord) > -1 ||
                                      item.userName.indexOf(searchKeyWord) > -1
                            )
                            : tableData
                    }
                    columns={columns
                        .filter(item => includes(filterColumns, item.dataIndex))
                        .map(item => ({
                            ...item,
                            width:
                                filterColumns.length < 5 &&
                                item.dataIndex === 'organIds'
                                    ? null
                                    : filterColumns.length === 3 &&
                                      item.dataIndex === 'userProperty'
                                        ? null
                                        : item.width
                        }))}
                    pagination={false}
                    scroll={{ x: 1590 }}
                />
                {showSelectSiteModal && (
                    <SelectSite
                        visible={showSelectSiteModal}
                        selectValue={selectAuthInfo.siteIds || []}
                        siteList={siteList}
                        onCancel={this.hideSelectSiteModal}
                        formatMessage={formatMessage}
                        onSelectSite={this.onSelectSite}
                    />
                )}
                {showSelectRoleModal && (
                    <SelectRole
                        appId={operateData.source}
                        visible={showSelectRoleModal}
                        roleList={roleList}
                        onCancel={() =>
                            this.setState({ showSelectRoleModal: false })
                        }
                        formatMessage={formatMessage}
                        onSelectRole={this.onSelectRole}
                    />
                )}
                {showSelectOrganModal && (
                    <SelectOrgan
                        visible={showSelectOrganModal}
                        departmentList={departmentList}
                        onCancel={() =>
                            this.setState({ showSelectOrganModal: false })
                        }
                        formatMessage={formatMessage}
                        onSelectOrgan={this.onSelectOrgan}
                    />
                )}
            </div>
        );
    }
}
