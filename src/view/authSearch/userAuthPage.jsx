import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import OutUserInfo from '../userManagement/userInfo/index';
import DeptUserInfo from '../deptManagement/departmentMemberInfo/index';
import { i18nMessages } from '../../i18n';

class UserAuthPage extends React.PureComponent {
    static propTypes = {
        userId: PropTypes.string,
        hideAuthPage: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            userInfo: {},
        };
    }

    async componentWillMount() {
        try {
            const userInfo = await $http.get(
                `${urls.getMemberInfo}?userId=${
                    this.props.userId
                }`
            );
            if(userInfo.userProperty === 'PersonalUser') {
                message.error(this.props.intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0629));
            }
            this.setState({ userInfo });
        } catch (e) {
            message.error(e.message);
        }
    }

    updateReset = (userInfo) => {
        this.setState({ userInfo });
    };

    goBack = (isDelete) => { // 如果是删除以后返回列表，需要重新获取人员列表
        this.props.hideAuthPage(isDelete);
    }

    render() {
        const { userProperty } = this.state.userInfo;
        if (userProperty === 'CompanyUser' || userProperty === 'TMUser') {
            return (
                <DeptUserInfo
                    {...this.props}
                    type="edit"
                    fromAuthSearch
                    goBack={this.goBack}
                />
            );
        } else if (userProperty === 'OutUser' && this.state.userInfo.email) {
            return (
                <OutUserInfo
                    userInfo={this.state.userInfo}
                    showUserList={() => {}}
                    updateReset={this.updateReset}
                    goBack={this.goBack}
                    fromAuthSearch
                />
            );
        }
        return null;
    }
}

export default UserAuthPage;
