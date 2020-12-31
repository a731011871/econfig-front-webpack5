import React from 'react';

import { Switch, Route } from 'react-router-dom';
import ProjectPage from './projectPage';
import ProjectCenter from './projectCenter';
import ProjectDetail from './projectDetail';
import ProjectStoreroom from './projectStoreroom';
import ProjectAuthPage from './projectDetail/userManage/projectAuthPage';

class ProjectManage extends React.Component {
    render() {
        const { match } = this.props;
        return (
            <Switch>
                <Route path={match.path} exact component={ProjectPage} />
                <Route
                    path={`${match.path}/center/:appId/:id`}
                    render={props => {
                        return <ProjectCenter {...props} />;
                    }}
                />
                <Route
                    path={`${match.path}/project/:type/:id/:appId`}
                    exact
                    render={props => {
                        return <ProjectDetail {...props} />;
                    }}
                />
                <Route
                    path={`${
                        match.path
                    }/project/:type/:id/:appId/authUser/:type/:userId`}
                    render={props => {
                        return <ProjectAuthPage {...props} />;
                    }}
                />
                <Route
                    path={`${match.path}/storeroom/:appId/:id`}
                    render={props => {
                        return <ProjectStoreroom {...props} />;
                    }}
                />
            </Switch>
        );
    }
}

export default ProjectManage;
