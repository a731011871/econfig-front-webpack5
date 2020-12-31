
import React from 'react';
import EmailValidate from './emailValidate';
import PhoneValidate from './phoneValidate';

class Forword extends React.PureComponent {

    state = {
        activeType: 'email',
    }

    onTabClick = (activeType) => {
        this.setState({
            activeType
        });
    }

    render() {
        const { activeType } = this.state;

        return (
            <React.Fragment>
                <div className="email-page-content-con">
                    <div className="email-page-content-tab">
                        <a className={activeType === 'email' ? 'active' : ''} onClick={() => this.onTabClick('email')} >邮箱验证</a>
                        <a className={activeType === 'phone' ? 'active' : ''} onClick={() => this.onTabClick('phone')} >手机验证</a>
                    </div>
                    <div className="email-page-content-x"><a onClick={() => { this.props.history.goBack(); }}>返回</a></div>
                </div>
                <div className="email-page-content-form">
                    {
                        activeType === 'email' ? <EmailValidate goBack={this.props.history.goBack} /> : null
                    }
                    {
                        activeType === 'phone' ? <PhoneValidate goBack={this.props.history.goBack} /> : null
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default Forword;