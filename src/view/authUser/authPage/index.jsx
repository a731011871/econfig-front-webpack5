import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, message, Button } from 'antd';
import { includes, cloneDeep, find, sortBy, remove } from 'lodash';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { formatData, validateData, isEdcFrontRole } from 'utils/functions';
import { i18nMessages } from 'src/i18n';
import Collect5 from './eCollect5';
import Site from './eSite';
import Balance from './eBalance';
import RoleAuthPage from './roleAuthPage';
import RoleProductProjectPage from './roleProductProjectPage';
import RoleProjectPage from './roleProjectPage';
import RoleProjectSitePage from './roleProjectSitePage';
import ProjectRoleSitePage from './projectRoleSitePage';
import RoleDepartmentPage from './roleDepartmentPage';
// import RoleProjectSoftPage from './roleProjectSoftPage';

const TabPane = Tabs.TabPane;
// authType=1 RoleAuthPage

// authType=2 RoleProjectPage

// authType=3 RoleProductProjectPage

// authType=4 RoleProjectSitePage

// authType=5 eSite

// authType=6 ProjectRoleSitePage

// authType=7 eBalance

// authType=8 eCollect5

// authType=9 role project soft

// authType=10 role department

class AuthPage extends React.PureComponent {
    static propTypes = {
        edit: PropTypes.bool, // 编辑 取消
        userId: PropTypes.string,
        loginUserRole: PropTypes.string, //登录用户管理员类型 如果不是 项目管理员projectAdmin 项目列表增加ALL Project选项
        projectId: PropTypes.string, // 从项目列表中进入人员信息，需要判断应用是否包含此项目
        operateData: PropTypes.object
    };

    softAuthData = {};

    // roleList = cloneDeep(softAuthData);
    roleList = {};

    projectList = {};
    // projectList = cloneDeep(softAuthData);

    constructor(props) {
        super(props);
        this.state = {
            systemList: [],
            selectSystem: '', // 选中的应用
            authInfo: {},
            oldAuthInfo: {}, // 取到后端数据后存起来，保存时候用oldAuthInfo与当前authInfo对比，判断被清空授权信息的应用
            hasAuthArr: [], // 编辑过程中有授权的应用数组
            nullAuthArr: [], // 编辑过程中没有授权的应用数组
            authMode: 1 //授权操作模式  1-经典  2-通用
        };
    }

    componentDidMount = async () => {
        try {
            const { applicationVos } = this.props.operateData;
            // const result = await $http.get(
            //     `${urls.getFilterSoftList}?email=${
            //         this.props.userInfo.email
            //     }&projectId=${this.props.projectId || ''}`
            // );

            // 授权插件不要econfig授权，要筛选掉
            const systemList = sortBy(
                applicationVos.filter(
                    item =>
                        item.authType &&
                        item.authType !== '-1' &&
                        item.appId !== 'econfig' &&
                        item.appId !== 'edc'
                ),
                item => item.isAuth !== '1'
            );
            const softAuthData = {};
            systemList.forEach(item => {
                softAuthData[item.appId] = [];
            });
            this.softAuthData = cloneDeep(softAuthData);
            this.roleList = cloneDeep(softAuthData);
            this.projectList = cloneDeep(softAuthData);
            const authMap = cloneDeep(softAuthData);
            const oldAuthInfo = cloneDeep(softAuthData);
            if (systemList.length > 0 && this.props.userId) {
                const authInfo = await $http.get(
                    `${urls.cspGetUserRelProAuth}?userId=${
                        this.props.userId
                    }&appId=${systemList[0].appId}&projectId=${this.props
                        .projectId || ''}`
                );
                authMap[systemList[0].appId] = authInfo || [];
                oldAuthInfo[systemList[0].appId] = authInfo || [];
                this.setState({
                    systemList,
                    selectSystem: systemList[0].appId,
                    authInfo: authMap,
                    oldAuthInfo
                });
            } else {
                this.setState({
                    systemList,
                    selectSystem:
                        systemList.length > 0 ? systemList[0].appId : '',
                    authInfo: authMap,
                    oldAuthInfo
                });
            }
        } catch (e) {
            message.error(e.message);
        }
    };

