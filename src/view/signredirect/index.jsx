import React from 'react';
import { Icon } from 'antd';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

const SignRedirect = props => {
    const { intl } = props;
    return (
        <div
            className="sign-content electronic-signature-empty flexRow"
            style={{
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Icon
                type="check-circle"
                theme="filled"
                style={{
                    color: '#67C23A',
                    fontSize: 40
                }}
            />
            <span
                className="mTop18"
                style={{
                    color: '#333',
                    lineHeight: '24px',
                    fontSize: 16
                }}
            >
                {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0738)}
            </span>

            <span
                className="mTop16 font14"
                style={{
                    lineHeight: '21px',
                    color: '#606266'
                }}
            >
                {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0739)}
            </span>
        </div>
    );
};

export default injectIntl(SignRedirect);
