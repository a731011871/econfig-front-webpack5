import { forEach, find, includes } from 'lodash';
import { message } from 'antd';
import { i18nMessages } from 'src/i18n';

// edc授权时有两种角色类型授权，判断角色类型
export function isEdcFrontRole(roleType) {
    return includes(['ecollect_study_role', 'ecollect_app_role'], roleType);
}

// 把前端显示的数据  格式化为后端接口需要的数据格式
export const formatData = (authInfo, systemList, roleList) => {
    const authArray = [];
    forEach(authInfo, (value, key) => {
        if (
            includes(
                systemList.map(item => item.appId),
                key
            )
        ) {
            const authType = find(systemList, item => item.appId === key)
                .authType;
            switch (authType) {
                case '10': {
                    value.forEach(item => {
                        authArray.push({
                            appId: key,
                            roleId: item.roleIds[0],
                            organIds: item.organIds || []
                        });
                        // if (
                        //     item.organIds.filter(
                        //         projectItem =>
                        //             projectItem !== 'ALL' &&
                        //             projectItem !== 'NONE'
                        //     ).length > 0
                        // ) {
                        //     authArray.push({
                        //         appId: key,
                        //         roleId: item.roleIds[0],
                        //         organIds: item.organIds
                        //     });
                        // } else {
                        //     item.roleIds.forEach(roleId => {
                        //         const arrayItem = {
                        //             appId: key,
                        //             roleId
                        //         };
                        //         authArray.push(arrayItem);
                        //     });
                        // }
                    });
                    break;
                }
                case '9': {
                    value.forEach(item => {
                        if (item.softIds.length > 0) {
                            item.softIds.forEach(softId => {
                                const arrayItem = {
                                    appId: key,
                                    roleId: item.roleIds[0],
                                    softId
                                };
                                authArray.push(arrayItem);
                            });
                        } else if (item.projectIds.length > 0) {
                            item.projectIds.forEach(projectId => {
                                const arrayItem = {
                                    appId: key,
                                    roleId: item.roleIds[0],
                                    projectId
                                };
                                authArray.push(arrayItem);
                            });
                        } else {
                            authArray.push({
                                appId: key,
                                roleId: item.roleIds[0]
                            });
                        }
                    });
                    break;
                }
                case '8': {
                    /**
                     * edc有两种授权模型；根据不同的授权模型创建不同的数据
                     * */
                    value.forEach(item => {
                        if (isEdcFrontRole(item.roleType)) {
                            if (item.envIds.length > 0) {
                                item.envIds.forEach((envId, index) => {
                                    /**
                                     * 因edc前端系统切换角色时，前一次的中心数据保存
                                     * 所以，在数据处理时候需要额外判断一次选择的角色权限
                                     * 如果角色都是没有中心权限的，手动清空siteIds*/
                                    const roles = roleList.filter(roleItem =>
                                        find(
                                            item.roleIds[index],
                                            id => id === roleItem.id
                                        )
                                    );
                                    const arrayItem = {
                                        roleType: item.roleType,
                                        appId: key,
                                        projectId: item.projectIds[0],
                                        envId,
                                        roleId: item.roleIds[index],
                                        siteIds:
                                            roles.filter(
                                                item => item.needSite === 0
                                            ).length ===
                                            item.roleIds[index].length
                                                ? []
                                                : Object.keys(
                                                      item.siteIds[index]
                                                  ),
                                        isAllProSite: item.isAllProSites[index]
                                    };
                                    authArray.push(arrayItem);
                                });
                            } else {
                                item.projectIds.forEach(projectId => {
                                    const arrayItem = {
                                        roleType: item.roleType,
                                        appId: key,
                                        projectId
                                    };
                                    authArray.push(arrayItem);
                                });
                            }
                        } else {
                            if (
                                item.projectIds.filter(
                                    projectItem =>
                                        projectItem !== 'ALL' &&
                                        projectItem !== 'NONE'
                                ).length > 0
                            ) {
                                item.projectIds
                                    .filter(
                                        projectItem =>
                                            projectItem !== 'ALL' &&
                                            projectItem !== 'NONE'
                                    )
                                    .forEach(projectId => {
                                        const arrayItem = {
                                            roleType: item.roleType,
                                            appId: key,
                                            roleId: item.roleIds[0],
                                            projectId
                                        };
                                        authArray.push(arrayItem);
                                    });
                            } else {
                                item.roleIds.forEach(roleId => {
                                    const arrayItem = {
                                        roleType: item.roleType,
                                        appId: key,
                                        roleId
                                    };
                                    authArray.push(arrayItem);
                                });
                            }
                        }
                    });
                    break;
                }
                case '7': {
                    value.forEach(item => {
                        if (item.envIds.length > 0) {
                            item.envIds.forEach((envId, index) => {
                                const arrayItem = {
                                    appId: key,
                                    projectId:
                                        item.projectIds[0] === 'ALL'
                                            ? ''
                                            : item.projectIds[0],
                                    envId: envId === '建库环境' ? '' : envId,
                                    roleId: item.roleIds[index],
                                    siteIds: Object.keys(item.siteIds[index]),
                                    storageIds: Object.keys(
                                        item.storageMap[index]
                                    )
                                };
                                authArray.push(arrayItem);
                            });
                        } else {
                            item.projectIds.forEach(projectId => {
                                const arrayItem = {
                                    appId: key,
                                    projectId
                                };
                                authArray.push(arrayItem);
                            });
                        }
                    });
                    break;
                }
                case '6': {
                    value.forEach(item => {
                        if (item.roleIds.length > 0) {
                            item.roleIds.forEach((roleId, index) => {
                                const arrayItem = {
                                    appId: key,
                                    projectId: item.projectIds[0],
                                    roleId,
                                    siteIds: Object.keys(item.siteIds[index])
                                };
                                authArray.push(arrayItem);
                            });
                        } else {
                            item.projectIds.forEach(projectId => {
                                const arrayItem = {
                                    appId: key,
                                    projectId
                                };
                                authArray.push(arrayItem);
                            });
                        }
                    });
                    break;
                }
                case '1': {
                    value.forEach(item => {
                        item.roleIds.forEach(roleId => {
                            const arrayItem = {
                                appId: key,
                                roleId
                            };
                            authArray.push(arrayItem);
                        });
                    });
                    break;
                }
                case '2': {
                    value.forEach(item => {
                        if (
                            item.projectIds.filter(
                                projectItem =>
                                    projectItem !== 'ALL' &&
                                    projectItem !== 'NONE'
                            ).length > 0
                        ) {
                            item.projectIds
                                .filter(
                                    projectItem =>
                                        projectItem !== 'ALL' &&
                                        projectItem !== 'NONE'
                                )
                                .forEach(projectId => {
                                    const arrayItem = {
                                        appId: key,
                                        roleId: item.roleIds[0],
                                        projectId
                                    };
                                    authArray.push(arrayItem);
                                });
                        } else {
                            item.roleIds.forEach(roleId => {
                                const arrayItem = {
                                    appId: key,
                                    roleId
                                };
                                authArray.push(arrayItem);
                            });
                        }
                    });
                    break;
                }
                case '5': {
                    value.forEach(item => {
                        if (
                            item.projectIds.filter(
                                projectItem =>
                                    projectItem !== 'ALL' &&
                                    projectItem !== 'NONE'
                            ).length > 0 &&
                            item.storageIds.filter(
                                storageId =>
                                    storageId !== 'ALL' && storageId !== 'NONE'
                            ).length > 0
                        ) {
                            item.projectIds
                                .filter(
                                    projectItem =>
                                        projectItem !== 'ALL' &&
                                        projectItem !== 'NONE'
                                )
                                .forEach(projectId => {
                                    const arrayItem = {
                                        appId: key,
                                        projectId,
                                        roleId: item.roleIds[0]
                                    };
                                    authArray.push(arrayItem);
                                });
                            item.storageIds.forEach(storageId => {
                                const arrayItem = {
                                    appId: key,
                                    storageId,
                                    roleId: item.roleIds[0]
                                };
                                authArray.push(arrayItem);
                            });
                        } else if (
                            item.projectIds.filter(
                                projectItem =>
                                    projectItem !== 'ALL' &&
                                    projectItem !== 'NONE'
                            ).length > 0
                        ) {
                            item.projectIds
                                .filter(
                                    projectItem =>
                                        projectItem !== 'ALL' &&
                                        projectItem !== 'NONE'
                                )
                                .forEach(projectId => {
                                    const arrayItem = {
                                        appId: key,
                                        projectId,
                                        roleId: item.roleIds[0]
                                    };
                                    authArray.push(arrayItem);
                                });
                        } else if (
                            item.storageIds.filter(
                                storageId =>
                                    storageId !== 'ALL' && storageId !== 'NONE'
                            ).length > 0
                        ) {
                            item.storageIds.forEach(storageId => {
                                const arrayItem = {
                                    appId: key,
                                    storageId,
                                    roleId: item.roleIds[0]
                                };
                                authArray.push(arrayItem);
                            });
                        } else {
                            authArray.push({
                                appId: key,
                                roleId: item.roleIds[0]
                            });
                        }
                    });
                    break;
                }
                case '4': {
                    value.forEach(item => {
                        if (
                            item.projectIds.filter(
                                projectItem =>
                                    projectItem !== 'ALL' &&
                                    projectItem !== 'NONE'
                            ).length > 0
                        ) {
                            item.projectIds
                                .filter(
                                    projectItem =>
                                        projectItem !== 'ALL' &&
                                        projectItem !== 'NONE'
                                )
                                .forEach((projectId, index) => {
                                    const arrayItem = {
                                        appId: key,
                                        projectId,
                                        roleId: item.roleIds[0],
                                        siteIds: Object.keys(
                                            item.siteIds[index]
                                        )
                                    };
                                    authArray.push(arrayItem);
                                });
                        } else {
                            item.roleIds.forEach(roleId => {
                                const arrayItem = {
                                    appId: key,
                                    roleId
                                };
                                authArray.push(arrayItem);
                            });
                        }
                    });
                    break;
                }
                case '3': {
                    value.forEach(item => {
                        if (
                            item.productDataIds.length > 0 ||
                            item.projectIds.filter(
                                projectItem =>
                                    projectItem !== 'ALL' &&
                                    projectItem !== 'NONE'
                            ).length > 0
                        ) {
                            item.productDataIds.forEach(productDataId => {
                                const arrayItem = {
                                    appId: key,
                                    productDataId,
                                    roleId: item.roleIds[0]
                                };
                                authArray.push(arrayItem);
                            });
                            item.projectIds
                                .filter(
                                    projectItem =>
                                        projectItem !== 'ALL' &&
                                        projectItem !== 'NONE'
                                )
                                .forEach(projectId => {
                                    const arrayItem = {
                                        appId: key,
                                        projectId,
                                        roleId: item.roleIds[0]
                                    };
                                    authArray.push(arrayItem);
                                });
                        } else {
                            item.roleIds.forEach(roleId => {
                                const arrayItem = {
                                    appId: key,
                                    roleId
                                };
                                authArray.push(arrayItem);
                            });
                        }
                    });
                    break;
                }
                default:
                    return null;
            }
        }
    });
    return authArray;
};

