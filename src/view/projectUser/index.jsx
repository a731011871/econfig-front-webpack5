import React from 'react';
import UserInfo from './userInfo/index';
import UserList from './userList';

export default class projectUser extends React.Component {
    state = {
        showUserInfo: false,
        showUserList: true,
        activeMemberInfo: { userId: '' }
    };

    showUserInfo = activeMemberInfo => {
        this.setState({
            showUserInfo: true,
            showUserList: false,
            activeMemberInfo: activeMemberInfo || { email: '' },
            currentMenu: this.state.currentMenu
        });
    };

    showUserList = (currentMenu) => {
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

    updateReset = (userInfo) => {
        this.setState({ activeMemberInfo: userInfo });
    }

    render() {
        return (
            <div className="Relative">
                {this.state.showUserList && (
                    <UserList showUserInfo={this.showUserInfo} changeList={this.changeList} currentMenu={this.state.currentMenu}/>
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
