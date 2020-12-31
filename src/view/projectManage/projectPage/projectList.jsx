import React from 'react';
import { i18nMessages } from 'src/i18n';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
// import { Link } from 'react-router-dom';
import urls, { parseApiUrl } from 'utils/urls';
import { formatEmpty } from 'utils/utils';
import { $http } from 'utils/http';
import { Divider, Input, Icon, Button, message, Modal, Popconfirm } from 'antd';
import { drawerFun } from 'component/drawer';
import AddProject from '../projectAdd/addProject';
import AddSubProject from '../projectAdd/addSubProject';
import CommonTable from 'tms-common-table1x';
import { connect } from 'model';
import SortButton from 'src/component/sortButton';
import { debounce, intersection } from 'lodash';
import AuthSearchComponent from 'src/component/authSearchComponent';

const confirm = Modal.confirm;

const ProjectContainer = styled.div`
    padding: 0 8px;
`;

const ProjectHeader = styled.div`
    display: flex;
    justify-content: space-between;
    .header-right {
        button {
            margin-left: 8px;
        }
    }
`;

@injectIntl
@connect(state => ({
    currentAppId: state.project.currentAppId || '',
    searchParams: state.project.searchParams || {}
}))
class ProjectList extends React.PureComponent {
    state = {
        dataSource: [], // table数据
        total: 0,
        searchValue: '',
        pageNum: 1,
        pageSize: 50,
        loading: true,
        createTimeOrder: 'desc', // 创建日期排序
        programCodeOrder: '', // 方案编号排序
        authSearchModalVisible: false,
        authSearchModalProjectInfo: {},
        authSearchModalAppId: ''
    };

    subDataSource = {}; // 子table数据