// 对请求数据进行完整性验证 角色 项目  等的必填限制
export const validateData = (
    systemList,
    appId,
    authInfo,
    roleList,
    projectList,
    intl
) => {
    const authInfoData = formatData(
        { [appId]: authInfo },
        systemList,
        roleList
    );
    let isValidate = true;
    if (authInfoData.length > 0) {
        const authType = find(systemList, item => item.appId === appId)
            .authType;
        try {
            authInfoData.forEach(authItem => {
                let role = {};
                let project = {};
                if (authItem.roleId) {
                    role = find(roleList, item => item.id === authItem.roleId);
                }
                if (authItem.projectId) {
                    project = find(
                        projectList,
                        item => item.id === authItem.projectId
                    );
                }
                if (authType === '10') {
                    if (
                        role &&
                        role.needDepartment === 1 &&
                        (!authItem.organIds || !authItem.organIds.length)
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0710).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    }
                } else if (authType === '9') {
                    if (
                        role.id === 'econfig_project_admin' &&
                        !authItem.projectId
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0322).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    } else if (
                        role.id === 'econfig_soft_admin' &&
                        !authItem.softId
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0515).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    }
                } else if (authType === '8') {
                    /**
                     * edc有两种授权模型（前端系统-项目环境角色中心；后端系统-角色项目）
                     * 两种授权模型不同的判断条件*/
                    let role = {};
                    if (authItem.roleId) {
                        role = find(
                            roleList,
                            item => item.id === authItem.roleId
                        );
                    }
                    console.log('authItem-----', authItem);
                    if (isEdcFrontRole(authItem.roleType)) {
                        if (authItem.envId === undefined) {
                            isValidate = false;
                            throw new Error(
                                intl(i18nMessages.ECONFIG_FRONT_A0319).replace(
                                    'xxx',
                                    `【${project.projectSerialNo}】${project.projectName}`
                                )
                            );
                        } else if (authItem.envId && !authItem.roleId) {
                            isValidate = false;
                            throw new Error(
                                intl(i18nMessages.ECONFIG_FRONT_A0320).replace(
                                    'xxx',
                                    `【${project.projectSerialNo}】${project.projectName}`
                                )
                            );
                        } else if (
                            authItem.envId &&
                            authItem.roleId &&
                            role &&
                            role.needSite === 1 &&
                            // authItem.isAllProSite !== '1' &&
                            (!authItem.siteIds || authItem.siteIds.length === 0)
                        ) {
                            isValidate = false;
                            throw new Error(
                                intl(i18nMessages.ECONFIG_FRONT_A0321).replace(
                                    'xxx',
                                    `【${project.projectSerialNo}】${project.projectName}`
                                )
                            );
                        }
                    } else {
                        if (
                            role &&
                            role.needProject === 1 &&
                            !authItem.projectId
                        ) {
                            isValidate = false;
                            throw new Error(
                                intl(i18nMessages.ECONFIG_FRONT_A0322).replace(
                                    'xxx',
                                    role.roleName
                                )
                            );
                        }
                    }
                } else if (authType === '7') {
                    if (!authItem.envId) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0319).replace(
                                'xxx',
                                project.projectName
                                    ? `${
                                          project.projectSerialNo
                                              ? `【${project.projectSerialNo}】`
                                              : ''
                                      }${project.projectName}`
                                    : 'All Projects'
                            )
                        );
                    } else if (authItem.envId && !authItem.roleId) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0320).replace(
                                'xxx',
                                project.projectName
                                    ? `${
                                          project.projectSerialNo
                                              ? `【${project.projectSerialNo}】`
                                              : ''
                                      }${project.projectName}`
                                    : 'All Projects'
                            )
                        );
                    } else if (
                        authItem.envId &&
                        authItem.roleId &&
                        authItem.projectId !== 'ALL' &&
                        authItem.projectId !== '' &&
                        role &&
                        role.needSite === 1 &&
                        (!authItem.siteIds || authItem.siteIds.length === 0)
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0321).replace(
                                'xxx',
                                project.projectName
                                    ? `${
                                          project.projectSerialNo
                                              ? `【${project.projectSerialNo}】`
                                              : ''
                                      }${project.projectName}`
                                    : 'All Projects'
                            )
                        );
                    } else if (
                        authItem.envId &&
                        authItem.roleId &&
                        authItem.projectId !== 'ALL' &&
                        authItem.projectId !== '' &&
                        role &&
                        role.needStoreroom === 1 &&
                        (!authItem.storageIds ||
                            authItem.storageIds.length === 0)
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0323).replace(
                                'xxx',
                                project.projectName
                                    ? `${
                                          project.projectSerialNo
                                              ? `【${project.projectSerialNo}】`
                                              : ''
                                      }${project.projectName}`
                                    : 'All Projects'
                            )
                        );
                    }
                } else if (authType === '2') {
                    if (role && role.needProject === 1 && !authItem.projectId) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0322).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    }
                } else if (authType === '4') {
                    if (role && role.needProject === 1 && !authItem.projectId) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0322).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    } else if (
                        authItem.projectId &&
                        role &&
                        role.needSite === 1 &&
                        (!authItem.siteIds || !authItem.siteIds.length)
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0321).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    }
                } else if (authType === '6') {
                    if (!authItem.roleId) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0320).replace(
                                'xxx',
                                `【${project.projectSerialNo}】${project.projectName}`
                            )
                        );
                    } else if (
                        authItem.roleId &&
                        role &&
                        role.needSite === 1 &&
                        (!authItem.siteIds || authItem.siteIds.length === 0)
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0321).replace(
                                'xxx',
                                `【${project.projectSerialNo}】${project.projectName}`
                            )
                        );
                    }
                } else if (authType === '5') {
                    if (role.roleType === 'PI' && !authItem.projectId) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0322).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    } else if (
                        role.roleType === 'noProjectadmin' &&
                        !authItem.storageId
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0323).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    }
                } else if (authType === '3') {
                    if (
                        role &&
                        role.needProject === 1 &&
                        authInfoData.filter(
                            item =>
                                item.roleId === authItem.roleId &&
                                item.projectId
                        ).length === 0
                    ) {
                        isValidate = false;
                        throw new Error(
                            intl(i18nMessages.ECONFIG_FRONT_A0324).replace(
                                'xxx',
                                role.roleName
                            )
                        );
                    }
                }
            });
        } catch (e) {
            message.error(e.message);
        }
    }
    return isValidate;
};

