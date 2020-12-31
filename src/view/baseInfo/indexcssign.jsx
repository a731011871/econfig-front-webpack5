import React from 'react';
// import { UserInformation } from '@tms/tenant-user-information';
// import Verified from '@tms/tenant-verified';
import { getCurrentLanguage } from 'utils/utils';
import { MicroApp } from '@tms/micro-front';
// import TmsLogin from '@tms/login-component';

// const VerifiedCreator = MicroApp({
//     name: 'tenant-verified',
// });

const TmsLogin = MicroApp({
    name: 'login-component',
});

class Test extends React.Component {
    render() {
        return (
            <div style={{ background: '#eee', width: '100%', height: '100%', display: 'flex', justifyContent: 'center'}}>
                {/* <UserInformation language={getCurrentLanguage()} /> */}
                {/* <Verified language={getCurrentLanguage()}/> */}
                {/* <VerifiedCreator language={getCurrentLanguage()} /> */}
                <div style={{padding: '50px', backgroundColor: '#fff', height: '475px'}}>
                    <TmsLogin 
                        language={getCurrentLanguage()}
                        isWechat={true}
                        loginType={[1,2]} 
                        callback={() => {
                            alert('登录成功!');
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default Test;
