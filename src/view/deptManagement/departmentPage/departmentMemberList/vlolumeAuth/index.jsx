/*
 * @Author: lei.zhao
 * @Date: 2020-06-29 16:50:26
 * @LastEditTime: 2020-09-29 16:00:24
 * @LastEditors: lei.zhao
 * @Description: 
 * @FilePath: /econfig-front/src/view/deptManagement/departmentPage/departmentMemberList/vlolumeAuth/index.jsx
 * 对接步骤：
 * 1：请求/api/csp-service/userBatchAddAuth/userCheck获取返回值operateId  (需要有上下文appId，userId tenantId)
 * 参数： 
 * {
        "backUrl": "/econfig/department_manage",  回调地址
        "baseUserDtos": [
            {
                "email": "912521404@qq.com", //邮箱  必填   100
                "accountId": "", //必填
                "userName": "史小苗",  //姓名 必填  50
                "userProperty": "CompanyUser" //用户属性（CompanyUser、OutUser） 必填
            }
        ],
        "projectId": "2c94a500727839170172792e080500dd",  //项目id 非必填
        "roleIds": []  //可授权的角色列表  非必填
 *  }
 * 2：跳转/econfig/authplugin?operateId={operateId}
 */

import React from 'react';
import styled from 'styled-components';
import Proptypes from 'prop-types';
import { Button, message, Modal, Icon } from 'antd';
import { injectIntl } from 'react-intl';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { authServices } from 'src/service/authService';
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

@injectIntl
class AuthPlugin extends React.PureComponent {
    static propTypes = {
        appId: Proptypes.string.isRequired,
        selectedUsers: Proptypes.array,
        closeVolumeAuth: Proptypes.func,
        appName: Proptypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            operateData: {},
            roleList: [],
            departmentList: []
        };
        this.authTableRef = React.createRef();
    }

    async componentWillMount() {
        try {
            const roleList = await authServices.getRoleList(this.props.appId);
            const departmentList = await deptService.fetchDepartment();
            this.setState({
                roleList: roleList.filter(
                    item =>
                        item.needDepartment !== undefined &&
                        item.needDepartment === 0
                ),
                departmentList
            });
        } catch (error) {
            message.error(error.message);
        }
    }

    saveAuth = async () => {
        const {
            intl: { formatMessage }
        } = this.props;
        console.log(formatMessage);
        try {
            const { tableData } = this.authTableRef.current.state;
            /**
             * 保存时判断所有人员授权数据是否完整
             */
            // if (
            //     tableData.filter(
            //         item => !item.authData || !item.authData.length
            //     ).length > 0
            // ) {
            //     message.error(formatMessage(i18nMessages.ECONFIG_FRONT_A0631));
            // } else {
            await $http.post(urls.saveMemberAuth, {
                appId: this.props.appId,
                authBatchUserDtos: tableData,
                userIds: tableData.map(item => item.userId)
            });

            message.success(formatMessage(i18nMessages.ECONFIG_FRONT_A0261));
            setTimeout(() => {
                this.props.closeVolumeAuth(true);
            }, 200);
            // }
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
                this.props.closeVolumeAuth(false);
            }
        });
    };

    render() {
        const {
            intl: { formatMessage },
            selectedUsers,
            appId
        } = this.props;
        const {
            operateData,
            roleList,
            allRoleList,
            // siteList,
            departmentList
        } = this.state;
        if (selectedUsers && selectedUsers.length) {
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
                            <div className="title">{this.props.appName}</div>
                            <AuthTable
                                appId={appId}
                                formatMessage={formatMessage}
                                operateData={operateData}
                                selectedUsers={selectedUsers}
                                roleList={roleList}
                                departmentList={departmentList}
                                // siteList={siteList}
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
