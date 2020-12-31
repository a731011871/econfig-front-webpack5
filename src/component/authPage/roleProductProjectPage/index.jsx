import React from 'react';
import { Button, Table, message, Modal } from 'antd';
import PropTypes from 'prop-types';
import { find, includes, cloneDeep } from 'lodash';
import { drawerFun } from 'src/component/drawer';
import { authServices } from 'src/service/authService';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';
import ProjectDrawer from '../drawers/projectDrawer';
import RoleDrawer from '../drawers/roleDrawer';
import ProductDrawer from '../drawers/productDrawer';
import RoleAuthDrawer from '../drawers/roleAuthDrawer';
import ContentItem from './contentItem';
import RoleProductProjectModal from '../modals/roleProductProjectModal';
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
    float: left;
    vertical-align: middle;
`;
const SiteSpan = styled.span`
    max-width: 164px;
    vertical-align: middle;
`;

@injectIntl
class roleProductProjectPage extends React.PureComponent {
    static propTypes = {
        authInfoItem: PropTypes.array,
        systemList: PropTypes.array,
        changeDataItem: PropTypes.func,
        addDataItem: PropTypes.func,
        deleteDataItem: PropTypes.func,
        changeList: PropTypes.func,
        authMode: PropTypes.number, // 授权默示  1经典  2快捷
        edit: PropTypes.bool
    };

    state = {
        selectedRowKeys: [],
        hideButton: true,
        projectList: [],
        roleList: [],
        productDataList: [],
        listPvSuperRole: [],
        loading: true,
        showRoleProductProjectModal: false
    };

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if (!nextProps.edit) {
            return {
                ...(nextProps.value || {}),
                selectedRowKeys: [],
                hideButton: true
            };
        }
        return null;
    }

    componentDidMount = async () => {
        console.log('~~~~~~~~~~~~~~~~~~');
        const { userProperty, userType } = this.props;
        // 判断userProperty是否为undefined是的话就用userType
        const t = userProperty || userType;
        try {
            const projectList = await authServices.getProjectList(
                this.props.appId
            );
            const productDataList = await authServices.getProductDataList(
                this.props.appId
            );
            const roleList = await authServices.getRoleList(this.props.appId);
            const listPvSuperRole = await authServices.getListPvSuperRole(t);
            this.setState({
                projectList: projectList.list,
                roleList: roleList.map(item => ({
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
                })),
                listPvSuperRole,
                productDataList,
                loading: false
            });
            this.props.changeList(this.props.appId, roleList, projectList.list);
        } catch (e) {
            message.error(e.message);
        }
    };

    columns = [
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0163
            ),
            dataIndex: 'roleIds',
            width: 150,
            render: roleIds => {
                if (roleIds && roleIds.length > 0) {
                    return (
                        <div>
                            {roleIds.map(item => {
                                const user = find(
                                    this.state.roleList,
                                    roleItem => roleItem.id === item
                                );
                                if (user) {
                                    return (
                                        <a
                                            key={item}
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
                                return null;
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
                i18nMessages.ECONFIG_FRONT_A0166
            ),
            width: 500,
            dataIndex: 'productDataIds',
            render: (productDataIds, record) => {
                if (productDataIds && productDataIds.length > 0) {
                    return [
                        <SiteBtn
                            key="addProduct"
                            className={`InlineBlock mRight15 ${!this.props
                                .edit && 'DisabledBtn'}`}
                            onClick={() => this.addProduct(record)}
                            title={this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0312
                            )}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0312
                            )}
                        </SiteBtn>,
                        <ContentItem
                            key="datas"
                            datas={this.state.productDataList}
                            dataIds={productDataIds}
                            edit={this.props.edit}
                            intl={this.props.intl}
                            onDelete={deleteItem => {
                                this.deleteProduct(record, deleteItem);
                            }}
                            showAddProject={false}
                        />
                    ];
                }
                return this.props.edit ? (
                    <SiteBtn
                        className={`InlineBlock mRight15 ${!this.props.edit &&
                            'DisabledBtn'}`}
                        onClick={() => this.addProduct(record)}
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0312
                        )}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0312
                        )}
                    </SiteBtn>
                ) : null;
            }
        },
        {
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0328
            ),
            dataIndex: 'projectIds',
            width: 500,
            render: (projectIds, record) => {
                const user = find(
                    this.state.roleList,
                    roleItem => roleItem.id === record.roleIds[0]
                );
                if (
                    user.needProject === 1 &&
                    projectIds &&
                    projectIds.filter(item => item !== 'ALL' && item !== 'NONE')
                        .length > 0
                ) {
                    return (
                        <ContentItem
                            datas={this.state.projectList}
                            edit={this.props.edit}
                            authMode={this.props.authMode}
                            intl={this.props.intl}
                            dataIds={projectIds.filter(
                                item => item !== 'ALL' && item !== 'NONE'
                            )}
                            onDelete={deleteItem => {
                                this.deleteProject(record, deleteItem);
                            }}
                            addProject={() => {
                                this.addProject(record);
                            }}
                            isProject
                        />
                    );
                } else if (
                    user.needProject === 0 &&
                    user.nullProjectDefaultValue === 'ALL'
                ) {
                    return (
                        <SiteItem>
                            <SiteSpan
                                className="InlineBlock flex overflow_ellipsis"
                                title={this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0302
                                )}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0302
                                )}
                            </SiteSpan>
                        </SiteItem>
                    );
                } else if (
                    user.needProject === 0 &&
                    user.nullProjectDefaultValue === 'NONE'
                ) {
                    return (
                        <div className="Gray_9e mTop8">
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0303
                            )}
                        </div>
                    );
                }
                return (
                    <SiteBtn
                        className={`InlineBlock mRight15 ${!this.props.edit &&
                            'DisabledBtn'}`}
                        onClick={() => {
                            this.addProject(record);
                        }}
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0311
                        )}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0311
                        )}
                    </SiteBtn>
                );
            }
        }
    ];

    showConfirm = () => {
        const _this = this;
        const selectRoleIds = this.state.selectedRowKeys.map(
            item => item.roleIds[0]
        );
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
                _this.props.deleteDataItem(this.props.appId, selectRoleIds);
            },
            onCancel() {}
        });
    };

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        let hideButton = false;
        if (
            (selectedRowKeys.length > 1 &&
                selectedRowKeys.filter(item => item.productDataIds.length > 0)
                    .length > 0) ||
            selectedRowKeys.length === 0
        ) {
            hideButton = true;
        }

        this.setState({ selectedRowKeys, hideButton });
    };

    addProduct = record => {
        if (this.props.edit) {
            const selectProductIds = record
                ? record.productDataIds
                : this.state.selectedRowKeys.length === 1
                ? this.state.selectedRowKeys[0].productDataIds
                : [];
            const selectRecords = record
                ? [record]
                : this.state.selectedRowKeys;
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0329
                ),
                width: 700,
                compontent: props => (
                    <ProductDrawer
                        {...props}
                        intl={this.props.intl}
                        appId={this.props.appId}
                        selectProductIds={selectProductIds}
                        productList={this.state.productDataList}
                        selectRecords={selectRecords}
                        saveProduct={records => {
                            this.setState({ selectedRowKeys: [] });
                            this.props.changeDataItem(this.props.appId)(
                                records
                            );
                        }}
                    />
                )
            });
        }
    };

    addProject = record => {
        if (this.props.edit) {
            console.log(record);
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0329
                ),
                width: 500,
                antdConfig: { maskClosable: false },
                compontent: props => (
                    <ProjectDrawer
                        {...props}
                        fromProjectManage={this.props.fromProjectManage}
                        projectId={this.props.projectId}
                        authType={
                            find(
                                this.props.systemList,
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        record={record}
                        addDataItem={this.props.changeDataItem(
                            this.props.appId
                        )}
                        selectProjectIds={record.projectIds}
                    />
                )
            });
        }
    };

    addRole = () => {
        if (this.props.edit) {
            const selectedRole = this.props.authInfoItem.map(
                item => item.roleIds[0]
            );
            drawerFun({
                title: this.props.intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0293
                ),
                width: 500,
                compontent: props => (
                    <RoleDrawer
                        {...props}
                        authType={
                            find(
                                this.props.systemList,
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        type="new"
                        saveRole={(appId, projectLists) => {
                            this.props.addDataItem(
                                this.props.appId,
                                projectLists
                            );
                        }}
                        roleList={this.state.roleList
                            .filter(item => !includes(selectedRole, item.id))
                            .filter(
                                item =>
                                    !includes(
                                        this.state.listPvSuperRole,
                                        item.id
                                    )
                            )}
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
                    isBuiltin={user.isBuiltin === '1'}
                    intl={this.props.intl}
                    roleInfo={user}
                />
            )
        });
    };

    deleteProduct = (record, productId) => {
        if (this.props.edit) {
            const newRecord = cloneDeep(record);
            newRecord.productDataIds = newRecord.productDataIds.filter(
                item => item !== productId
            );
            this.props.changeDataItem(this.props.appId)([newRecord]);
            this.setState({ selectedRowKeys: [], hideButton: true });
        }
    };

    deleteProject = (project, projectId) => {
        if (this.props.edit) {
            const newProject = cloneDeep(project);
            newProject.projectIds = project.projectIds.filter(
                item => item !== projectId
            );
            this.props.changeDataItem(this.props.appId)([newProject]);
            this.setState({ selectedRowKeys: [], hideButton: true });
        }
    };

    speedAddData = (appId, projectLists) => {
        this.props.addDataItem(this.props.appId, projectLists);
        this.setState({ showRoleProductProjectModal: false });
    };

    render() {
        const { selectedRowKeys, loading } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: () => ({
                disabled: !this.props.edit
            })
        };
        const selectedRole = this.props.authInfoItem.map(
            item => item.roleIds[0]
        );
        return !loading ? (
            <div className="roleProductProjectPage">
                <div>
                    {this.props.authMode === 2 ? (
                        <Button
                            type="primary"
                            className="mBottom15 mRight15"
                            onClick={() => {
                                this.setState({
                                    showRoleProductProjectModal: true
                                });
                            }}
                            disabled={!this.props.edit}
                        >
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0329
                            )}
                        </Button>
                    ) : (
                        [
                            <Button
                                type="primary"
                                key="addProject"
                                className="mBottom15 mRight15"
                                onClick={() => {
                                    this.addRole();
                                }}
                                disabled={!this.props.edit}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0293
                                )}
                            </Button>,
                            <Button
                                type="primary"
                                key="addProduct"
                                className="mBottom15 mRight15"
                                disabled={
                                    !this.props.edit ||
                                    this.state.selectedRowKeys.length === 0 ||
                                    this.state.hideButton ||
                                    this.props.authInfoItem.length === 0
                                }
                                onClick={() => {
                                    this.addProduct();
                                }}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0312
                                )}
                            </Button>
                        ]
                    )}
                    <Button
                        type="danger"
                        className="mBottom15"
                        disabled={
                            !this.props.edit ||
                            this.state.selectedRowKeys.length === 0 ||
                            this.props.authInfoItem.length === 0
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
                        dataSource={this.props.authInfoItem}
                        columns={this.columns}
                        pagination={false}
                        // scroll={{ x: true }}
                    />
                )}

                {this.state.showRoleProductProjectModal && (
                    <RoleProductProjectModal
                        {...this.props}
                        onCancel={() => {
                            this.setState({
                                showRoleProductProjectModal: false
                            });
                        }}
                        visible={this.state.showRoleProductProjectModal}
                        roleList={this.state.roleList
                            .filter(item => !includes(selectedRole, item.id))
                            .filter(
                                item =>
                                    !includes(
                                        this.state.listPvSuperRole,
                                        item.id
                                    )
                            )}
                        productList={this.state.productDataList}
                        authType={
                            find(
                                this.props.systemList,
                                systemItem =>
                                    systemItem.appId === this.props.appId
                            ).authType
                        }
                        intl={this.props.intl}
                        appId={this.props.appId}
                        projectId={this.props.projectId}
                        fromProjectManage={this.props.fromProjectManage}
                        selectProjectIds={[]}
                        onOk={this.speedAddData}
                    />
                )}
            </div>
        ) : null;
    }
}

export default roleProductProjectPage;
