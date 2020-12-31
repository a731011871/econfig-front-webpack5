import React from 'react';
import { Route, Switch } from 'react-router-dom';
import InvitePage from './invite';
import UserInfoPage from './userInfo';

class AuthUser extends React.PureComponent {
    render() {
        const { match } = this.props;
        return (
            <Switch>
                <Route
                    exact
                    path={`${match.path}/invite`}
                    component={InvitePage}
                />
                <Route
                    exact
                    path={`${match.path}/edit`}
                    component={UserInfoPage}
                />
            </Switch>
        );
    }
}

export default AuthUser;