
import React from 'react';
import { Switch , Route } from 'react-router-dom';
import Active from './active';
import Forword from './forword';

class Activation extends React.PureComponent {

    
    componentWillMount() {

    }

    render() {
        const {match} = this.props;
        
        return (
            <React.Fragment>
                <Switch>
                    <Route path={match.path} exact component={Active} />
                    <Route
                        path={`${match.path}/forword`}
                        render={props => {
                            return <Forword {...props} />;
                        }}
                    />
                </Switch>
            </React.Fragment>
            
        );
    }

}

export default Activation;