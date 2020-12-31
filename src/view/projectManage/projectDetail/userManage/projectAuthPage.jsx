import React from 'react';
// import PropTypes from 'prop-types';
import { message } from 'antd';
import { getQueryString } from 'utils/urls';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import ProjectUserInfo from '../../../projectUser/userInfo/index';
import OutUserInfo from '../../../userManagement/userInfo/index';
import DeptUserInfo from '../../../deptManagement/departmentMemberInfo/index';

class ProjectAuthPage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
        this.state = {
            userInfo: { email: '', userId: '' },
        };
    }

    async componentWillMount() {
        try {
            let userInfo = {};
            const userProperty = getQueryString(
                'userProperty',
                window.location.search
            );
            if (userProperty === 'OutUser') {
                userInfo = await $http.get(
                    `${urls.getMemberInfo}?userId=${
                        this.props.match.params.userId
                    }`
                );
                this.setState({ userInfo });
            }
        } catch (e) {
            message.error(e.message);
        }
    }

    updateReset = (userInfo) => {
        this.setState({ userInfo });
    };

    render() {
        const type = this.props.match.params.type;
        const userId = this.props.match.params.userId;
        const userProperty = getQueryString(
            'userProperty',
            window.location.search
        );
        console.log('type', type);
        console.log('props', this.props);
        //userId===0  项目管理员邀请项目人员
        if (userId === '0') {
            return (
                <ProjectUserInfo
                    appId={this.props.match.params.appId}
                    type="edit"
                    userInfo={{ email: '' }}
                    fromProjectManage
                    isInvite
                    projectId={this.props.match.params.id}
                    goBack={this.props.history.goBack}
                />
            );
        } else if (userProperty === 'CompanyUser' || userProperty === 'TMUser') {
            return (
                <DeptUserInfo
                    {...this.props}
                    type="edit"
                    fromProjectManage
                    isInvite={type === 'invite'}
                    projectId={this.props.match.params.id}
                />
            );
        } else if (userProperty === 'OutUser' && this.state.userInfo.userId) {
            return (
                <OutUserInfo
                    userInfo={this.state.userInfo}
                    showUserList={() => {}}
                    updateReset={this.updateReset}
                    goBack={this.props.history.goBack}
                    fromProjectManage
                    appId={this.props.match.params.appId}
                    isInvite={type === 'invite'}
                    projectId={this.props.match.params.id}
                />
            );
        }
        return null;
    }
}

export default ProjectAuthPage;
