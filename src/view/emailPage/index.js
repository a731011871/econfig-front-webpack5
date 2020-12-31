
import React from 'react';
import { EmailPageContainer } from 'container/layout';
import urls, { getQueryString } from 'utils/urls';
import { $http } from 'utils/http';
import ExternalUserReg from './externalUserReg'; // 外部用户
import UserReg from './userReg'; // 内部用户
import Activation from './activation'; // 激活
import AdminReg from './adminReg';

import banner from 'assets/images/banner.jpg';

class EmailPage extends React.PureComponent {

    state = {
        isFailure: false,
        inviteFrom: 'outUser',
        userInfo: {}
    }

    /**
     * status 0:要注册 1:失效
     */
    async componentWillMount() {
        const url = window.location.href;
        const inviteId = getQueryString('inviteId', url) || '';
        const valid = getQueryString('valid', url) || '';
        localStorage.setItem('econfigLanguage', 'zh_CN');
        try{
            const result = await $http.get(urls.getInviteAndUserInfo, {
                inviteId,
                valid
            });
            this.setState({
                inviteFrom: result && (result.userStatus === '1') ? 'activation' : result.inviteFrom,
                isFailure: result.status === '1',
                userInfo: result || {}
            });
            if(result.status === '1') {
                document.title = '当前链接已失效!';
            }
        }catch(e) {
            // this.setState({
            //     isFailure: true
            // });
            document.title = '当前链接已失效!';
        }
    }

    render() {

        const { isFailure, inviteFrom, userInfo } = this.state;

        if(isFailure) {
            return (
                <EmailPageContainer>
                    <div className="email-page-banner" style={{backgroundImage: `url(${banner})`}} />
                    <div className="email-page-content">
                        <span>当前链接已失效!</span>
                    </div>
                </EmailPageContainer>
            );
        } else {
            return (
                <EmailPageContainer>
                    <div className="email-page-banner" style={{backgroundImage: `url(${banner})`}} />
                    <div className="email-page-content">
                        {
                            (inviteFrom === 'outUser' || inviteFrom === 'projectUser') ? <ExternalUserReg /> : null
                        }
                        {
                            inviteFrom === 'companyUser' ? <UserReg userInfo={userInfo} /> : null
                        }
                        {
                            inviteFrom === 'activation' ? <Activation {...this.props} /> : null
                        }
                        {
                            (inviteFrom === 'econfig' || inviteFrom === 'omp') ? <AdminReg userInfo={userInfo} {...this.props} /> : null
                        }
                    </div>
                </EmailPageContainer>
            );
        }

        
    }

}

export default EmailPage;