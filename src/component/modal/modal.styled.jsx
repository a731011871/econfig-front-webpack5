import styled from 'styled-components';

export const ModalContent = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    background-color: ${item => {
        return item.title ? '#fff' : '#f9f9f9';
    }};
    z-index: ${item => {
        return item.zIndex || 999;
    }};
    padding-top: ${item => {
        return !item.title && !item.customButtons ? '64px' : 0;
    }};
    display: ${item => {
        return item.display ? 'block' : 'none';
    }};
`;

export const ModalHeader = styled.div`
    height: 76px;
    width: 100%;
    text-align: center;
    line-height: 76px;
    font-size: 20px;
    color: #364049;
    background: #fff;
    border-bottom: 1px solid #e5e8ea;
`;

export const ModalCustomHeader = styled.div`
    height: 56px;
    width: 100%;
    text-align: right;
    line-height: 50px;
    font-size: 20px;
    color: #364049;
    background: #fff;
    border-bottom: 1px solid #e5e8ea;
    .ant-btn {
        margin-right: 10px;
    }
`;

export const ModalClose = styled.div`
    font-size: 20px;
    color: #364049;
    width: 20px;
    height: 20px;
    position: absolute;
    top: 24px;
    cursor: pointer;
    right: 10px;
`;