    cancelReset = () => {
        const systemList = cloneDeep(this.state.systemList);
        systemList.forEach(item => {
            if (includes(this.state.hasAuthArr, item.appId)) {
                item.isAuth = '1';
            }
            if (includes(this.state.nullAuthArr, item.appId)) {
                item.isAuth = '0';
            }
        });
        const authMode = includes(['site'], this.state.selectSystem) ? 1 : 2;
        this.setState(
            {
                // authInfo: cloneDeep(softAuthData),
                authInfo: cloneDeep(this.softAuthData),
                // oldAuthInfo: cloneDeep(softAuthData)
                oldAuthInfo: cloneDeep(this.softAuthData),
                systemList: sortBy(systemList, item => item.isAuth !== '1'),
                hasAuthArr: [],
                nullAuthArr: [],
                authMode
            },
            () => {
                if (this.state.selectSystem) {
                    this.callback(this.state.selectSystem, true);
                }
            }
        );
    };

    callback = async (key, needSearch) => {
        const { authInfo, selectSystem, systemList } = this.state;
        const { intl } = this.props;
        const nullAppIds = needSearch ? [] : this.getAppIds();
        if (
            !this.props.edit ||
            validateData(
                systemList,
                selectSystem,
                authInfo[selectSystem],
                this.roleList[selectSystem],
                this.projectList[selectSystem],
                intl.formatMessage
            )
        ) {
            try {
                if (
                    this.props.userId &&
                    this.state.authInfo[key].length === 0 &&
                    !includes(nullAppIds, key)
                ) {
                    const authItemInfo = await $http.get(
                        `${urls.cspGetUserRelProAuth}?userId=${
                            this.props.userId
                        }&appId=${key}&projectId=${this.props.projectId || ''}`
                    );
                    const authMap = cloneDeep(this.state.authInfo);
                    const oldAuthInfo = cloneDeep(this.state.oldAuthInfo);
                    authMap[key] = authItemInfo || [];
                    oldAuthInfo[key] = authItemInfo || [];
                    const hasAuthArr = remove(
                        this.state.hasAuthArr,
                        arrItem => arrItem !== key
                    );
                    const nullAuthArr = remove(
                        this.state.nullAuthArr,
                        arrItem => arrItem !== key
                    );
                    if (authMap[key].length > 0) {
                        hasAuthArr.push(key);
                    } else {
                        nullAuthArr.push(key);
                    }
                    this.setState({
                        selectSystem: key,
                        authInfo: authMap,
                        oldAuthInfo,
                        hasAuthArr,
                        nullAuthArr
                    });
                } else {
                    this.setState({
                        selectSystem: key
                    });
                }
            } catch (e) {
                message.error(e.message);
            }
        }

        console.log(key);
    };

    addDataItem = (appId, projectList) => {
        const hasAuthArr = remove(
            this.state.hasAuthArr,
            arrItem => arrItem !== appId
        );
        const nullAuthArr = remove(
            this.state.nullAuthArr,
            arrItem => arrItem !== appId
        );
        const authItem = this.state.authInfo[appId].concat(projectList);
        hasAuthArr.push(appId);
        this.setState({
            authInfo: { ...this.state.authInfo, [appId]: authItem },
            hasAuthArr,
            nullAuthArr
        });
    };

    changeDataItem = appId => project => {
        const authType = find(
            this.state.systemList,
            item => item.appId === appId
        ).authType;
        if (includes(['2', '3', '4', '5', '9', '10'], authType)) {
            const authInfo = cloneDeep(this.state.authInfo);
            authInfo[appId].forEach(item => {
                project.forEach(projectItem => {
                    if (item.roleIds[0] === projectItem.roleIds[0]) {
                        Object.assign(item, projectItem);
                    }
                });
            });
            this.setState({
                authInfo
            });
        } else if (appId === 'edc') {
            /**
             * edc因为数据结构不一样，单独处理
             * */
            const authInfo = cloneDeep(this.state.authInfo);
            const edcAuthInfo = authInfo[appId] || [];
            edcAuthInfo.forEach(item => {
                const authItemkey = `${item.roleType}-${
                    isEdcFrontRole(item.roleType)
                        ? item.projectIds[0]
                        : item.roleIds[0]
                }`;
                project.forEach(projectItem => {
                    const projectItemkey = `${projectItem.roleType}-${
                        isEdcFrontRole(projectItem.roleType)
                            ? projectItem.projectIds[0]
                            : projectItem.roleIds[0]
                    }`;
                    if (authItemkey === projectItemkey) {
                        Object.assign(item, projectItem);
                    }
                });
            });
            this.setState({
                authInfo
            });
        } else {
            const authInfo = cloneDeep(this.state.authInfo);
            authInfo[appId].forEach(item => {
                project.forEach(projectItem => {
                    if (item.projectIds[0] === projectItem.projectIds[0]) {
                        Object.assign(item, projectItem);
                    }
                });
            });
            this.setState({
                authInfo
            });
        }
    };

