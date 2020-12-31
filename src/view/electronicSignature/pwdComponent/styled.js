/*
 * @Author: lei.zhao
 * @Date: 2020-12-03 16:31:19
 * @LastEditTime: 2020-12-03 18:15:36
 * @LastEditors: lei.zhao
 * @Description:
 * @FilePath: /lib-template-browser/packages/pwdComponent/src/styled.ts
 */
import styled from 'styled-components';
import { Modal } from 'antd';

export const ModalBox = styled(Modal)`
    .ant-modal-content {
        border-radius: 0 !important;
    }
    .ant-modal-header {
        padding: 16px 24px;
        .ant-modal-title {
            line-height: 18px;
            font-size: 18px;
            font-weight: normal;
        }
    }
    .desc {
        line-height: 17px;
        font-size: 12px;
        color: #909399;
        margin-bottom: 24px;
    }
    .ant-modal-body {
        padding: 16px 24px 24px 24px;
    }
    .ant-modal-footer {
        border-top: 0;
    }
    button {
        border-radius: 0;
    }
`;
