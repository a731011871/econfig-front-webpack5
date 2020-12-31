import React from 'react';
import UserInfo from './userInfo/index';
import UserList from './userList';

export default class UserManagement extends React.Component {
    state = {
        showUserInfo: false,
        showUserList: true,
        activeMemberInfo: { userId: '' },
        searchObj: {
            pageNo: 1,
            pageSize: 50,
            keyWords: '',
            currentMenu: '1',
            enabled: '1'
        }
    };

    showUserInfo = activeMemberInfo => {
        this.setState({
            showUserInfo: true,
            showUserList: false,
            activeMemberInfo: activeMemberInfo || { email: '' },
            currentMenu: this.state.currentMenu
        });
    };

    showUserList = currentMenu => {
        this.setState({
            showUserInfo: false,
            showUserList: true,
            activeMemberInfo: { email: '' },
            currentMenu
        });
    };

    changeList = currentMenu => {
        this.setState({ currentMenu });
    };

    updateReset = userInfo => {
        this.setState({ activeMemberInfo: userInfo });
    };

    changeSearchObj = searchObj => {
        this.setState({ searchObj });
    };

    render() {
        return (
            <div className="Relative">
                {this.state.showUserList && (
                    <UserList
                        history={this.props.history}
                        changeSearchObj={this.changeSearchObj}
                        showUserInfo={this.showUserInfo}
                        changeList={this.changeList}
                        currentMenu={this.state.currentMenu}
                        searchObj={this.state.searchObj}
                    />
                )}
                {this.state.showUserInfo && (
                    <UserInfo
                        userInfo={this.state.activeMemberInfo}
                        currentMenu={this.state.currentMenu}
                        updateReset={this.updateReset}
                        showUserList={this.showUserList}
                    />
                )}
            </div>
        );
    }
}
