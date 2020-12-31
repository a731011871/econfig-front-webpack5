import styled from 'styled-components';

export const RoleSpan = styled.div`
    margin-right: 6px;
    display: inline-block;
    max-width: 10em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
`;
export const BorderDiv = styled.div`
    border-bottom: 1px solid #e8e8e8;
    & > div{
        display: table-cell;
        padding: 10px;
        // & + div {
            // border-left: 1px solid #e8e8e8;
        // }
    }
`;
export const SiteBtn = styled.div`
    height: 24px;
    display: inline-block;
    padding: 0 12px;
    border: 1px dashed rgba(226, 228, 230, 1);
    font-size: 13px;
    font-weight: 400;
    color: rgba(90, 155, 230, 1);
    background: rgba(246, 248, 250, 1);
    // line-height: 22px;
    cursor: default;
    text-align: center;
    margin-right: 8px;
    margin-bottom: 8px;
    span {
        display: inline-block;
        max-width: 10em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
        line-height: 22px;
    }
    i {
        cursor: pointer;
        vertical-align: middle;
        margin-left: 6px;
        font-size: 16px;
        opacity: 0.4;
    }
`;
