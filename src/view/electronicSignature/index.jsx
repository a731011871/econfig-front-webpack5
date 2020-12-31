import React, { useState, useEffect } from 'react';
import { Tabs, Button, message, Spin } from 'antd';
import styled from 'styled-components';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import electronic_signature from 'assets/images/electronic_signature.png';
import CompanyVerified from './companyVerified';
import SignPerson from './signPerson';
import CorporateSeal from './corporateSeal';
import PwdComponent from './pwdComponent';
import { injectIntl } from 'react-intl';
import { i18nMessages } from 'src/i18n';

const { TabPane } = Tabs;
const TabBox = styled(Tabs)`
    display: flex;
    height: 100%;
    flex-direction: column;
    .ant-tabs-top-content {
        flex: 1;
    }
    .ant-tabs-content {
        height: calc(100% - 61px);
        .ant-tabs-tabpane .sign-content {
            height: 100%;
        }
        .ant-table-wrapper {
            height: calc(100% - 48px);
            overflow-y: auto;
        }
    }
`;

import './index.less';

const ElectronicSignature = props => {
    const { intl } = props;
    const [serviceStatus, setServiceStatus] = useState(false);
    const [verifiedStatus, setVerifiedStatus] = useState(false);
    const [showPwd, setPwd] = useState(false);
    const [tabCode, setTabCode] = useState('1');
    const [loading, setLoading] = useState(true);
    const tenantName =
        JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}')
            .tenantName || '';
    const getCompanyVerifiedStatus = async () => {
        try {
            const verifiedStatus = await $http.get(
                urls.getTenantVerifiedStatus,
                {
                    enterpriseName: tenantName
                }
            );
            setVerifiedStatus(verifiedStatus);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const searchServiceStatus = async () => {
        try {
            const data = await $http.get(urls.serviceStatus);
            setServiceStatus(data);
            if (data) {
                getCompanyVerifiedStatus();
            } else {
                setLoading(false);
            }
        } catch (error) {
            message.error(error.message);
            setLoading(false);
        }
    };

    const offOnService = async () => {
        try {
            await $http.post(urls.offOnService, {
                signSwitch: true
            });
            setServiceStatus(true);
            setPwd(false);
            message.success(
                intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0773)
            );
        } catch (error) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        searchServiceStatus();
    }, []);

    const OpenSign = () => {
        setPwd(true);
    };

    // if (data) {
    //     return (
    //         <div className="electronic-signature-empty">
    //             <img src={electronic_signature} />
    //             <span className="title">电子签名服务</span>
    //             <span className="v">v1.0</span>
    //             <span className="desc">
    //                 根据《电子签名法》相关要求，企业完成实名后才能正常使用电子签名服务。
    //             </span>
    //             <Button type="primary" onClick={OpenSign}>
    //                 免费开通
    //             </Button>
    //         </div>
    //     );
    // }

    return loading ? (
        <Spin
            style={{
                position: 'absolute',
                width: 28,
                height: 28,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                margin: 'auto'
            }}
        />
    ) : (
        <div style={{ width: '100%', height: '100%' }}>
            <PwdComponent
                {...props}
                visible={showPwd}
                onClose={() => setPwd(false)}
                onOk={offOnService}
            />
            {!serviceStatus ? (
                <div className="electronic-signature-empty">
                    <img src={electronic_signature} />
                    <span className="title">电子签名服务</span>
                    <span className="v">v1.0</span>
                    <span className="desc">
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0774)}
                    </span>
                    <Button type="primary" onClick={OpenSign}>
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0775)}
                    </Button>
                </div>
            ) : (
                <TabBox
                    activeKey={tabCode}
                    className="pAll10"
                    onChange={setTabCode}
                >
                    <TabPane
                        tab={intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0776
                        )}
                        key="1"
                    >
                        <CompanyVerified
                            {...props}
                            verifiedStatus={verifiedStatus}
                            getCompanyVerifiedStatus={getCompanyVerifiedStatus}
                        />
                    </TabPane>
                    <TabPane
                        tab={intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0777
                        )}
                        key="2"
                    >
                        <CorporateSeal
                            {...props}
                            verifiedStatus={verifiedStatus}
                            changeTab={setTabCode}
                        />
                    </TabPane>
                    <TabPane
                        tab={intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0778
                        )}
                        key="3"
                    >
                        <SignPerson
                            {...props}
                            verifiedStatus={verifiedStatus}
                            changeTab={setTabCode}
                        />
                    </TabPane>
                </TabBox>
            )}
        </div>
    );
};

export default injectIntl(ElectronicSignature);
