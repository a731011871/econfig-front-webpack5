import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import { find } from 'lodash';
import { i18nMessages } from 'src/i18n';
import classnames from 'classnames';
import {SiteBtn} from 'src/component/authPage/styled';
const SiteItem = styled.div`
    border: 1px solid #9e9e9e;
    background: #f5f5f5;
    color: #333;
    padding-left: 10px;
    padding-right: 5px;
    margin-top: 6px;
    text-align: center;
    max-width: 200px;
    display: inline-block;
    margin-right: 8px;
    float: left;
    vertical-align: middle;
`;
const ToggleBtn = styled.div`
    color: #1e88e5;
    padding-left: 10px;
    padding-right: 5px;
    margin-top: 6px;
    text-align: center;
    max-width: 200px;
    display: flex;
    margin-right: 8px;
    float: left;
    vertical-align: middle;
    cursor: pointer;
`;
const SiteSpan = styled.span`
    max-width: 164px;
    vertical-align: middle;
`;

export default class contentItem extends React.PureComponent {
    static propTypes = {
        dataIds: PropTypes.array,
        datas: PropTypes.array,
        onDelete: PropTypes.func,
        addProject: PropTypes.func,
        isProject: PropTypes.bool,
        edit: PropTypes.bool
    };

    state = {
        showAllContent: false
    };

    render() {
        const { datas, dataIds, isProject } = this.props;
        const { showAllContent } = this.state;
        return (
            <div style={{ minWidth: 210 }}>
                {isProject && (
                    <SiteBtn
                        className={`InlineBlock mRight15 Left ${!this.props
                            .edit && 'DisabledBtn'}`}
                        onClick={() => {
                            this.props.addProject();
                        }}
                        title={this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0311
                        )}
                    >
                        {this.props.intl.formatMessage(
                            i18nMessages.ECONFIG_FRONT_A0311
                        )}
                    </SiteBtn>
                )}
                {dataIds.map((item, index) => {
                    let contentItem = {};
                    if (item === 'ALL') {
                        contentItem = {
                            id: 'ALL',
                            commonZhName: '全部',
                            projectName: '全部'
                        };
                    } else {
                        contentItem = find(
                            datas,
                            dataItem => dataItem.id === item
                        );
                    }
                    if (contentItem) {
                        return (
                            <SiteItem
                                key={item}
                                className={classnames({
                                    Hidden: index > 4 && !showAllContent,
                                    wMax400: isProject
                                })}
                            >
                                <SiteSpan
                                    title={
                                        isProject
                                            ? contentItem.projectSerialNo ? `【${contentItem.projectSerialNo}】${contentItem.projectName}` : contentItem.projectName
                                            : `${contentItem.commonZhName} ${
                                                contentItem.manufacture
                                                    ? `【${contentItem.manufacture}】`
                                                    : ''
                                            }`
                                    }
                                    className={classnames(
                                        'InlineBlock overflow_ellipsis mRight5',
                                        { vMax20em: isProject }
                                    )}
                                >
                                    {isProject
                                        ? contentItem.projectSerialNo ? `【${contentItem.projectSerialNo}】${contentItem.projectName}` : contentItem.projectName
                                        : `${contentItem.commonZhName} ${
                                            contentItem.manufacture
                                                ? `【${contentItem.manufacture}】`
                                                : ''
                                        }`}
                                </SiteSpan>
                                {this.props.edit && (
                                    <Icon
                                        className="TxtMiddle pointer"
                                        type="close"
                                        onClick={() => {
                                            this.props.onDelete(item);
                                        }}
                                    />
                                )}
                            </SiteItem>
                        );
                    }
                })}
                {dataIds.length > 5 && !showAllContent && (
                    <ToggleBtn
                        className="showAll"
                        onClick={() => {
                            this.setState({ showAllContent: true });
                        }}
                    >
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0344
                            )}
                        </span>
                        <Icon className="pTop3" type="down" />
                    </ToggleBtn>
                )}
                {dataIds.length > 5 && showAllContent && (
                    <ToggleBtn
                        className="hideAll"
                        onClick={() => {
                            this.setState({ showAllContent: false });
                        }}
                    >
                        <span>
                            {this.props.intl.formatMessage(
                                i18nMessages.ECONFIG_FRONT_A0345
                            )}
                        </span>
                        <Icon type="up" className="pTop3" />
                    </ToggleBtn>
                )}
            </div>
        );
    }
}
