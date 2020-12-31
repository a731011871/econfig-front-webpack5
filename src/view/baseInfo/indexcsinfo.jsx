import React from 'react';
import { UserInformation } from '@tms/tenant-user-information';
import { getCurrentLanguage } from 'utils/utils';

class Test extends React.Component {
    render() {
        return (
            <div style={{ background: '#fff', width: '100%', height: '100%' }}>
                <UserInformation language={getCurrentLanguage()} />
            </div>
        );
    }
}

export default Test;
