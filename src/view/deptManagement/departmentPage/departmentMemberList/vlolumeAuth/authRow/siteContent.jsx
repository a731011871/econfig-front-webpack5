import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, Popover } from 'antd';
import { i18nMessages } from 'src/i18n';
import { find } from 'lodash';
import { SiteBtn } from '../styled';

// const Search = Input.Search;

export const SiteContent = props => {
    const [showAllSite, setShowAllSite] = useState(false); // 全部中心弹层
    const [openSite, setOpenSite] = useState(false); // 中心超过10个时候展开收起
    const {
        role,
        siteIds,
        siteList,
        formatMessage,
        deleteSite,
        showSelectSiteModal
    } = props;
    const [allSiteList] = useState(siteList);
    const AllSiteContent = (
        <div style={{ maxHeight: 250, overflow: 'scroll' }}>
            {/* <Search onSearch={() => {  }} /> */}
            {allSiteList.map(item => (
                <SiteBtn
                    title={item.siteName}
                    className="overflow_ellipsis Block"
                    style={{ maxWidth: 200, color: 'rgb(54,64,73)' }}
                    key={item.siteId}
                >
                    {item.siteName}
                </SiteBtn>
            ))}
        </div>
    );
    // 如果projectId为空，说明是无项目状态，无项目的话  中心这里不显示任何内容
    return (
        <div style={{ width: 495 }}>
            {!props.projectId ? null : role && role.needSite === 1 ? (
                <div>
                    <SiteBtn
                        style={{ cursor: 'pointer' }}
                        onClick={showSelectSiteModal}
                    >
                        <span>
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0164)}
                        </span>
                    </SiteBtn>
                    {(openSite
                        ? siteIds
                        : siteIds.filter((item, index) => index < 10)
                    ).map((siteId, siteIndex) => {
                        const siteItem = find(
                            siteList,
                            siteItem => siteItem.siteId === siteId
                        );
                        if (siteItem) {
                            return (
                                <SiteBtn
                                    key={siteIndex}
                                    style={{
                                        color: 'rgb(54,64,73)'
                                    }}
                                >
                                    <span title={siteItem.siteName}>
                                        {siteItem.siteName}
                                    </span>
                                    <Icon
                                        type="close"
                                        onClick={() => deleteSite(siteId)}
                                    />
                                </SiteBtn>
                            );
                        }
                        return null;
                    })}
                    {siteIds.length > 10 && (
                        <a
                            onClick={() => setOpenSite(!openSite)}
                            className="InlineBlock TxtMiddle"
                            style={{ lineHeight: '24px' }}
                        >
                            {openSite ? (
                                <span>
                                    收起
                                    <Icon type="up" />
                                </span>
                            ) : (
                                <span>
                                    查看更多
                                    <Icon type="down" />
                                </span>
                            )}
                        </a>
                    )}
                </div>
            ) : role &&
              role.needSite === 0 &&
              role.nullSiteDefaultValue === 'ALL' ? (
                    <Popover
                        visible={showAllSite}
                        title={formatMessage(i18nMessages.ECONFIG_FRONT_A0296)}
                        content={AllSiteContent}
                        trigger="click"
                        placement="rightBottom"
                        onVisibleChange={visible => {
                            setShowAllSite(visible);
                        }}
                    >
                        <SiteBtn
                            style={{
                                color: 'rgb(54,64,73)'
                            }}
                        >
                            <span>
                                <a>
                                    {formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0296
                                    )}
                                </a>
                            </span>
                        </SiteBtn>
                    </Popover>
                ) : role &&
              role.needSite === 0 &&
              role.nullSiteDefaultValue === 'NONE' ? (
                        <SiteBtn style={{ color: '#ccc' }}>
                            <span>
                                {formatMessage(i18nMessages.ECONFIG_FRONT_A0197)}
                            </span>
                        </SiteBtn>
                    ) : (
                        <span
                            style={{
                                lineHeight: '24px',
                                color: '#ccc'
                            }}
                        >
                            {formatMessage(i18nMessages.ECONFIG_FRONT_A0297)}
                        </span>
                    )}
        </div>
    );
};

SiteContent.prototypes = {
    siteList: PropTypes.array.isRequired,
    siteIds: PropTypes.array.isRequired,
    showSelectSiteModal: PropTypes.func.isRequired,
    deleteSite: PropTypes.func.isRequired,
    formatMessage: PropTypes.func.isRequired,
    role: PropTypes.object.isRequired,
    projectId: PropTypes.string
};