    deleteDataItem = (appId, deleteIds, edcDeleteItems) => {
        const authType = find(
            this.state.systemList,
            item => item.appId === appId
        ).authType;
        if (includes(['1', '2', '3', '4', '5', '9', '10'], authType)) {
            const authItem = this.state.authInfo[appId].filter(
                item => !includes(deleteIds, item.roleIds[0])
            );
            const hasAuthArr = remove(
                this.state.hasAuthArr,
                arrItem => arrItem !== appId
            );
            const nullAuthArr = remove(
                this.state.nullAuthArr,
                arrItem => arrItem !== appId
            );
            if (authItem.length > 0) {
                hasAuthArr.push(appId);
            } else {
                nullAuthArr.push(appId);
            }
            this.setState({
                authInfo: { ...this.state.authInfo, [appId]: authItem },
                hasAuthArr,
                nullAuthArr
            });
        } else if (appId === 'edc') {
            /**
             * edc因为数据结构不一样，单独处理
             * * edcDeleteItems edc应用中整行授权数据，
             * edc删除不传deleteIds
             * 将要删除的授权数据手动创建一个唯一标识
             * 如果roleType是前端角色，标识为roleType+projectIds[0]
             * 如果roleType是后端角色，标识为roleType+roleIds[0]
             * 根据唯一标识筛选需要删除的数据
             * */
            const deleteItemKeys = edcDeleteItems.map(
                item =>
                    `${item.roleType}-${
                        isEdcFrontRole(item.roleType)
                            ? item.projectIds[0]
                            : item.roleIds[0]
                    }`
            );
            const authItem = this.state.authInfo[appId].filter(item => {
                const key = `${item.roleType}-${
                    isEdcFrontRole(item.roleType)
                        ? item.projectIds[0]
                        : item.roleIds[0]
                }`;
                return !includes(deleteItemKeys, key);
            });
            const hasAuthArr = remove(
                this.state.hasAuthArr,
                arrItem => arrItem !== appId
            );
            const nullAuthArr = remove(
                this.state.nullAuthArr,
                arrItem => arrItem !== appId
            );
            if (authItem.length > 0) {
                hasAuthArr.push(appId);
            } else {
                nullAuthArr.push(appId);
            }
            this.setState({
                authInfo: { ...this.state.authInfo, [appId]: authItem },
                hasAuthArr,
                nullAuthArr
            });
        } else {
            const authItem = this.state.authInfo[appId].filter(
                item => !includes(deleteIds, item.projectIds[0])
            );
            const hasAuthArr = remove(
                this.state.hasAuthArr,
                arrItem => arrItem !== appId
            );
            const nullAuthArr = remove(
                this.state.nullAuthArr,
                arrItem => arrItem !== appId
            );
            if (authItem.length > 0) {
                hasAuthArr.push(appId);
            } else {
                nullAuthArr.push(appId);
            }
            this.setState({
                authInfo: { ...this.state.authInfo, [appId]: authItem },
                hasAuthArr,
                nullAuthArr
            });
        }
    };

    getAuthDto = () => {
        const { authInfo, selectSystem, systemList } = this.state;
        const { intl } = this.props;
        if (
            validateData(
                systemList,
                selectSystem,
                authInfo[selectSystem],
                this.roleList[selectSystem],
                this.projectList[selectSystem],
                intl.formatMessage
            )
        ) {
            return formatData(
                authInfo,
                this.state.systemList,
                this.roleList[selectSystem]
            );
        } else {
            // message.error('请完整填写授权信息');
            return false;
        }
    };

    getAppIds = () => {
        return this.state.nullAuthArr;
        // return getNullAppId(this.state.oldAuthInfo, this.state.authInfo);
    };

    changeList = (appId, roleList, projectList) => {
        this.roleList[appId] = roleList;
        this.projectList[appId] = projectList;
    };

    setOldAuthInfo = () => {
        this.setState({ oldAuthInfo: this.state.authInfo });
    };

    changeAuthMode = authMode => {
        this.setState({ authMode });
    };