    get projectEffects() {
        return this.props.effects.project;
    }

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0019
            ),
            width: 200,
            dataIndex: 'projectName',
            sorter: false,
            // sortOrder: 'ascend',
            render: (text, record) => {
                return (
                    <a
                        style={
                            record.isEditProject !== '1'
                                ? { cursor: 'no-drop' }
                                : {}
                        }
                        onClick={() => {
                            if (record.isEditProject === '1') {
                                localStorage.setItem(
                                    'projectName',
                                    record.projectName || ''
                                );
                                this.props.history.push(
                                    `${this.props.match.path}/project/parent/${record.id}/${this.props.currentAppId}`
                                );
                            }
                        }}
                    >
                        {text}
                    </a>
                );
                // console.log(this.props);
                // console.log();
                // return <Link to={`${this.props.match.path}/project/parent/${record.id}/${this.props.currentAppId}/${encodeURIComponent(record.projectName)}`}>{text}</Link>;
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0020
            ),
            width: 200,
            dataIndex: 'programCode',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0505
            ),
            width: 200,
            dataIndex: 'projectSerialNo',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0021
            ),
            width: 250,
            dataIndex: 'projectManager',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0022
            ),
            width: 240,
            dataIndex: 'candidate',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0023
            ),
            width: 120,
            dataIndex: 'subProjectCount',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0024
            ),
            width: 120,
            dataIndex: 'createBy',
            render: text => formatEmpty(text)
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0030
            ),
            width: 280,
            dataIndex: 'action',
            render: (text, record) => {
                if (record.isEditProject === '1') {
                    return (
                        <span>
                            <a onClick={() => this.addSubProject(record)}>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0068
                                )}
                            </a>
                            <Divider type="vertical" />
                            <a onClick={() => this.jumpCenter(record)}>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0069
                                )}
                            </a>
                            <Divider type="vertical" />
                            <a onClick={() => this.jumpStoreroom(record)}>
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0374
                                )}
                            </a>
                            <Divider type="vertical" />
                            {record.isFirstCreated === '0' && (
                                <Popconfirm
                                    title={`${this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0421
                                    )}[${record.projectName}]?`}
                                    onConfirm={() =>
                                        this.onRemoveProject(record.id)
                                    }
                                >
                                    <a>
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0420
                                        )}
                                    </a>
                                </Popconfirm>
                            )}
                            {record.isFirstCreated === '1' && (
                                // <Popconfirm title={`${this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0228)}[${record.projectName}]?`} onConfirm={() => this.onProjectDelete(record.id)}>
                                <a
                                    onClick={() =>
                                        this.onProjectDelete({
                                            id: record.id,
                                            projectName: record.projectName,
                                            record
                                        })
                                    }
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0070
                                    )}
                                </a>
                                // </Popconfirm>
                            )}
                        </span>
                    );
                } else {
                    return <span>-</span>;
                }
            }
        }
    ];

    expandedRowRender = item => {
        const columns = [
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0019
                ),
                width: 200,
                dataIndex: 'projectName',
                render: (text, record) => {
                    return (
                        <a
                            style={
                                record.isEditProject !== '1'
                                    ? { cursor: 'no-drop' }
                                    : {}
                            }
                            onClick={() => {
                                if (record.isEditProject === '1') {
                                    localStorage.setItem(
                                        'projectName',
                                        record.projectName || ''
                                    );
                                    this.props.history.push(
                                        `${this.props.match.path}/project/parent/${record.id}/${this.props.currentAppId}`
                                    );
                                }
                            }}
                        >
                            {text}
                        </a>
                    );
                    // return <Link to={`${this.props.match.path}/project/child/${record.id}/${this.props.currentAppId}/${encodeURIComponent(record.projectName)}`}>{text}</Link>;
                }
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0020
                ),
                width: 150,
                dataIndex: 'programCode',
                render: text => formatEmpty(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0505
                ),
                width: 200,
                dataIndex: 'projectSerialNo',
                render: text => formatEmpty(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0021
                ),
                width: 250,
                dataIndex: 'projectManager',
                render: text => formatEmpty(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0025
                ),
                width: 180,
                dataIndex: 'studyStageName',
                render: text => formatEmpty(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0026
                ),
                width: 180,
                dataIndex: 'experimentType',
                render: text => formatEmpty(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0024
                ),
                width: 120,
                dataIndex: 'createBy',
                render: text => formatEmpty(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0027
                ),
                width: 150,
                dataIndex: 'projectOrigin',
                render: text => formatEmpty(text)
            },
            {
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0030
                ),
                width: 200,
                dataIndex: 'menu',
                render: (text, record) => {
                    if (record.isEditProject === '1') {
                        return (
                            <span>
                                <a onClick={() => this.jumpCenter(record)}>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0069
                                    )}
                                </a>
                                <Divider type="vertical" />
                                <a onClick={() => this.jumpStoreroom(record)}>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0374
                                    )}
                                </a>
                                <Divider type="vertical" />
                                {record.isFirstCreated === '0' && (
                                    <Popconfirm
                                        title={`${this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0421
                                        )}[${record.projectName}]?`}
                                        onConfirm={() =>
                                            this.onRemoveProject(
                                                record.id,
                                                item.id
                                            )
                                        }
                                    >
                                        <a>
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0420
                                            )}
                                        </a>
                                    </Popconfirm>
                                )}
                                {record.isFirstCreated === '1' && (
                                    // <Popconfirm title={`${this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0228)}[${record.projectName}]?`} onConfirm={() => this.onProjectDelete({id: record.id, parentProjectId: item.id, name: record.projectName})}>
                                    <a
                                        onClick={() =>
                                            this.onProjectDelete({
                                                id: record.id,
                                                parentProjectId: item.id,
                                                projectName: record.projectName,
                                                record
                                            })
                                        }
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0070
                                        )}
                                    </a>
                                    // </Popconfirm>
                                )}
                            </span>
                        );
                    } else {
                        return <span>-</span>;
                    }
                }
            }
        ];

        return (
            <CommonTable
                columns={columns}
                dataSource={this.subDataSource[item.id]}
                scroll={{ x: 'auto' }}
                pagination={false}
                outerFilter={false}
            />
        );
    };

    componentWillMount() {
        /**
         * 保存每个tab页面中的状态，在用户返回项目列表之后，把状态取出
         */
        const { currentAppId, searchParams } = this.props;
        if (searchParams[currentAppId]) {
            this.getProjectList(searchParams[currentAppId]);
            this.setState({
                searchValue: searchParams[currentAppId].searchValue || ''
            });
        } else {
            this.getProjectList({});
        }
    }

    // 获取项目列表
    getProjectList = async ({
        searchValue = '',
        pageNum = 1,
        pageSize = 50,
        appId = ''
    }) => {
        try {
            const { currentAppId } = this.props;
            const { createTimeOrder, programCodeOrder } = this.state;
            this.setState({ loading: true });
            const result = await $http.post(urls.projectList, {
                appId: appId ? appId : currentAppId,
                pid: 0,
                pageNum,
                pageSize,
                keyword: searchValue,
                createTimeOrder,
                programCodeOrder
            });
            /**
             * 保存每个tab页面中的状态，在用户返回项目列表之后，把状态取出
             */
            this.projectEffects.setSearchParams({
                pageNum,
                pageSize,
                searchValue
            });
            this.setState({
                pageNum,
                pageSize,
                dataSource: result.list || [],
                loading: false,
                total: result.total || 0,
                tableKey: Math.random()
            });
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({
                loading: false
            });
        }
    };

    onAuthSearchModal = async (record, appIds) => {
        console.log(record);

        try {
            const result = await $http.get(urls.getFilterSoftList);
            const allAppIds = result.map(item => item.appId);
            const s = intersection(allAppIds, appIds);
            if (s.length > 0) {
                this.setState({
                    authSearchModalVisible: true,
                    authSearchModalProjectInfo: record,
                    authSearchModalAppId: s[0]
                });
            } else {
                message.info(
                    this.props.intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0671
                    )
                );
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    // 删除项目
    onProjectDelete = debounce(
        async ({ id, parentProjectId, projectName, record }) => {
            try {
                console.log(record);
                const tips = await $http.get(urls.checkUserProjectAuth, {
                    projectId: id
                });
                if (tips.length > 0) {
                    Modal.info({
                        title: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0202
                        ),
                        content: (
                            <div>
                                <p>
                                    {parseApiUrl(
                                        this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0654
                                        ),
                                        {
                                            apps: tips
                                                .map(t => t.appName)
                                                .join('、')
                                            // nums: tips.length
                                        }
                                    )}
                                </p>
                                <p>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0655
                                    )}
                                    <a
                                        onClick={() =>
                                            this.onAuthSearchModal(
                                                record,
                                                tips.map(item => item.appId)
                                            )
                                        }
                                    >
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0466
                                        )}
                                    </a>
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0656
                                    )}
                                </p>
                            </div>
                        ),
                        okText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        ),
                        onOk() {}
                    });
                } else {
                    confirm({
                        title: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0202
                        ),
                        content: `${this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0252
                        )} [${projectName}]?`,
                        cancelText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0281
                        ),
                        okText: this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0279
                        ),
                        onOk: async () => {
                            try {
                                const {
                                    currentAppId,
                                    searchParams
                                } = this.props;
                                await $http.post(urls.delProject, {
                                    id,
                                    appId: currentAppId
                                });
                                message.success(
                                    this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0233
                                    )
                                );
                                // 如果是删除子项目则刷新子项目列表
                                if (parentProjectId) {
                                    this.onExpand(true, {
                                        id: parentProjectId
                                    });
                                }
                                // 判断是否在第一页状态下删除
                                if (searchParams[currentAppId]) {
                                    this.getProjectList(
                                        searchParams[currentAppId]
                                    );
                                    this.setState({
                                        searchValue:
                                            searchParams[currentAppId]
                                                .searchValue || ''
                                    });
                                } else {
                                    this.getProjectList({});
                                }
                            } catch (e) {
                                message.error(e.message);
                            }
                        }
                    });
                }
            } catch (e) {
                message.error(e.message);
            }
        },
        500,
        { leading: true, trailing: false }
    );

    // 解除项目
    onRemoveProject = async (id, parentProjectId) => {
        try {
            const { currentAppId, searchParams } = this.props;
            await $http.post(urls.removeProject, {
                id,
                appId: currentAppId
            });
            message.success(
                this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0422)
            );
            // 如果是删除子项目则刷新子项目列表
            if (parentProjectId) {
                this.onExpand(true, { id: parentProjectId });
            }
            // 判断是否在第一页状态下删除
            if (searchParams[currentAppId]) {
                this.getProjectList(searchParams[currentAppId]);
                this.setState({
                    searchValue: searchParams[currentAppId].searchValue || ''
                });
            } else {
                this.getProjectList({});
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    onReset = () => {
        this.setState(
            {
                searchValue: '',
                createTimeOrder: 'desc', // 创建日期排序
                programCodeOrder: '' // 方案编号排序
            },
            () => this.getProjectList({})
        );
    };

    // 添加项目
    addProject = () => {
        const { currentAppId } = this.props;
        drawerFun({
            // title: this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0028),
            width: 500,
            antdConfig: {
                className: 'custom-drawer',
                closable: false
            },
            compontent: props => (
                <AddProject
                    getProjectList={this.getProjectList}
                    appId={currentAppId}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    // 添加子项目
    addSubProject = record => {
        const { currentAppId, searchParams } = this.props;
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0068
            ),
            width: 500,
            compontent: props => (
                <AddSubProject
                    parentProjectInfo={record}
                    searchParams={searchParams}
                    getProjectList={this.getProjectList}
                    setSubProjectList={this.onExpand}
                    appId={currentAppId}
                    {...props}
                    {...this.props}
                />
            )
        });
    };

    // 跳转到中心分配
    jumpCenter = record => {
        const { match, currentAppId } = this.props;
        localStorage.setItem('projectName', record.projectName || '');
        this.props.history.push(
            `${match.path}/center/${currentAppId}/${record.id}`
        );
    };

    // 跳转到库房分配
    jumpStoreroom = record => {
        const { match, currentAppId } = this.props;
        localStorage.setItem('projectName', record.projectName || '');
        this.props.history.push(
            `${match.path}/storeroom/${currentAppId}/${record.id}`
        );
    };

    // 展开数据获取子table数据
    onExpand = async (expanded, record) => {
        if (expanded) {
            const { currentAppId } = this.props;
            const result = await $http.post(urls.projectSubList, {
                pid: record.id,
                appId: currentAppId
            });
            this.subDataSource[record.id] = result.list || [];
            this.forceUpdate();
        }
    };

    // 导出
    onExport = () => {
        const { currentAppId } = this.props;
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0202
            ),
            content: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0204
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            async onOk() {
                try {
                    const result = await $http.post(
                        parseApiUrl(urls.exportProject, {
                            appId: currentAppId
                        })
                    );
                    if (result && result.relativeFileUrl) {
                        window.open(result.relativeFileUrl);
                    } else {
                        message.info(
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

    tableOnChange = ({ current = 1, pageSize = 50, order = {} }) => {
        console.log(order);
        const { searchValue = '' } = this.state;
        this.getProjectList({ pageNum: current, pageSize, searchValue });
    };

    onSort = item => {
        const { searchValue = '' } = this.state;
        if (item === 'createTimeOrder') {
            this.setState(
                {
                    createTimeOrder:
                        this.state[item] === 'asc' ? 'desc' : 'asc',
                    programCodeOrder: ''
                },
                () => {
                    this.getProjectList({ searchValue });
                }
            );
        }
        if (item === 'programCodeOrder') {
            this.setState(
                {
                    createTimeOrder: '',
                    programCodeOrder:
                        this.state[item] === 'asc' ? 'desc' : 'asc'
                },
                () => {
                    this.getProjectList({ searchValue });
                }
            );
        }
    };

    render() {
        const {
            dataSource = [],
            loading,
            total = 0,
            searchValue = '',
            pageNum = 1,
            pageSize = 50,
            createTimeOrder = '',
            programCodeOrder = '',
            authSearchModalVisible,
            authSearchModalProjectInfo,
            authSearchModalAppId
        } = this.state;
        return (
            <ProjectContainer>
                <ProjectHeader>
                    <div className="tms-table-search">
                        <Input
                            value={searchValue}
                            style={{ width: '240px' }}
                            onPressEnter={() =>
                                this.getProjectList({ searchValue })
                            }
                            onChange={e => {
                                this.setState({
                                    searchValue: e.target.value
                                });
                            }}
                            placeholder={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0469
                            )}
                        />
                        <Icon
                            type="search"
                            onClick={() => this.getProjectList({ searchValue })}
                        />
                        <a onClick={this.onReset}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0018
                            )}
                        </a>
                        <SortButton
                            style={{ marginLeft: '30px' }}
                            onClick={() => this.onSort('createTimeOrder')}
                            text={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0468
                            )}
                            type={createTimeOrder}
                        />
                        <SortButton
                            style={{ marginLeft: '30px' }}
                            onClick={() => this.onSort('programCodeOrder')}
                            text={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0020
                            )}
                            type={programCodeOrder}
                        />
                    </div>
                    <div className="header-right">
                        <Button onClick={this.onExport}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0029
                            )}
                        </Button>
                        <Button type="primary" onClick={this.addProject}>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0028
                            )}
                        </Button>
                    </div>
                </ProjectHeader>
                <CommonTable
                    dataSource={dataSource}
                    key={this.state.tableKey}
                    expandedRowRender={
                        dataSource.length > 0 ? this.expandedRowRender : null
                    }
                    columns={this.columns}
                    loading={loading}
                    outerFilter={false}
                    total={total}
                    onExpand={this.onExpand}
                    onChange={this.tableOnChange}
                    scroll={{ x: 'auto', y: 'calc(100vh - 280px)' }}
                    paginationOptions={{
                        size: 'small',
                        current: pageNum,
                        pageSize,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: total =>
                            `${this.props.intl
                                .formatMessage(i18nMessages.ECONFIG_FRONT_A0205)
                                .replace('xx', total)}`
                    }}
                />
                {authSearchModalVisible && (
                    <AuthSearchComponent
                        intl={this.props.intl}
                        appId={authSearchModalAppId}
                        defaultSearchParams={{
                            projectInfo: {
                                key: authSearchModalProjectInfo.id,
                                label: authSearchModalProjectInfo.projectSerialNo
                                    ? `【${authSearchModalProjectInfo.projectSerialNo}】${authSearchModalProjectInfo.projectName}`
                                    : authSearchModalProjectInfo.projectName
                            }
                        }}
                        visible={authSearchModalVisible}
                        onCancel={() =>
                            this.setState({ authSearchModalVisible: false })
                        }
                    />
                )}
            </ProjectContainer>
        );
    }

    componentDidMount() {
        if (this.props && this.props.projectEvent) {
            const { currentAppId } = this.props;
            this.props.projectEvent(this, currentAppId);
        }
    }
}

export default ProjectList;
