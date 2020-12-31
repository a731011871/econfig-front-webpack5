import React, { useState, useEffect } from 'react';
import { Button, Table, message, Modal } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { i18nMessages } from 'src/i18n';
import { includes } from 'lodash';
import SignUserModal from './signPersonModal';
import UsedSealModal from './usedSealModal';

// import './index.less';
const { confirm } = Modal;

export default function SignPerson(props) {
    const [signUserList, setSignUserList] = useState({ data: [], total: 0 });
    const [showUserModal, setUserModal] = useState(false);
    const [searchIndex, setSearchIndex] = useState(1);
    const [searchSize, setSearchSize] = useState(50);
    const [showUsedSealModal, setUsedSealModal] = useState(false);
    const [activeUser, setActiveUser] = useState({});
    const [sealList, setSealList] = useState([]);
    const { verifiedStatus, changeTab, intl } = props;

    const getSignUserList = async () => {
        try {
            const result = await $http.get(urls.signUserList, {
                pageIndex: searchIndex,
                pageSize: searchSize
            });
            setSignUserList(result || { data: [], total: 0 });
        } catch (error) {
            message.error(error.message);
        }
    };
    const deleteUser = userId => {
        confirm({
            title: (
                <span style={{ color: 'red' }}>
                    {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0767)}
                </span>
            ),
            okText: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0768),
            cancelText: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0281),
            onOk: async () => {
                try {
                    await $http.delete(
                        `${urls.changeSignUser}?userId=${userId}`
                    );
                    message.success(
                        intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0233)
                    );
                    getSignUserList();
                } catch (error) {
                    message.error(error.message);
                }
            }
        });
    };

    const showUsedSeal = async record => {
        try {
            const [allSealList, usedSealList] = await Promise.all([
                $http.get(urls.companySealList, {
                    pageIndex: 1,
                    pageSize: 9999
                }),
                $http.get(urls.userSealList, {
                    userId: record.userId,
                    pageIndex: 1,
                    pageSize: 9999
                })
            ]);
            const sealList = (allSealList?.data || [])
                .map(item => {
                    return {
                        ...item,
                        isChecked: includes(
                            (usedSealList?.data || []).map(
                                sealItem => sealItem.id
                            ),
                            item.id
                        )
                    };
                })
                .filter(item => item.status === 1 || item.isChecked);

            if (sealList.length > 0) {
                setSealList(sealList);
                setActiveUser(record);
                setUsedSealModal(true);
            } else {
                confirm({
                    centered: true,
                    title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0765),
                    content: (
                        <span style={{ fontSize: 14, color: '#606266' }}>
                            {intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0783
                            )}
                        </span>
                    ),
                    width: 400,
                    okText: intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0742
                    ),
                    cancelText: intl.formatMessage(
                        i18nMessages.ECONFIG_FRONT_A0784
                    ),
                    onOk: () => {
                        changeTab('2');
                    }
                });
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        if (verifiedStatus === '1') {
            getSignUserList();
        }
    }, [searchIndex, searchSize]);

    const columns = [
        {
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0769),
            dataIndex: 'userName',
            width: 200
            // render: text => <div style={{ minWidth: 200 }}>{text}</div>
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
            title: intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0030),
            width: 200,
            key: 'action',
            render: (text, record) => {
                console.log(record);
                return (
                    <div>
                        <a
                            className="mRight16"
                            onClick={() => showUsedSeal(record)}
                        >
                            {intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0765
                            )}
                        </a>
                        <a
                            onClick={() => {
                                deleteUser(record.userId);
                            }}
                        >
                            {intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0770
                            )}
                        </a>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="sign-content">
            {showUserModal && (
                <SignUserModal
                    intl={intl}
                    visible={showUserModal}
                    onOk={() => {
                        getSignUserList();
                        setUserModal(false);
                    }}
                    onClose={() => setUserModal(false)}
                />
            )}
            {showUsedSealModal && (
                <UsedSealModal
                    intl={intl}
                    activeUser={activeUser}
                    sealList={sealList}
                    setSealList={setSealList}
                    visible={showUsedSealModal}
                    onOk={() => {
                        setUsedSealModal(false);
                        setSealList([]);
                        getSignUserList();
                    }}
                    onClose={() => {
                        setUsedSealModal(false);
                        setSealList([]);
                    }}
                />
            )}
            {verifiedStatus === '1' && signUserList.data.length > 0 && (
                <div className="clearfix">
                    <Button
                        type="primary"
                        className="mBottom16 Right"
                        onClick={() => {
                            setUserModal(true);
                        }}
                    >
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0762)}
                    </Button>
                </div>
            )}
            {verifiedStatus === '1' ? (
                signUserList.data.length > 0 ? (
                    <Table
                        // rowSelection={rowSelection}
                        rowKey="id"
                        pagination={{
                            size: 'small',
                            total: signUserList.total || 0,
                            showSizeChanger: true,
                            defaultPageSize: 50,
                            current: searchIndex,
                            pageSize: searchSize,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: total =>
                                `${intl
                                    .formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0205
                                    )
                                    .replace('xx', total)}`,
                            // showTotal: total => <span>{`共${total}条`}</span>,
                            onChange: pageNo => {
                                setSearchIndex(pageNo);
                            },
                            onShowSizeChange: (pageNo, pageSize) => {
                                setSearchSize(pageSize);
                            }
                        }}
                        dataSource={signUserList.data || []}
                        columns={columns}
                    />
                ) : (
                    <div
                        className="electronic-signature-empty flexRow"
                        style={{ flexDirection: 'column' }}
                    >
                        <Button
                            type="primary"
                            onClick={() => setUserModal(true)}
                        >
                            {intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0771
                            )}
                        </Button>
                        <span
                            className="mTop16 Font14"
                            style={{
                                lineHeight: '21px',
                                color: '#606266'
                            }}
                        >
                            {intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0772
                            )}
                        </span>
                    </div>
                )
            ) : (
                <div
                    className="electronic-signature-empty flexRow"
                    style={{ flexDirection: 'column' }}
                >
                    <span
                        className="mBottom16 Font14"
                        style={{
                            lineHeight: '21px',
                            color: '#606266'
                        }}
                    >
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0779)}
                    </span>
                    <Button type="primary" onClick={() => changeTab('1')}>
                        {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0759)}
                    </Button>
                </div>
            )}
        </div>
    );
}
