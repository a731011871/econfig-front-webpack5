import React from 'react';
import { message, Modal, Icon, Button, Table, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import { cloneDeep, find, flatten, forEach, includes } from 'lodash';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import { $http } from 'src/utils/http';
import urls from 'src/utils/urls';
import { isEdcFrontRole } from 'src/utils/functions';
import ProjectDrawer from '../drawers/projectDrawer';
import RoleAndEnvDrawer from './roleAndEnvDrawer';
import SiteDrawer from '../drawers/siteDrawer';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import CollectModal from '../modals/eCollect5Modal';
import { SiteBtn } from 'src/component/authPage/styled';

const confirm = Modal.confirm;
const SiteItem = styled.div`
    border: 1px solid #9e9e9e;
    background: #f5f5f5;
    color: #333;
    padding-left: 10px;
    padding-right: 5px;
    margin-top: 6px;
    text-align: center;
    max-width: 200px;
    display: inline-block;
    margin-right: 8px;
    white-space: nowrap;
`;
const SiteSpan = styled.span`
    max-width: 164px;
    vertical-align: middle;
`;

@injectIntl
class eCollect5 extends React.PureComponent {
    static propTypes = {
        authInfoItem: PropTypes.array,
        systemList: PropTypes.array,
        changeDataItem: PropTypes.func,
        addDataItem: PropTypes.func,
        deleteDataItem: PropTypes.func,
        changeList: PropTypes.func,
        edit: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            hideButton: true,
            projectList: [],
            envList: [],
            roleList: [],
            loading: true,
            showCollectModal: false,
            applicationRoleTypes: [] // 角色类型，edc授权需要根据角色类型显示不同的授权内容
        };
    }

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if (!nextProps.edit) {
            return {
                ...(nextProps.value || {}),
                selectedRowKeys: [],
                hideButton: true,
                currentAppType: 'ecollect_study_role'
            };
        }
        return null;
    }

    componentDidMount = async () => {
        try {
            const projectList = await authServices.getCspProjectList(
                this.props.appId
            );
            // const projectList = await authServices.getProjectList(this.props.appId);
            const envResult = await authServices.getCspEnvList(
                this.props.appId
            );
            const roleResult = await authServices.getCspRoleList(
                this.props.appId
            );
            const envList = envResult.rows || [];
            const roleList = roleResult.data.map(item => ({
                ...item,
                roleName: `${item.roleName}${
                    item.blindState === 0
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0624
                          )
                        : item.blindState === 1
                        ? this.props.intl.formatMessage(
                              i18nMessages.ECONFIG_FRONT_A0623
                          )
                        : ''
                }`
            }));
            const applicationRoleTypes = await $http.get(
                urls.listApplicationRoleType,
                { appId: 'edc' }
            );
            this.setState({
                applicationRoleTypes,
                projectList: projectList.data.map(item => ({
                    ...item,
                    roleVos: item.roleVos
                        ? item.roleVos.map(roleItem => ({
                              ...roleItem,
                              roleName: `${roleItem.roleName}${
                                  roleItem.blindState === 0
                                      ? this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0624
                                        )
                                      : roleItem.blindState === 1
                                      ? this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0623
                                        )
                                      : ''
                              }`
                          }))
                        : null
                })),
                envList,
                roleList,
                loading: false
            });
            this.props.changeList(this.props.appId, roleList, projectList.data);
        } catch (e) {
            message.error(e.message);
        }
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0539
            ),
            width: 130,
            dataIndex: 'roleType',
            render: text => (
                <div className="Width170">
                    {
                        find(
                            this.state.applicationRoleTypes,
                            item => item.roleTypeCode === text
                        ).roleTypeName
                    }
                </div>
            )
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0161
            ),
            dataIndex: 'projectIds',
            width: 200,
            render: (projectIds, record) => {
                if (isEdcFrontRole(record.roleType)) {
                    const project = find(
                        this.state.projectList,
                        item => item.id === projectIds[0]
                    );
                    return (
                        <a
                            className="Block Width170"
                            onClick={() => {
                                this.addEnv(record);
                            }}
                        >
                            {project
                                ? project.projectSerialNo
                                    ? `【${project.projectSerialNo}】${project.projectName}`
                                    : project.projectName
                                : '-'}
                        </a>
                    );
                } else {
                    return [
                        this.props.edit ? (
                            <SiteBtn
                                key="addProject"
                                className="InlineBlock mRight15"
                                onClick={() => this.addClassicProject(record)}
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0309
                                )}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0309
                                )}
                            </SiteBtn>
                        ) : null,
                        ...projectIds
                            .filter(item => item !== 'ALL' && item !== 'NONE')
                            .map((item, index) => {
                                const project = find(
                                    this.state.projectList,
                                    projectItem => projectItem.id === item
                                );
                                return (
                                    <div className="Block" key={index}>
                                        <SiteItem key={project.id}>
                                            <SiteSpan
                                                className="InlineBlock flex overflow_ellipsis"
                                                title={`【${project.projectSerialNo}】${project.projectName}`}
                                            >
                                                {`【${project.projectSerialNo}】${project.projectName}`}
                                            </SiteSpan>
                                            {this.props.edit && (
                                                <Icon
                                                    className="TxtMiddle pointer"
                                                    type="close"
                                                    onClick={() => {
                                                        this.deleteProject(
                                                            record,
                                                            item
                                                        );
                                                    }}
                                                />
                                            )}
                                        </SiteItem>
                                    </div>
                                );
                            })
                    ];
                }
                return null;
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0162
            ),
            dataIndex: 'envIds',
            width: 130,
            render: (envIds, record) => {
                if (isEdcFrontRole(record.roleType)) {
                    if (envIds && envIds.length > 0) {
                        return (
                            <div className="Block Width100">
                                {envIds.map(item => {
                                    const envId = item ? item : '建库环境';
                                    const env = find(
                                        this.state.envList,
                                        envItem =>
                                            envItem.projectId
                                                ? envItem.projectId ===
                                                      record.projectIds[0] &&
                                                  envItem.id === envId
                                                : envItem.id === envId
                                    );
                                    return (
                                        <div
                                            key={item}
                                            className="mTop8 overflow_ellipsis Block"
                                            style={{ maxWidth: '6em' }}
                                            title={env ? env.name : ''}
                                        >
                                            {env
                                                ? env.name
                                                : this.props.intl.formatMessage(
                                                      i18nMessages.ECONFIG_FRONT_A0298
                                                  )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }
                    return (
                        <div className="Gray_9e mTop8">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0298
                            )}
                        </div>
                    );
                }
                return null;
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0163
            ),
            dataIndex: 'roleIds',
            width: 130,
            render: (roleIds, record) => {
                if (roleIds && roleIds.length > 0) {
                    return (
                        <div className="Block Width120">
                            {roleIds.map((item, index) => {
                                const user = find(
                                    this.state.roleList,
                                    roleItem => roleItem.id === item
                                );
                                const env = record.envIds
                                    ? record.envIds[index]
                                    : index;
                                if (user) {
                                    return (
                                        <a
                                            key={`${env}-${item}`}
                                            title={user.roleName}
                                            className="mTop8 Block overflow_ellipsis"
                                            onClick={() => {
                                                this.showRoleAuth(item);
                                            }}
                                        >
                                            {user.roleName}
                                        </a>
                                    );
                                }
                                return (
                                    <div className="Gray_9e mTop8" key={index}>
                                        {this.props.intl.formatMessage(
                                            i18nMessages.ECONFIG_FRONT_A0292
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                }
                return (
                    <div className="Gray_9e mTop8">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0292
                        )}
                    </div>
                );
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0164
            ),
            width: 250,
            dataIndex: 'siteIds',
            render: (siteIds, record) => {
                if (isEdcFrontRole(record.roleType)) {
                    if (siteIds && siteIds.length > 0) {
                        return (
                            <div>
                                {siteIds.map((item, index) => {
                                    const userId = record.roleIds[index];
                                    const user = find(
                                        this.state.roleList,
                                        role => role.id === userId
                                    );
                                    if (user && user.needSite === 1) {
                                        const sites = [];
                                        forEach(item, (value, key) => {
                                            if (
                                                key !== 'ALL' &&
                                                key !== 'NONE'
                                            ) {
                                                sites.push({
                                                    siteName: value,
                                                    siteId: key
                                                });
                                            }
                                        });
                                        return (
                                            <div
                                                className="siteBox flexRow"
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                <SiteBtn
                                                    className={`InlineBlock mRight15 ${!this
                                                        .props.edit &&
                                                        'DisabledBtn'}`}
                                                    onClick={() => {
                                                        this.addSite(
                                                            record,
                                                            index
                                                        );
                                                    }}
                                                    title={this.props.intl.formatMessage(
                                                        i18nMessages.ECONFIG_FRONT_A0164
                                                    )}
                                                >
                                                    {this.props.intl.formatMessage(
                                                        i18nMessages.ECONFIG_FRONT_A0164
                                                    )}
                                                </SiteBtn>
                                                {/* 中心大于三个显示查看全部按钮，单独操作 */}
                                                {sites.map(
                                                    (siteItem, siteIndex) =>
                                                        siteIndex < 3 ? (
                                                            <SiteItem
                                                                key={
                                                                    siteItem.siteId
                                                                }
                                                            >
                                                                <SiteSpan
                                                                    title={
                                                                        siteItem.siteName
                                                                    }
                                                                    className="InlineBlock flex overflow_ellipsis mRight5"
                                                                >
                                                                    {
                                                                        siteItem.siteName
                                                                    }
                                                                </SiteSpan>
                                                                {/* 如果勾选了全部中心权限，中心不可被删除 */}
                                                                {this.props
                                                                    .edit &&
                                                                    record
                                                                        .isAllProSites[
                                                                        index
                                                                    ] !==
                                                                        '1' && (
                                                                        <Icon
                                                                            className="TxtMiddle pointer"
                                                                            type="close"
                                                                            onClick={() => {
                                                                                this.deleteSite(
                                                                                    record,
                                                                                    index,
                                                                                    siteItem.siteId
                                                                                );
                                                                            }}
                                                                        />
                                                                    )}
                                                            </SiteItem>
                                                        ) : null
                                                )}
                                                {sites.length > 3 && (
                                                    <a
                                                        style={{ marginTop: 8 }}
                                                        onClick={() =>
                                                            this.addSite(
                                                                record,
                                                                index,
                                                                true
                                                            )
                                                        }
                                                    >
                                                        {this.props.intl.formatMessage(
                                                            i18nMessages.ECONFIG_FRONT_A0715
                                                        )}
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    } else if (
                                        user &&
                                        user.needSite === 0 &&
                                        user.nullSiteDefaultValue === 'ALL'
                                    ) {
                                        return (
                                            <SiteItem className="Block">
                                                <SiteSpan
                                                    className="InlineBlock flex overflow_ellipsis"
                                                    title={this.props.intl.formatMessage(
                                                        i18nMessages.ECONFIG_FRONT_A0296
                                                    )}
                                                >
                                                    {this.props.intl.formatMessage(
                                                        i18nMessages.ECONFIG_FRONT_A0296
                                                    )}
                                                </SiteSpan>
                                            </SiteItem>
                                        );
                                    } else if (user) {
                                        return (
                                            <div
                                                key={index}
                                                className="Gray_9e LineHeight22 mTop7"
                                            >
                                                {this.props.intl.formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0197
                                                )}
                                            </div>
                                        );
                                    }
                                    return (
                                        <div
                                            key={index}
                                            className="Gray_9e LineHeight22 mTop7"
                                        >
                                            {this.props.intl.formatMessage(
                                                i18nMessages.ECONFIG_FRONT_A0297
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }
                    return (
                        <div className="Gray_9e mTop8">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0297
                            )}
                        </div>
                    );
                }
                return null;
            }
        },
        {
            title: ' ',
            dataIndex: 'isAllProSites',
            width: 150,
            render: (isAllProSites = [], record) => {
                if (
                    isEdcFrontRole(record.roleType) &&
                    record.envIds.length > 0
                ) {
                    return (
                        <div style={{ minWidth: 150 }}>
                            {record.envIds.map((item, index) => (
                                <Checkbox
                                    disabled={!this.props.edit}
                                    className="mLeft0 Block"
                                    style={{ marginTop: 7 }}
                                    key={item}
                                    checked={isAllProSites[index] === '1'}
                                    onChange={e =>
                                        this.changeAllSite(
                                            record,
                                            index,
                                            e.target.checked
                                        )
                                    }
                                >
                                    {this.props.intl.formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0714
                                    )}
                                </Checkbox>
                            ))}
                        </div>
                    );
                }
                return null;
            }
        }
    ];

    showConfirm = () => {
        const _this = this;
        /**
         * edc因为没有唯一项(项目也有多选，角色也有多选)
         * 所以删除时候需要根据roleType结合projectIds，roleIds进行删除
         * 删除时需要把整行授权数据传过去判断
         * */
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
                _this.setState({ hideButton: true, selectedRowKeys: [] });
                _this.props.deleteDataItem(
                    this.props.appId,
                    [],
                    this.state.selectedRowKeys
                );
            },
            onCancel() {}
        });
    };

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };

    addEnv = record => {
        const { roleList } = this.state;
        const authData = this.props.authInfoItem;
        if (this.props.edit) {
            const selectAuthItem = find(
                authData,
                authItem =>
                    authItem.roleType === record.roleType &&
                    authItem.projectIds[0] === record.projectIds[0]
            );
            let envList = [];
            /**
             * 如果是已授权演示环境，演示环境从环境列表中保留
             * 如果是新增环境，或者没有授权演示环境，演示环境从列表中过滤掉
             * */
            const authItemEnvIds = this.props.authInfoItem.filter(
                item =>
                    item.projectIds[0] === selectAuthItem.projectIds[0] &&
                    item.roleType === selectAuthItem.roleType
            )[0].envIds;
            if (
                includes([authItemEnvIds], '4028e43d5b7f3ff9015b7f422e100003')
            ) {
                envList = this.state.envList.filter(
                    item =>
                        !item.projectId ||
                        item.projectId === selectAuthItem.projectIds[0]
                );
            } else {
                envList = this.state.envList.filter(
                    item =>
                        (!item.projectId ||
                            item.projectId === selectAuthItem.projectIds[0]) &&
                        item.id !== '4028e43d5b7f3ff9015b7f422e100003'
                );
            }

            /**
             * 角色管理中，对角色增加了适用项目功能，所以选择项目以后添加环境/角色，需要根据角色的适用项目进行角色筛选
             * 可选角色：取该项目的roleVos字段
             * 筛选出可用角色以后再把常规角色和app角色分为两个列表
             * */
            let allRoleList = [];
            const selectProject = find(
                this.state.projectList,
                item => item.id === selectAuthItem.projectIds[0]
            );
            if (!selectProject.roleVos) {
                // 选择的项目都没有roleVos，取roleList中roleType=record.roleType且没有projectIds的角色
                allRoleList = roleList.filter(
                    item =>
                        (!item.projectIds || !item.projectIds.length) &&
                        item.roleType === record.roleType
                );
            } else {
                // 选择的项目中只有一个项目有roleVos，直接取该项目的roleVos字段
                allRoleList = selectProject.roleVos;
            }
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0160
                ),
                width: 600,
                compontent: props => (
                    <RoleAndEnvDrawer
                        {...props}
                        intl={this.props.intl}
                        appId={this.props.appId}
                        type="edit"
                        envList={envList}
                        selectAuthItem={selectAuthItem}
                        saveRoleAndEnv={project => {
                            this.props.changeDataItem(this.props.appId)(
                                project
                            );
                            this.setState({
                                selectedRowKeys: [],
                                hideButton: true
                            });
                        }}
                        roleList={allRoleList.filter(
                            item => item.roleType === record.roleType
                        )}
                    />
                )
            });
        }
    };

    addSite = (project, index, viewAll) => {
        // viewAll 查看全部功能不受编辑状态影响
        // 如果勾选了全部中心权限，那么中心列表不可再更改
        let disabled = project.isAllProSites[index] === '1';
        if (viewAll && !this.props.edit) {
            disabled = true;
        }
        if (this.props.edit || viewAll) {
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0329
                ),
                width: 500,
                compontent: props => (
                    <SiteDrawer
                        {...props}
                        intl={this.props.intl}
                        appId={this.props.appId}
                        index={index}
                        disabled={disabled}
                        project={project}
                        saveSite={this.props.changeDataItem(this.props.appId)}
                    />
                )
            });
        }
    };

    showRoleAuth = userId => {
        const user = find(
            this.state.roleList,
            roleItem => roleItem.id === userId
        );
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0134
            ),
            width: 900,
            compontent: props => (
                <RoleAuthDrawer
                    {...props}
                    systemList={this.props.systemList}
                    projectList={this.state.projectList}
                    isBuiltin={user.isBuiltin === '1'}
                    intl={this.props.intl}
                    roleInfo={user}
                />
            )
        });
    };

    addClassicProject = record => {
        // 后端类型角色添加项目需要把所有当前已授权的后端角色项目都筛选掉
        let selectProjectIds = record.projectIds;
        if (!isEdcFrontRole(record.roleType)) {
            selectProjectIds = flatten(
                this.props.authInfoItem
                    .filter(item => item.roleType === record.roleType)
                    .map(item => item.projectIds)
            );
        }
        const selectRoleList = [
            find(this.state.roleList, item => item.id === record.roleIds[0])
        ];
        drawerFun({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0329
            ),
            width: 500,
            antdConfig: { maskClosable: false },
            compontent: props => (
                <ProjectDrawer
                    {...props}
                    selectRoleList={selectRoleList}
                    fromProjectManage={this.props.fromProjectManage}
                    projectId={this.props.projectId}
                    authType="8"
                    intl={this.props.intl}
                    appId={this.props.appId}
                    selectRole={[record]}
                    addDataItem={projects => {
                        this.setState({
                            selectedRowKeys: [],
                            hideButton: true
                        });
                        this.props.changeDataItem(this.props.appId)(projects);
                    }}
                    selectProjectIds={selectProjectIds}
                />
            )
        });
    };

    deleteSite = (record, index, siteId) => {
        if (this.props.edit) {
            delete record.siteIds[index][siteId];
            this.props.changeDataItem(this.props.appId)([record]);
            this.setState({ selectedRowKeys: [], hideButton: true });
        }
    };

    changeAllSite = async (record, index, checked) => {
        if (this.props.edit) {
            try {
                const newRecord = cloneDeep(record);
                newRecord.isAllProSites[index] = checked ? '1' : '0';
                if (checked) {
                    const siteList =
                        (
                            await authServices.getAssignedSiteList(
                                record.projectIds[0],
                                ''
                            )
                        )?.data || [];
                    const site = {};
                    siteList.forEach(siteItem => {
                        site[siteItem.siteId] = `${
                            siteItem.secondaryCode
                                ? `[${siteItem.secondaryCode}]`
                                : ''
                        }${siteItem.aliasName || '-'}${
                            siteItem.professionName
                                ? `(${siteItem.professionName})`
                                : ''
                        }`;
                    });
                    newRecord.siteIds[index] = site;
                    this.props.changeDataItem(this.props.appId)([newRecord]);
                } else {
                    this.props.changeDataItem(this.props.appId)([newRecord]);
                }
            } catch (error) {
                message.error(error.message);
            }
        }
    };

    deleteProject = (record, projectId) => {
        if (this.props.edit) {
            const newRecord = cloneDeep(record);
            newRecord.projectIds = record.projectIds.filter(
                item => item !== projectId
            );
            this.props.changeDataItem(this.props.appId)([newRecord]);
            this.setState({ selectedRowKeys: [], hideButton: true });
        }
    };

    speedAddData = (appId, projectLists) => {
        this.props.addDataItem(this.props.appId, projectLists);
        this.setState({ showCollectModal: false });
    };

    render() {
        const { selectedRowKeys, applicationRoleTypes } = this.state;
        const { authInfoItem } = this.props;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: () => ({
                disabled: !this.props.edit
            })
        };
        return (
            <div className="eCollect3">
                <div>
                    <Button
                        type="primary"
                        className="mBottom15"
                        onClick={() => {
                            this.setState({
                                showCollectModal: true
                            });
                        }}
                        disabled={!this.props.edit}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0329
                        )}
                    </Button>
                    <Button
                        type="danger"
                        className="mBottom15 mLeft15 mRight40"
                        disabled={
                            !this.props.edit ||
                            this.state.selectedRowKeys.length === 0 ||
                            authInfoItem.length === 0
                        }
                        onClick={this.showConfirm}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0145
                        )}
                    </Button>
                </div>

                {!this.state.loading && (
                    <Table
                        rowKey={record => record}
                        rowSelection={rowSelection}
                        dataSource={authInfoItem}
                        columns={this.columns}
                        pagination={false}
                        scroll={{ x: true }}
                    />
                )}

                {this.state.showCollectModal && (
                    <CollectModal
                        {...this.props}
                        applicationRoleTypes={applicationRoleTypes}
                        onCancel={() => {
                            this.setState({ showCollectModal: false });
                        }}
                        authInfoItem={authInfoItem}
                        visible={this.state.showCollectModal}
                        onOk={this.speedAddData}
                        fromProjectManage={this.props.fromProjectManage}
                        projectId={this.props.projectId}
                        userType={this.props.userType}
                        authType={
                            find(
                                this.props.systemList,
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        addDataItem={this.props.addDataItem}
                        envList={this.state.envList.filter(
                            item =>
                                item.id !== '4028e43d5b7f3ff9015b7f422e100003'
                        )}
                        allRole={this.state.roleList}
                    />
                )}
            </div>
        );
    }
}

export default eCollect5;
