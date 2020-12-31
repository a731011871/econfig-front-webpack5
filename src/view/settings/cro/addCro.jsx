import React from 'react';
// import { Tag } from 'antd';
// import CroCh from './croCh';
// import CroEn from './croEn';
// import { i18nMessages } from 'src/i18n';
import CroInfo from './croInfo';

// const { CheckableTag } = Tag;

class AddCro extends React.Component {
    state = {
        checked: 'ch'
    };

    handleChange = checked => {
        this.setState({ checked });
    };

    render() {
        const { checked } = this.state;
        // const { formatMessage } = this.props.intl;
        // const { ECONFIG_FRONT_A0681, ECONFIG_FRONT_A0682 } = i18nMessages;
        return (
            <div>
                {/* <div>
                    <CheckableTag
                        checked={this.state.checked === 'ch'}
                        onChange={() => this.handleChange('ch')}
                    >
                        {formatMessage(ECONFIG_FRONT_A0681)}
                    </CheckableTag>
                    <CheckableTag
                        checked={this.state.checked === 'en'}
                        onChange={() => this.handleChange('en')}
                    >
                        {formatMessage(ECONFIG_FRONT_A0682)}
                    </CheckableTag>
                </div>
                <br /> */}
                {/* { this.state.checked === 'ch' && <CroCh intl={this.props.intl} /> }
                { this.state.checked === 'en' && <CroEn intl={this.props.intl} /> } */}
                <CroInfo
                    intl={this.props.intl}
                    languagetType={checked}
                    getCroList={this.props.getCroList}
                    croInfo={this.props.croInfo}
                    onClose={this.props.onClose}
                />
            </div>
        );
    }
}

export default AddCro;
