import React, { useEffect } from 'react';
import { Modal, message, List, Switch } from 'antd';
import { $http } from 'utils/http';
import urls from 'utils/urls';
// import { includes } from 'lodash';
import styled from 'styled-components';
import { i18nMessages } from 'src/i18n';

const MetaBox = styled(List.Item.Meta)`
    .ant-list-item-meta-title {
        margin-bottom: 0 !important;
        line-height: 42px;
        max-width: 520px;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const UsedSealModal = props => {
    const {
        visible,
        onClose,
        onOk,
        intl,
        activeUser,
        sealList,
        setSealList
    } = props;
    // const [sealList, setSealList] = useState([]);
    // const [loading, setLoading] = useState(true);

    // const getSealList = async () => {
    //     try {
    //         const [sealList, usedSealList] = await Promise.all([
    //             $http.get(urls.companySealList, {
    //                 pageIndex: 1,
    //                 pageSize: 9999
    //             }),
    //             $http.get(urls.userSealList, {
    //                 userId: activeUser.userId,
    //                 pageIndex: 1,
    //                 pageSize: 9999
    //             })
    //         ]);
    //         console.log(sealList, usedSealList);
    //         setSealList(
    //             (sealList?.data || [])
    //                 .map(item => {
    //                     return {
    //                         ...item,
    //                         isChecked: includes(
    //                             (usedSealList?.data || []).map(
    //                                 sealItem => sealItem.id
    //                             ),
    //                             item.id
    //                         )
    //                     };
    //                 })
    //                 .filter(item => item.status === 1 || item.isChecked)
    //         );
    //     } catch (e) {
    //         message.error(e.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const changeUsedSeal = checkedSeal => {
        setSealList(
            sealList.map(item => {
                return {
                    ...item,
                    isChecked:
                        checkedSeal.id === item.id
                            ? !checkedSeal.isChecked
                            : item.isChecked
                };
            })
        );
    };

    const onSubmit = async () => {
        try {
            const usedSealList = sealList.filter(item => item.isChecked);
            await $http.post(urls.saveUserSeal, {
                user: {
                    accountId: activeUser.accountId,
                    userId: activeUser.userId,
                    userName: activeUser.userName
                },
                sealId: usedSealList.map(item => item.id)
            });
            message.success(
                intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0764)
            );
            onOk();
        } catch (error) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        // getSealList();
    }, []);
    return (
        <Modal
            title={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0765)}
            visible={visible}
            width={700}
            okText={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279)}
            cancelText={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0281)}
            onOk={onSubmit}
            onCancel={onClose}
        >
            <div
                style={{
                    lineHeight: '17px',
                    fontSize: 12,
                    color: '#909399',
                    marginBottom: 24
                }}
            >
                {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0766)}
            </div>
            <List
                dataSource={sealList}
                style={{ maxHeight: 402, overflowY: 'auto' }}
                renderItem={item => (
                    <List.Item key={item.id}>
                        <MetaBox
                            avatar={
                                <img
                                    src={item.url}
                                    width="56px"
                                    height="42px"
                                />
                            }
                            title={item.name}
                        />
                        <div>
                            <Switch
                                checked={item.isChecked}
                                onChange={() => changeUsedSeal(item)}
                            />
                        </div>
                    </List.Item>
                )}
            >
                {/* {loading && <Spin />} */}
            </List>
        </Modal>
    );
};

export default UsedSealModal;
