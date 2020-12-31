import React, { useState, useEffect } from 'react';
import { Select, Modal, message, Icon } from 'antd';
import { debounce } from 'lodash';
import { $http } from 'utils/http';
import urls from 'utils/urls';
import { i18nMessages } from 'src/i18n';
import styled from 'styled-components';

// const formItemLayout = {
//     labelCol: {
//         xs: { span: 5 },
//         sm: { span: 5 }
//     },
//     wrapperCol: {
//         xs: { span: 15 },
//         sm: { span: 15 }
//     }
// };

const IconBox = styled(Icon)`
    &:hover {
        background: #46b1ed;
        color: #fff;
        border-radius: 50%;
    }
`;

const SignPersonModal = props => {
    const { visible, onClose, onOk, intl } = props;
    const [selectUsers, setSelectUsers] = useState([]);
    const [userList, setUserList] = useState([]);

    const getUserList = debounce(async (value = '') => {
        try {
            const userList = await $http.post(urls.getAllCompanyUsers, {
                pageIndex: 1,
                pageSize: 20,
                status: '1',
                enabled: '1',
                userPropertys: ['CompanyUser', 'TMUser'],
                keyWord: value || ''
            });
            setUserList(userList || []);
        } catch (e) {
            message.error(e.message);
        }
    }, 500);

    const onSubmit = async () => {
        try {
            if (selectUsers.length > 0) {
                await $http.post(urls.changeSignUser, selectUsers);
                message.success(
                    intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0262)
                );
                onOk();
            } else {
                message.error(
                    intl
                        .formatMessage(i18nMessages.ECONFIG_FRONT_A0325)
                        .replace(
                            'xxx',
                            intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0769)
                        )
                );
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        getUserList();
    }, []);
    return (
        <Modal
            title={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0762)}
            visible={visible}
            width={700}
            okText={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0279)}
            cancelText={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0281)}
            onOk={onSubmit}
            onCancel={onClose}
        >
            <span
                className="Block mBottom16"
                style={{
                    color: '#606266'
                }}
            >
                {intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0763)}
            </span>
            <Select
                style={{ width: '100%' }}
                showSearch
                allowClear
                mode="multiple"
                maxTagCount={3}
                value={selectUsers.map(item => item.userId)}
                // maxTagPlaceholder={values =>
                // `等${values.length}人`
                // }
                filterOption={false}
                placeholder={intl.formatMessage(
                    i18nMessages.ECONFIG_FRONT_A0648
                )}
                // onFocus={getUserList}
                // onBlur={() => {
                //     setUserList([]);
                // }}
                onSearch={getUserList}
                onChange={(values, options) => {
                    setSelectUsers(options.map(item => item.props));
                }}
            >
                {userList.map(item => (
                    <Select.Option
                        userId={item.userId}
                        accountId={item.accountId}
                        userName={
                            item.userName && item.accountName
                                ? `${item.userName}（${item.accountName}）`
                                : item.userName || item.accountName
                        }
                        title={
                            item.userName && item.accountName
                                ? `${item.userName}（${item.accountName}）`
                                : item.userName || item.accountName
                        }
                        key={item.userId}
                    >
                        {/* {`${item.userName}(${item.accountName})`} */}
                        {item.userName && item.accountName
                            ? `${item.userName}（${item.accountName}）`
                            : item.userName || item.accountName}
                    </Select.Option>
                ))}
            </Select>
            {selectUsers.length > 0 && (
                <div
                    className="mTop16"
                    style={{
                        width: '100%',
                        border: '1px solid #EDF0F6',
                        padding: 10,
                        paddingBottom: 0
                    }}
                >
                    {selectUsers.map(item => (
                        <div
                            key={item.userId}
                            className="pointer InlineBlock"
                            style={{
                                background: 'rgba(70, 177, 237, 0.08)',
                                color: '#46B1ED',
                                lineHeight: '20px',
                                marginRight: 10,
                                marginBottom: 10,
                                padding: '5px 10px'
                            }}
                        >
                            <span key={item.userId}>{item.title}</span>
                            <IconBox
                                type="close"
                                onClick={() => {
                                    setSelectUsers(
                                        selectUsers.filter(
                                            userItem =>
                                                userItem.userId !== item.userId
                                        )
                                    );
                                }}
                                style={{ fontSize: 12, marginLeft: 6 }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default SignPersonModal;