export const getNullAppId = (oldAuthInfo, newAuthInfo) => {
    const appIds = [];
    forEach(oldAuthInfo, (authItem, appId) => {
        if (authItem.length > 0 && newAuthInfo[appId].length === 0) {
            appIds.push(appId);
        }
    });
    return appIds;
};

export const getBasicInfoAreaValues = values => {
    const area = [];
    if (values.countryId) {
        area[0] = values.countryId;
        if (values.provinceId) {
            area[1] = values.provinceId;
            if (values.cityId) {
                area[2] = values.cityId;
                if (values.county) {
                    area[3] = values.county;
                }
            }
        }
    }
    return area;
};

export const getDataFromArea = area => {
    return {
        countryId: area[0] || '',
        provinceId: area[1] || '',
        cityId: area[2] || '',
        county: area[3] || ''
    };
};

export const queryParamBuilder = function() {
    this.criteria = {
        conditions: []
    };
    this.appendCondition = (propertyName, operator, value) => {
        this.criteria.conditions.push({
            propertyName,
            operator,
            value,
            joint: 'AND'
        });
        return this;
    };
};

// 所有项目选择组件前端筛选方法，根据关键词筛选项目名称 项目流水号 项目方案号
export const projectFilterOption = (keyWord, option) => {
    return (
        includes(option.props.projectName, keyWord) ||
        includes(option.props.programCode, keyWord) ||
        includes(option.props.projectSerialNo, keyWord)
    );
};
