/*
 * @Author: lei.zhao
 * @Date: 2020-07-06 11:17:29
 * @LastEditTime: 2020-07-09 16:14:33
 * @LastEditors: lei.zhao
 * @Description: 授权查询组件，以Modal的形式调用。
 * @params: {
 *     intl: object，国际化参数（必须），
 *     defaultSearchParams: { // 带入的查询信息
 *         roleInfo: { key: roleId, value: roleName },
 *         projectInfo: {
 *             key: projectId,
 *             label: item.projectSerialNo ? `【${item.projectSerialNo}】${item.projectName}` : item.projectName
 *         },
 *         userInfo: {
 *             key: userId,
 *             label: item.userName && item.accountName ? `${item.userName}${`（${item.accountName}）`}` : item.userName || item.accountName
 *         },
 *         siteInfo: { key: siteId, label: siteName }
 *     },
 *     appId: PropTypes.string.isRequired,
 *     onCancel: PropTypes.func.isRequired
 * }
 * @FilePath: /econfig-front/src/component/authSearchComponent/index.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Modal } from 'antd';
import AuthSearch from 'src/view/authSearch/userList';
import { i18nMessages } from '../../i18n';

const ModalBox = styled(Modal)`
    .ant-modal-content {
        height: 100%;
        .ant-modal-body{
            overflow: scroll;
            height: calc(100% - 55px);
        }
    }
`;

function AuthSearchComponent(props) {
    const {
        intl,
        appId = '',
        onCancel,
        visible,
        defaultSearchParams = {}
    } = props;
    return (
        <ModalBox
            width="100%"
            style={{ position: 'fixed', padding: 0, top: 0, bottom: 0 }}
            title={intl.formatMessage(i18nMessages.ECONFIG_FRONT_A0466)}
            visible={visible}
            footer={null}
            onCancel={onCancel}
        >
            <AuthSearch
                {...props}
                defaultSearchParams={{ appId, ...defaultSearchParams }}
            />
        </ModalBox>
    );
}

AuthSearchComponent.propTypes = {
    intl: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    defaultSearchParams: PropTypes.object,
    appId: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default withRouter(AuthSearchComponent);
