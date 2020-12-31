/*
 *                        _oo0oo_
 *                       o8888888o
 *                       88" . "88
 *                       (| -_- |)
 *                       0\  =  /0
 *                     ___/`---'\___
 *                   .' \\|     |// '.
 *                  / \\|||  :  |||// \
 *                 / _||||| -:- |||||- \
 *                |   | \\\  - /// |   |
 *                | \_|  ''\---/''  |_/ |
 *                \  .-\__  '-'  ___/-. /
 *              ___'. .'  /--.--\  `. .'___
 *           ."" '<  `.___\_<|>_/___.' >' "".
 *          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *          \  \ `_.   \_ __\ /__ _/   .-` /  /
 *      =====`-.____`.___ \_____/___.-`___.-'=====
 *                        `=---='
 *
 *
 *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 *            佛祖保佑       永不宕机     永无BUG
 *
 * @Author: lei.zhao
 * @Date: 2020-05-22 10:15:47
 * @LastEditTime: 2020-06-17 11:12:11
 * @LastEditors: lei.zhao
 * @Description: 授权插件Table中授权数据单行渲染
 * @FilePath: /econfig-front/src/view/authPlugin/authRow/authRow.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Dropdown, Menu } from 'antd';
import { find, includes } from 'lodash';
import { i18nMessages } from 'src/i18n';
import { RoleSpan, BorderDiv } from '../styled';
import { SiteContent } from './siteContent';

function AuthRow(props) {
    const { rowData, roleList, siteList, formatMessage } = props;
    const { authData = [] } = rowData;
    return (
        <div>
            <span
                style={{
                    width: 1,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 195,
                    background: '#e8e8e8'
                }}
            />
            <span
                style={{
                    width: 1,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 690,
                    background: '#e8e8e8'
                }}
            />
            {authData.map((authItem, index) => {
                const role = find(
                    roleList,
                    roleItem => roleItem.id === authItem.roleId
                );
                const siteIds = authItem.siteIds;
                // 切换角色时，可选的角色需要过滤当前已选择的角色
                const filterRoleList = roleList.filter(
                    roleItem =>
                        !includes(
                            authData.map(item => item.roleId),
                            roleItem.id
                        )
                );
                const menu = (
                    <Menu
                        style={{
                            maxHeight: 300,
                            maxWidth: 250,
                            overflow: 'scroll'
                        }}
                        onClick={e =>
                            props.changeRole(
                                rowData.uniqueId,
                                authItem.authId,
                                e.key
                            )
                        }
                    >
                        {filterRoleList.length > 0 ? (
                            filterRoleList.map(item => (
                                <Menu.Item
                                    title={item.roleName}
                                    key={item.id}
                                    style={{
                                        width: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {item.roleName}
                                </Menu.Item>
                            ))
                        ) : (
                            <Menu.Item key="null" disabled>
                                {props.formatMessage(
                                    i18nMessages.ECONFIG_FRONT_A0170
                                )}
                            </Menu.Item>
                        )}
                    </Menu>
                );
                if (role) {
                    return (
                        <BorderDiv
                            key={index}
                            style={{
                                borderBottom:
                                    (authData.length <= 1 ||
                                        index === authData.length - 1) &&
                                    0
                            }}
                        >
                            <div style={{ width: 195 }}>
                                <Dropdown
                                    overlay={menu}
                                    trigger={['click']}
                                    style={{ width: 150 }}
                                >
                                    <div
                                        className="ant-dropdown-link"
                                        style={{ cursor: 'pointer' }}
                                        onClick={e => e.preventDefault()}
                                    >
                                        <RoleSpan
                                            title={
                                                role?.roleName ||
                                                formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0051
                                                )
                                            }
                                            style={{
                                                color: !role && '#ccc',
                                                marginRight: 6
                                            }}
                                        >
                                            {role?.roleName ||
                                                formatMessage(
                                                    i18nMessages.ECONFIG_FRONT_A0051
                                                )}
                                        </RoleSpan>
                                        <Icon
                                            type="down"
                                            style={{
                                                verticalAlign: 'middle'
                                            }}
                                        />
                                    </div>
                                </Dropdown>
                            </div>
                            <SiteContent
                                projectId={props.projectId}
                                role={role}
                                siteIds={siteIds}
                                siteList={siteList}
                                formatMessage={formatMessage}
                                showSelectSiteModal={() =>
                                    props.showSelectSiteModal(
                                        rowData.uniqueId,
                                        authItem.roleId,
                                        siteIds
                                    )
                                }
                                deleteSite={siteId =>
                                    props.deleteSite(
                                        rowData.uniqueId,
                                        authItem.roleId,
                                        siteId
                                    )
                                }
                            />
                            <div style={{ width: 110 }}>
                                <a
                                    onClick={() =>
                                        props.deleteAuth(
                                            rowData.uniqueId,
                                            authItem.roleId
                                        )
                                    }
                                >
                                    {formatMessage(
                                        i18nMessages.ECONFIG_FRONT_A0070
                                    )}
                                </a>
                            </div>
                        </BorderDiv>
                    );
                    return null;
                }
            })}
        </div>
    );
}

AuthRow.propTypes = {
    rowData: PropTypes.object,
    roleList: PropTypes.array,
    siteList: PropTypes.array,
    showSelectSiteModal: PropTypes.func,
    deleteSite: PropTypes.func,
    deleteAuth: PropTypes.func,
    formatMessage: PropTypes.func,
    projectId: PropTypes.string
};

export default AuthRow;
