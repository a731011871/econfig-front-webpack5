import React from 'react';
import PassWord from './password';
import Pin from './pin';

class Safety extends React.Component {


    render() {
        return (
            <React.Fragment>
                <PassWord />
                <Pin />
            </React.Fragment>
        );
    }
}

export default Safety;