import React from 'react';
import { Switch, Route } from 'react-router-dom';
import DepartmentPage from './departmentPage';
import DepartmentMemberInfo from './departmentMemberInfo';

class Department extends React.Component {
    render() {
        const { match } = this.props;
        return (
            <Switch>
                <Route path={match.path} exact component={DepartmentPage} />
                <Route
                    path={`${match.path}/new/:departmentId`}
                    render={props => {
                        return (
                            <DepartmentMemberInfo
                                {...props}
                                type="new"
                            />
                        );
                    }}
                />
                <Route
                    path={`${match.path}/edit/:departmentId/:userId`}
                    render={props => {
                        return (
                            <DepartmentMemberInfo
                                {...props}
                                type="edit"
                            />
                        );
                    }}
                />
            </Switch>
        );
    }
}

export default Department;
