import React from 'react';
import { Switch, Route } from 'react-router-dom';
// import UserAuthPage from './userAuthPage';
import UserList from './userList';

//project/list
class AuthorizationTrace extends React.Component {
    render() {
        const { match } = this.props;
        return (
            <Switch>
                <Route path={`${match.path}`} exact component={UserList} />
                {/* <Route
                    path={`${match.path}/:userId`}
                    component={UserAuthPage}
                /> */}
            </Switch>
        );
    }
}

export default AuthorizationTrace;
