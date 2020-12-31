import React, { useState, useEffect } from 'react';
import { Form, Button, Table, message, Modal } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { i18nMessages } from 'src/i18n';
import SealForm from './sealForm';

const { confirm } = Modal;

const CorporateSeal = props => {
    console.log(props);
    const { intl } = props;
    // const tenantName =
    //     JSON.parse(sessionStorage.getItem('sso_loginInfo') || '{}')
    //         .tenantName || '';
    const { changeTab, verifiedStatus } = props;
    const [sealList, setSealList] = useState([]);
    const [showSealForm, setSearlForm] = useState(false);
    const [sealInfo, setSealInfo] = useState({});
    // const [verifiedStatus, setVerifiedStatus] = useState(false);

    const getCompanySealList = async () => {
        try {
            const sealList =
                (
                    await $http.get(urls.companySealList, {
                        pageIndex: 1,
                        pageSize: 9999
                    })
                )?.data || [];
            setSealList(sealList);
        } catch (e) {
            message.error(e.message);
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
    //         if (verifiedStatus === '1') {
    //             getCompanySealList();
    //         }
    //         setVerifiedStatus(verifiedStatus);
    //     } catch (error) {
    //         message.error(error.message);
    //     }
    // };

    const invalidSeal = sealId => {
        confirm({
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0757),
            content: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0747),
            width: 400,
            okType: 'danger',
            okText: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279),
            cancelText: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0281),
            onOk: async () => {
                try {
                    await $http.delete(`${urls.invalidSeal}?sealId=${sealId}`);
                    message.success(
                        intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0748)
                    );
                    getCompanySealList();
                } catch (error) {
                    message.error(error.message);
                }
            }
        });
    };

    useEffect(() => {
        // getStatus();
        if (verifiedStatus === '1') {
            getCompanySealList();
        }
    }, []);

    const columns = [
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0749),
            dataIndex: 'url',
            width: 200,
            render: text => (
                <img src={text || ''} alt="" width="56px" height="42px" />
            )
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0743),
            dataIndex: 'name',
            width: 200
            // render: text => <div>{text}</div>
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0750),
            width: 200,
            dataIndex: 'createByName'
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0751),
            width: 200,
            dataIndex: 'createTime'
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0752),
            width: 200,
            dataIndex: 'updateByName'
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0753),
            width: 200,
            dataIndex: 'updateTime'
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0754),
            width: 200,
            dataIndex: 'status',
            render: text => {
                return (
                    <span style={{ color: text === 1 ? '#606266' : '#909399' }}>
                        {text === 1
                            ? intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0755
                              )
                            : intl.formatMessage(
                                  i18nMessages.ECONFIG_FRONT_A0756
                              )}
                    </span>
                );
            }
        },
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0030),
            width: 200,
            key: 'action',
            render: (text, record) => {
                return (
                    <div>
                        {record.status === 1 ? (
                            <a
                                className="mRight16"
                                onClick={() => {
                                    setSearlForm(true);
                                    setSealInfo(record);
                                }}
                            >
                                {intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0098
                                )}
                            </a>
                        ) : (
                            <span
                                style={{ color: '#909399' }}
                                className="mRight16"
                            >
                                {intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0098
                                )}
                            </span>
                        )}
                        {record.status === 1 ? (
                            <a onClick={() => invalidSeal(record.id)}>
                                {intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0757
                                )}
                            </a>
                        ) : (
                            <span style={{ color: '#909399' }}>
                                {intl.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0757
                                )}
                            </span>
                        )}
                    </div>
                );
            }
        }
    ];

    return verifiedStatus === '1' ? (
        <div className="sign-content">
            {showSealForm && (
                <SealForm
                    intl={intl}
                    visible={showSealForm}
                    sealInfo={sealInfo}
                    onClose={() => {
                        setSearlForm(false);
                        getCompanySealList();
                    }}
                />
            )}
            {sealList.length > 0 ? (
                <div className="clearfix">
                    <Button
                        type="primary"
                        className="mBottom16 Right"
                        onClick={() => {
                            setSealInfo({});
                            setSearlForm(true);
                        }}
                    >
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0742)}
                    </Button>
                </div>
            ) : null}

            {sealList.length > 0 ? (
                <Table
                    // rowSelection={rowSelection}
                    rowKey="id"
                    pagination={false}
                    // pagination={{
                    //     size: 'small',
                    //     current: this.state.searchObj.pageIndex,
                    //     pageSize: this.state.searchObj.pageSize,
                    //     total: this.props.departmentMember.total || 0,
                    //     showSizeChanger: true,
                    //     showQuickJumper: true,
                    //     pageSizeOptions: ['10', '20', '50', '100'],
                    //     defaultPageSize: 50,
                    //     showTotal: total =>
                    //         `${this.props.intl
                    //             .formatMessage(
                    //                 i18nMessages.ECONFIG_FRONT_A0205
                    //             )
                    //             .replace('xx', total)}`,
                    //     onChange: (pageIndex, pageSize) => {
                    //         this.fetchMember(
                    //             {
                    //                 ...this.state.searchObj,
                    //                 pageIndex,
                    //                 pageSize
                    //             },
                    //             true
                    //         );
                    //     },
                    //     onShowSizeChange: (pageIndex, pageSize) => {
                    //         this.fetchMember({
                    //             ...this.state.searchObj,
                    //             pageIndex,
                    //             pageSize
                    //         });
                    //     }
                    // }}
                    dataSource={sealList || []}
                    columns={columns}
                />
            ) : (
                <div
                    className="electronic-signature-empty flexRow"
                    style={{ flexDirection: 'column' }}
                >
                    <Button
                        type="primary"
                        onClick={() => {
                            setSealInfo({});
                            setSearlForm(true);
                        }}
                    >
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0742)}
                    </Button>
                    <span
                        className="mTop16 Font14"
                        style={{
                            lineHeight: '21px',
                            color: '#606266'
                        }}
                    >
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0782)}
                    </span>
                </div>
            )}
        </div>
    ) : (
        <div
            className="sign-content electronic-signature-empty flexRow"
            style={{ flexDirection: 'column' }}
        >
            <span
                className="mBottom16 Font14"
                style={{
                    lineHeight: '21px',
                    color: '#606266'
                }}
            >
                {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0758)}
            </span>
            <Button type="primary" onClick={() => changeTab('1')}>
                {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0759)}
            </Button>
        </div>
    );
};

export default Form.create()(CorporateSeal);
