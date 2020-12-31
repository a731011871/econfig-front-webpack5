/*
 * @Author: lei.zhao
 * @Date: 2020-06-29 16:50:26
 * @LastEditTime: 2020-10-20 15:32:24
 * @LastEditors: lei.zhao
 * @Description: 
 * @FilePath: /econfig-front/src/view/authPlugin/index.jsx
 * 对接步骤：
 * 1：请求/api/csp-service/userBatchAddAuth/userCheck获取返回值operateId  (需要有上下文appId，userId tenantId)
 * 参数： 
 * {
   "backUrl": "/econfig/department_manage",
   "baseUserDtos": [
     {
         "email": "tmpv7@mobilemd.cn",
         "userProperty": "CompanyUser",
         "userName": "石小庙",
         "accountId": "5dc298b159e843c9814e6e758fa5a5ed"
     }
   ],
   "projectId": "4028e9026e8325f8016e86bc7d560007",
   "roleIds": []
 * }
 * 2：跳转/econfig/authplugin?operateId={operateId}
 */

import React from 'react';
import styled from 'styled-components';
import { Button, message, Modal, Icon } from 'antd';
import { injectIntl } from 'react-intl';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { authServices } from '../../service/authService';
import { find, includes } from 'lodash';
import { i18nMessages } from 'src/i18n';
import { deptService } from 'src/service/deptService';
import './index.less';
import AuthTable from './authTable';
// import { Route, Switch } from 'react-router-dom';

const confirm = Modal.confirm;
const FixedDiv = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: 100%;
    z-index: 3;
    background: #fff;
    display: flex;
    flex-direction: column;
`;
const success = Modal.success;

@injectIntl
class AuthPlugin extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            operateData: {},
            roleList: [], // 可被选择的角色列表
            allRoleList: [], // 所有的角色列表
            siteList: [],
            departmentList: []
        };
        this.authTableRef = React.createRef();
    }

    get operateId() {
        return window.location.search?.split('=')[1] || '';
    }

    async componentWillMount() {
        const {
            intl: { formatMessage }
        } = this.props;
        if (this.operateId) {
            try {
                const operateData = await $http.get(
                    urls.authPluginGetOperateData,
                    { operateId: this.operateId },
                    {
                        headers: {
                            'TM-HEADER-BATCH': new Date().getTime()
                            // 'TM-Header-AppId': 'sms'
                        }
                    }
                );
                const roleList = await authServices.getRoleList(
                    operateData.source
                );
                const departmentList = await deptService.fetchDepartment();
                const siteList = operateData.projectId
                    ? await authServices.getAssignedSiteList(
                          operateData.projectId
                      )
                    : { data: [] };
                if (operateData) {
                    /**
                     * roleList需要筛选存在于operateData.roleIds中的角色
                     */
                    this.setState({
                        roleList:
                            roleList?.filter(
                                item =>
                                    (operateData.projectId
                                        ? item.needProject === 1
                                        : item.needProject === 0) &&
                                    (operateData.roleIds &&
                                    operateData.roleIds.length > 0
                                        ? includes(operateData.roleIds, item.id)
                                        : true)
                            ) || [],
                        allRoleList: roleList,
                        siteList:
                            siteList.data.map(item => ({
                                siteId: item.siteId,
                                siteName: `${
                                    item.secondaryCode
                                        ? `[${item.secondaryCode}]`
                                        : ''
                                }${item.aliasName}${
                                    item.professionName
                                        ? `(${item.professionName})`
                                        : ''
                                }`
                            })) || [],
                        operateData,
                        departmentList
                    });
                } else {
                    message.error(
                        formatMessage(i18nMessages.ECONFIG_FRONT_A0632)
                    );
                    this.props.history.back();
                }
            } catch (error) {
                message.error(error.message);
            }
        } else {
            message.error(formatMessage(i18nMessages.ECONFIG_FRONT_A0632));
            this.props.history.back();
        }
    }

    saveAuth = async () => {
        const {
            intl: { formatMessage }
        } = this.props;
        console.log(formatMessage);
        try {
            const { operateData, allRoleList } = this.state;
            const { tableData } = this.authTableRef.current.state;
            /**
             * 保存时判断所有人员授权数据是否完整
             * 如果其中存在 选择的角色needSite === 1 && 没选中心  的话阻止保存
             */
            if (
                tableData.filter(
                    item =>
                        (item.authData || []).filter(
                            authItem =>
                                authItem.roleId &&
                                find(
                                    allRoleList,
                                    roleItem => roleItem.id === authItem.roleId
                                ).needSite === 1 &&
                                (!authItem.siteIds || !authItem.siteIds.length)
                        ).length > 0
                ).length > 0
            ) {
                message.error(formatMessage(i18nMessages.ECONFIG_FRONT_A0631));
            } else {
                await $http.post(urls.authPluginSaveAuth, {
                    batchUserAuthDtos: tableData,
                    operateId: this.operateId,
                    projectId: operateData.projectId
                });
                if (tableData.filter(item => !item.userId).length > 0) {
                    success({
                        title: formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0638
                        ).replace(
                            'xx',
                            tableData.filter(item => !item.userId).length
                        ),
                        okText: formatMessage(i18nMessages.ECONFIG_FRONT_A0279),
                        onOk: () => (location.href = `${operateData.backUrl}`)
                    });
                } else {
                    message.success(
                        formatMessage(i18nMessages.ECONFIG_FRONT_A0261)
                    );
                    setTimeout(() => {
                        location.href = `${operateData.backUrl}`;
                    }, 200);
                }
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    goBack = () => {
        confirm({
            title: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0670
            ),
            okText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0279
            ),
            cancelText: this.props.intl.formatMessage(
                i18nMessages.ECONFIG_FRONT_A0281
            ),
            onOk: () => {
                this.props.history.goBack();
            }
        });
    };

    render() {
        const {
            intl: { formatMessage }
        } = this.props;
        const {
            operateData,
            roleList,
            allRoleList,
            siteList,
            departmentList
        } = this.state;
        const {
            source,
            appName = '',
            projectName = '',
            tenantName = ''
        } = operateData;
        if (operateData.baseUserDtos) {
            return (
                <FixedDiv className="authPlugin">
                    <div className="header">
                        <span className="title">
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0630)}
                        </span>
                        <Icon
                            type="close"
                            className="Right mLeft16"
                            style={{
                                lineHeight: '28px',
                                fontSize: '16px',
                                color: '#aaa'
                            }}
                            onClick={this.goBack}
                        />
                        <Button
                            style={{
                                float: 'right',
                                height: 24,
                                borderRadius: 15
                            }}
                            type="primary"
                            onClick={this.saveAuth}
                        >
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0062)}
                        </Button>
                    </div>
                    <div className="authContentBox" style={{ flex: 1 }}>
                        <div className="authContent">
                            <div className="title">
                                {`${appName || source}${
                                    projectName ? `/${projectName}` : ''
                                }/${tenantName}`}
                            </div>

                            <AuthTable
                                formatMessage={formatMessage}
                                operateData={operateData}
                                roleList={roleList}
                                departmentList={departmentList}
                                siteList={siteList}
                                allRoleList={allRoleList}
                                ref={this.authTableRef}
                            />
                        </div>
                    </div>
                </FixedDiv>
            );
        }
        return null;
    }
}

export default AuthPlugin;
