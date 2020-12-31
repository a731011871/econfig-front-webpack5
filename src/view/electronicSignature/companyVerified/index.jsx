import React, { useState } from 'react';
import { Button, Icon, message } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { includes } from 'lodash';
import { i18nMessages } from 'src/i18n';
import VerifiedModal from 'src/component/verifiedModal';
import signLogo from 'assets/images/signLogo.png';

// import './index.less';

export default function CompanyVerified(props) {
    const { verifiedStatus, getCompanyVerifiedStatus, intl } = props;
    // const [verifiedStatus, setVerifiedStatus] = useState(false);
    const [verifiedUrl, setVerifiedUrl] = useState('');
    const [showVerifiedModal, setVerifiedModal] = useState(false);
    const { tenantName, userName } = JSON.parse(
        sessionStorage.getItem('sso_loginInfo') || '{}'
    );
    const verified = async () => {
        try {
            const result = await $http.post(urls.getVerifiedUrl, {
                enterpriseName: tenantName,
                userName
            });
            setVerifiedUrl(result.url);
            setVerifiedModal(true);
        } catch (error) {
            message.error(error.message);
        }
    };

    // const getStatus = async () => {
    //     try {
    //         const verifiedStatus = await $http.get(
    //             urls.getTenantVerifiedStatus,
    //             {
    //                 enterpriseName: tenantName
    //             }
    //         );
    //         setVerifiedStatus(verifiedStatus);
    //     } catch (error) {
    //         message.error(error.message);
    //     }
    // };

    // useEffect(() => {
    // getStatus();
    // verified();
    // }, []);

    return (
        <React.Fragment>
            {showVerifiedModal && (
                <VerifiedModal
                    intl={intl}
                    verifiedUrl={verifiedUrl}
                    visible={showVerifiedModal}
                    onClose={() => {
                        getCompanyVerifiedStatus();
                        setVerifiedModal(false);
                    }}
                />
            )}
            {includes(['1', '2'], verifiedStatus) ? (
                <div
                    className="sign-content electronic-signature-empty flexRow"
                    style={{ flexDirection: 'column' }}
                >
                    {verifiedStatus === '1' ? (
                        <img src={signLogo} width="142px" height="144px" />
                    ) : (
                        <Icon
                            type={
                                verifiedStatus === '1'
                                    ? 'check-circle'
                                    : 'exclamation-circle'
                            }
                            theme="filled"
                            style={{
                                color:
                                    verifiedStatus === '1'
                                        ? '#67C23A'
                                        : '#08acec',
                                fontSize: 40
                            }}
                        />
                    )}
                    <span
                        className="mTop18"
                        style={{
                            color: '#333',
                            lineHeight: '24px',
                            fontSize: 16
                        }}
                    >
                        {intl.formatMessage(
                            verifiedStatus === '1'
                                ? i18nMessages.ECONFIG_FRONT_A0738
                                : i18nMessages.ECONFIG_FRONT_A0780
                        )}
                    </span>

                    {verifiedStatus === '1' ? (
                        <span
                            className="mTop16 font14"
                            style={{
                                lineHeight: '21px',
                                color: '#606266'
                            }}
                        >
                            {intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0739
                            )}
                        </span>
                    ) : (
                        <Button
                            type="primary"
                            className="mTop12"
                            onClick={verified}
                        >
                            {intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0781
                            )}
                        </Button>
                    )}
                    {/* <a className="mTop32">关闭服务</a> */}
                </div>
            ) : (
                <div
                    className="sitn-content electronic-signature-empty flexRow"
                    style={{ flexDirection: 'column' }}
                >
                    <Button type="primary" onClick={verified}>
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0740)}
                    </Button>
                    <span
                        className="mTop16 Font14"
                        style={{
                            lineHeight: '21px',
                            color: '#606266'
                        }}
                    >
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0741)}
                    </span>
                </div>
            )}
        </React.Fragment>
    );
}
