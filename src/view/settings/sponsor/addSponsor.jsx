import React from 'react';
// import { Tag } from 'antd';
// import { i18nMessages } from 'src/i18n';
import SponsorInfo from './sponsorInfo';

// const { CheckableTag } = Tag;

class AddSponsor extends React.Component {
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
                <SponsorInfo
                    intl={this.props.intl}
                    languagetType={checked}
                    getSponsorList={this.props.getSponsorList}
                    sponsorInfo={this.props.sponsorInfo}
                    onClose={this.props.onClose}
                />
            </div>
        );
    }
}

export default AddSponsor;