    render() {
        // const { authMode } = this.state;
        const authMode = includes(['site'], this.state.selectSystem)
            ? this.state.authMode
            : 2;
        const props = {
            systemList: this.state.systemList,
            addDataItem: this.addDataItem,
            deleteDataItem: this.deleteDataItem,
            changeDataItem: this.changeDataItem,
            changeList: this.changeList,
            loginUserRole: this.props.loginUserRole,
            edit: this.props.edit,
            fromProjectManage: this.props.fromProjectManage,
            projectId: this.props.projectId,
            userType: this.props.userType,
            userProperty: this.props.userProperty
        };
        return this.state.systemList.length > 0 ? (
            <div className="authBox">
                <div className="Font18 pLeft40 mTop24 BorderBottomD pBottom15">
                    <span className="mRight15">
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0343
                        )}
                    </span>
                    {this.props.edit &&
                        includes(['site'], this.state.selectSystem) && [
                            <Button
                                key="newAuth"
                                className="mRight15"
                                type={authMode !== 1 ? 'primary' : 'dashed'}
                                onClick={() => {
                                    this.changeAuthMode(2);
                                }}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0491
                                )}
                            </Button>,
                            <Button
                                key="oldAuth"
                                type={authMode === 1 ? 'primary' : 'dashed'}
                                onClick={() => {
                                    this.changeAuthMode(1);
                                }}
                            >
                                {this.props.intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0492
                                )}
                            </Button>
                        ]}
                </div>
                <div className="authContent pLeft40 pRight40">
                    <Tabs
                        // defaultActiveKey={}
                        activeKey={this.state.selectSystem}
                        onChange={this.callback}
                    >
                        {this.state.systemList.map(item => {
                            switch (item.authType) {
                                case '10':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <RoleDepartmentPage
                                                {...props}
                                                authMode={authMode}
                                                appId={item.appId}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                            />
                                        </TabPane>
                                    );
                                // case '9':
                                //     return (
                                //         <TabPane
                                //             tab={
                                //                 <span
                                //                     className={
                                //                         item.isAuth === '1'
                                //                             ? 'Green'
                                //                             : ''
                                //                     }
                                //                 >
                                //                     {item.appName}
                                //                 </span>
                                //             }
                                //             key={item.appId}
                                //         >
                                //             <RoleProjectSoftPage
                                //                 {...props}
                                //                 authMode={authMode}
                                //                 appId={item.appId}
                                //                 appName={item.appName}
                                //                 authInfoItem={
                                //                     this.state.authInfo[
                                //                         item.appId
                                //                     ] || []
                                //                 }
                                //             />
                                //         </TabPane>
                                //     );
                                case '8':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <Collect5
                                                {...props}
                                                authMode={authMode}
                                                appId={item.appId}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                                // systemList={
                                                //     this.state.systemList
                                                // }
                                                // addDataItem={this.addDataItem}
                                                // deleteDataItem={
                                                //     this.deleteDataItem
                                                // }
                                                // changeDataItem={
                                                //     this.changeDataItem
                                                // }
                                                // changeList={this.changeList}
                                                // edit={this.props.edit}
                                                // fromProjectManage={
                                                //     this.props.fromProjectManage
                                                // }
                                                // projectId={this.props.projectId}
                                            />
                                        </TabPane>
                                    );
                                case '5':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <Site
                                                {...props}
                                                appId={item.appId}
                                                authMode={authMode}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                            />
                                        </TabPane>
                                    );
                                case '7':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <Balance
                                                {...props}
                                                appId={item.appId}
                                                authMode={authMode}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                            />
                                        </TabPane>
                                    );
                                case '1':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <RoleAuthPage
                                                {...props}
                                                appId={item.appId}
                                                authMode={authMode}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                            />
                                        </TabPane>
                                    );
                                case '2':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <RoleProjectPage
                                                {...props}
                                                appId={item.appId}
                                                authMode={authMode}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                            />
                                        </TabPane>
                                    );
                                case '3':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <RoleProductProjectPage
                                                {...props}
                                                appId={item.appId}
                                                authMode={authMode}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                            />
                                        </TabPane>
                                    );
                                case '4':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <RoleProjectSitePage
                                                {...props}
                                                appId={item.appId}
                                                authMode={authMode}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                            />
                                        </TabPane>
                                    );
                                case '6':
                                    return (
                                        <TabPane
                                            tab={
                                                <span
                                                    className={
                                                        item.isAuth === '1'
                                                            ? 'Green'
                                                            : ''
                                                    }
                                                >
                                                    {item.appName}
                                                </span>
                                            }
                                            key={item.appId}
                                        >
                                            <ProjectRoleSitePage
                                                {...props}
                                                appId={item.appId}
                                                authMode={authMode}
                                                appName={item.appName}
                                                authInfoItem={
                                                    this.state.authInfo[
                                                        item.appId
                                                    ] || []
                                                }
                                            />
                                        </TabPane>
                                    );
                                default:
                                    break;
                            }
                        })}
                    </Tabs>
                </div>
            </div>
        ) : null;
    }
}

export default AuthPage;
