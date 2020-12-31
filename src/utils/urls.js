const api_econfig = '/api/econfig-web';
// const api_econfig_service = '/api/econfig-service';
const api_csp_service = '/api/csp-service';
const sso_service = 'api/sso-web/sso';
const api_omp_service = '/api/omp-service';
// const api_im_service = '/api/im-service';
// const api_master_data_service = '/api/master-data-service';
const api_ai = '/api/ai-translationservice';
const api_sign_service = '/api/signcert-service';

const user = {
    getFile: `/file/get/{fileId}`, // 下载文件
    upload: '../../file/upload', // 上传文件
    newupload: '../../file/resource/upload', // FS上传到共享盘
    loginOut: `${sso_service}/sso/doLogout`, // 登出管理
    getCountry: `${api_omp_service}/getCountries`,
    getLanguages: `${api_econfig}/web/languages`,
    getVerManual: `${api_econfig}/eConfig/soft/applicationVerManual`,
    getFilterSoftList: `${api_econfig}/eConfig/soft/listAuthSoft`,
    checkIsDisplayTrailConfig: `${api_econfig}/eConfig/soft/checkIsDisplayTrailConfig`, // 检查Trial配置
    getSystemConfig: `${api_econfig}/notoken/getSystemConfig`, // 获取是否私有部署环境
    // 系统列表
    getSystemList: `${api_econfig}/eConfig/soft/softAuthTimes`,
    getSystemModelTree: `${api_econfig}/eConfig/soft/getTenantMenuInfo`,
    // 企业信息管理-管理员
    getActiveAdminList: `${api_econfig}/eConfig/userInvite/listActivate`,
    delActiveAdmin: `${api_econfig}/eConfig/userInvite/delAuthRefInfo`,
    getNotActiveAdminList: `${api_econfig}/eConfig/userInvite/listNotActivate`,
    delNotActiveAdmin: `${api_econfig}/eConfig/userInvite/delNotAuthRefInfo`,
    checkAdminStatus: `${api_econfig}/eConfig/userInvite/checkUserStatus`,
    resendInviteUser: `${api_econfig}/eConfig/userInvite/resendInviteUser`,
    newAdmin: `${api_econfig}/eConfig/userInvite/rendInvite`,
    updateAdmin: `${api_econfig}/eConfig/userInvite/update`,
    getSoftList: `${api_econfig}/eConfig/soft/listTenantSofts`,
    checkEmailIsAuth: `${api_econfig}/eConfig/email/checkEmailIsAuth`,
    getEmailList: `${api_econfig}/eConfig/email/listEmail`,
    getRoleList: `${api_econfig}/web/role/get?appId=econfig`,
    // 用户管理
    userExport: `${api_econfig}/web/userManage/tenantUser/export`,
    createByImportExcel: `${api_econfig}/web/userManage/createByImportExcel`,
    getUserList: `${api_econfig}/web/userManage/listUserManage`,
    getProjectUserList: `${api_econfig}/web/userManage/listProjectUserManage`,
    deleteUser: `${api_econfig}/web/userManage/delete`,
    disableUser: `${api_econfig}/web/userManage/disableUser`,
    doTimeDisableUsers: `${api_econfig}/web/userManage/doTimeDisableUsers`,
    enableUser: `${api_econfig}/web/userManage/enable`,
    updateUserInfo: `${api_econfig}/web/userManage/updateUser`,
    addUserInfo: `${api_econfig}/web/userManage/insert`,
    addProjectUserInfo: `${api_econfig}/web/userManage/insertProUser`,
    resendUser: `${api_econfig}/web/userManage/userManageInviteSend`,
    getPositionList: `${api_econfig}/web/dictitems/getDictItemByDictTypeName`,
    checkEmailToOutUser: `${api_econfig}/web/userManage/checkEmailToOutUser`,
    checkEmailToProjectUser: `${api_econfig}/web/userManage/checkEmailToProjectUser`,
    getUserInfoByEmail: `${api_econfig}/web/userManage/getUserManageInfoByEmail`,
    checkAccountName: `${api_econfig}/web/accounts/checkNameExist`,
    toDeptUser: `${api_econfig}/web/userManage/changeOutUserToCompanyUser`,
    // getUserDeptList: `${api_master_data_service}/organs/list/organs`,
    updateOutUser: `${api_econfig}/web/userManage/updateOutUser`,
    deleteProjectUserRelation: `${api_econfig}/web/userManage/deleteProjectUserRelation`,
    // 部门管理
    getDeptList: `${api_econfig}/web/organ/organsTree`,
    getDeptMember: `${api_econfig}/web/organUser`,
    deptUrl: `${api_econfig}/web/organ`,
    getAllCompanyUsers: `${api_econfig}/web/userManage/likeUserInfo`,
    changeOrganLevel: `${api_econfig}/web/organ/changeOrganLevel`,
    getAllEnvList: `${api_econfig}/web/env/listMigrateEnv`,
    // 部门管理人员
    // addDeptMember:`${api_master_data_service}/personRef/bindUserOrgans`,
    // deleteDeptMember:`${api_master_data_service}/personRef/delPersonRef`,
    getMemberInfo: `${api_econfig}/web/userManage/getAccountAndUser`,
    getMemberAuth: `${api_econfig}/web/userManage/getBatchUserAuth`,
    saveMemberAuth: `${api_econfig}/web/userManage/batchAuthUser`,
    getAuthAppList: `${api_econfig}/eConfig/soft/getBatchAuthApp`,
    //授权
    getAuthInfo: `${api_econfig}/web/role/getUserRelProAuth`,
    getOutUserRelProAuth: `${api_econfig}/web/role/getOutUserRelProAuth`,
    getAuthRoleList: `${api_econfig}/web/role/listRole`,
    getAuthEconfigRoleList: `${api_econfig}/web/role/get`,
    getProductDataList: `${api_econfig}/web/product`,
    getAppInfo: `${api_econfig}/eConfig/soft`,
    productSearch: `${api_econfig}/web/product/list`,
    getManufactureList: `${api_econfig}/web/product/listManufacture`,
    getProjectRefRole: `${api_econfig}/web/projects/getProjectRefRole`,
    // 高级设置-库房管理
    getWareHouseList: `${api_econfig}/web/storeroom/listStoreroom`,
    addWareHouse: `${api_econfig}/web/storeroom/addStoreroom`,
    updateWareHouse: `${api_econfig}/web/storeroom/updateStoreroom`,
    deleteWareHouse: `${api_econfig}/web/storeroom/delStoreroom`,
    // 高级设置-邮件发送设置
    getEmailConfig: `${api_econfig}/web/smtpConfig/getSmtpConfig`,
    saveEmailConfig: `${api_econfig}/web/smtpConfig/saveSmtpConfig`,
    deleteEmailConfig: `${api_econfig}/web/smtpConfig/delSmtpConfig`,
    sendEmailMessage: `${api_econfig}/web/smtpConfig/sendTestMail`,
    // 高级设置-环境管理
    getEnvList: `${api_econfig}/web/env/listEnv`,
    addEnv: `${api_econfig}/web/env/addEnv`,
    deleteEnv: `${api_econfig}/web/env/delEnv`,
    updateEnv: `${api_econfig}/web/env/upEnv`,
    findSwitchConfig: `${api_econfig}/web/switchConfig/findSwitchConfig`,
    switchConfig: `${api_econfig}/web/switchConfig/switchConfig`,
    // 企业信息管理-基本信息
    // getEnterpriseInfo: `${api_omp_service}/getEnterpriseInfo`,
    getTenantInfo: `${api_omp_service}/getTenantInfo`,
    isExistLoginUrl: `${api_omp_service}/isExistLoginUrl`,
    updateTenantLogo: `${api_omp_service}/updateTenantLogo`,
    getEnterpriseInfo: `${api_econfig}/web/enterprise/getEnterpriseInfo`,
    getEconfigEnterpriseInfo: `${api_econfig}/web/enterprise/getEnterpriseInfo`,
    updateTenant: `${api_omp_service}/updateTenant`,
    updateEconfigTenant: `${api_econfig}/web/enterprise/updateEnterpriseInfo`,
    // getCompanyList: `${api_master_data_service}/company/getCompanyList`, // 申办方
    // getNewCompanyList: `${api_master_data_service}/enterprise/search`, // NEW申办方
    // saveTemp: `${api_master_data_service}/enterprise/temp`,
    // insertCompanyList: `${api_master_data_service}/enterprise/tempBatch/`,
    // ifAbsent: `${api_master_data_service}/cro/ifAbsent`,
    // getCroList: `${api_master_data_service}/cro/getCroList`, // CRO
    // getInstitution: `${api_master_data_service}/institution/list`, // 机构
    // 密码安全策略
    getSecurity: `${api_econfig}/web/pwdStrategy/security`,
    getPin: `${api_econfig}/web/pwdStrategy/getTenantPin/pin`,
    updateSecurity: `${api_econfig}/web/pwdStrategy/security`,
    updatePin: `${api_econfig}/web/pwdStrategy/updateTenantPin/pin`,
    // 数据字典
    findEnumNameByCategory: `${api_omp_service}/findEnumNameByCategory`, // 获取词典名称列表
    getDictItemAll: `${api_econfig}/web/dictitems/getDictItemAll`,
    addDictItem: `${api_econfig}/web/dictitems/addDictItem`,
    delDictItem: `${api_econfig}/web/dictitems/delDictItem/{dictItemId}`,
    updDictItem: `${api_econfig}/web/dictitems/updDictItem/{dictItemId}`,
    // 签名
    getSigns: `${api_econfig}/web/sign/listTenantSigns/signs`,
    getSingleSign: `${api_econfig}/web/sign/{signid}`,
    addSign: `${api_econfig}/web/sign/addTenantSigns/signs`,
    deleteSign: `${api_econfig}/web/sign/delTenantSigns/signs/{signid}`,
    updateSign: `${api_econfig}/web/sign/updateTenantSigns/signs/{signid}`,
    // 日志查询
    getEslogs: `${api_econfig}/web/eslogs/list`,
    getActs: `${api_econfig}/web/es/acts`,
    // 角色管理
    getRoles: `${api_econfig}/eConfig/soft/listTenantSofts?isFilterApp=true`,
    getAuthRole: `${api_econfig}/web/role`,
    getApplicationRoleTypes: `${api_omp_service}/getApplicationRoleTypes`,
    listApplicationRoleType: `${api_econfig}/web/role/listApplicationRoleType`,
    insertCopyRoleMenu: `${api_econfig}/web/role/insertCopyRoleMenu`,
    listAuthRoleMenu: `${api_econfig}/web/role/listAuthRoleMenu`,
    roleInsert: `${api_econfig}/web/role/insert`,
    roleDelete: `${api_econfig}/web/role/deleted`,
    roleUpdate: `${api_econfig}/web/role/update`,
    updateAuthRole: `${api_econfig}/web/role/updateAuthRole`,
    updateAuthSignInfo: `${api_econfig}/web/role/updateAuthSignInfo`,
    exportRoleMenu: `${api_econfig}/web/role/exportAuthMenu`,
    listRoleAuthAppList: `${api_econfig}/web/role/listRoleAuthAppList`,
    // 项目管理
    projectList: `${api_econfig}/web/projects/projectList`,
    tenantProjects: `${api_econfig}/web/projects/tenantProjects`,
    projectSubList: `${api_econfig}/web/projects/subProjectList`,
    addProject: `${api_econfig}/web/projects/addProject`,
    addSubProject: `${api_econfig}/web/projects/addSubProject`,
    delProject: `${api_econfig}/web/projects/delProject`,
    getProjectInfo: `${api_econfig}/web/projects/getProjectInfo/{projectCode}/{candidate}`,
    projectCheckData: `${api_econfig}/web/projects/checkData`,
    findEnumTemplate: `${api_omp_service}/findEnumTemplate`,
    // getPersonList: `${api_master_data_service}/person/list`,
    checkProjectData: `${api_econfig}/web/projects/checkProjectData`,
    checkSubProjectData: `${api_econfig}/web/projects/checkSubProjectData`,
    editProjectInfo: `${api_econfig}/web/projects/editProjectInfo`,
    checkCandidateData: `${api_econfig}/web/projects/checkCandidateData`,
    exportAssignedSite: `${api_econfig}/web/site/exportAssignedSite`,
    removeProject: `${api_econfig}/web/projects/removeProject`,
    listSiteSoft: `${api_econfig}/eConfig/soft/listSiteSoft`,
    // 中心管理
    getSiteList: `${api_econfig}/web/site/siteList`,
    addSite: `${api_econfig}/web/site/addSite`,
    getAssignedSiteList: `${api_econfig}/web/site/assignedSiteList`,
    delSite: `${api_econfig}/web/site/delSite`,
    querySiteIsAssign: `${api_econfig}/web/site/querySiteIsAssign/{siteId}`,
    updateSite: `${api_econfig}/web/site/updateSite`,
    oldUpdateSite: `${api_econfig}/web/site/updateSite/{projectSiteId}`,
    // getProfession: `${api_master_data_service}/organs/{siteId}/departments`,
    // 万能查询人员接口
    // getListByQueryParam: `${api_master_data_service}/person/getListByQueryParam`,
    listCompanyAndRelationUserPage: `${api_econfig}/web/userManage/listCompanyAndRelationUserPage`,
    // 项目下的用户列表
    projectUserList: `${api_econfig}/web/projects/projectUserList`,
    projectDetailInfo: `${api_econfig}/web/projects/projectInfo/{appId}/{id}`,
    projectDelUse: `${api_econfig}/web/projects/projectDelUse`,
    exportProject: `${api_econfig}/web/projects/exportProject/{appId}`,
    exportProjectUser: `${api_econfig}/web/projects/exportProjectUser/{appId}/{projectId}`,
    getDictItemByDictTypeNameNologin: `${api_econfig}/web/dictitems/getDictItemByDictTypeNameNologin`,
    checkUserProjectAuth: `${api_econfig}/web/projects/checkUserProjectAuth`,
    checkUserAuth: `${api_econfig}/web/userManage/checkUserAuth`,
    // 邀请，激活，注册页面
    getListOrgan: `${api_econfig}/web/organ/listOrgan/{tenantId}`,
    createTenantUserByInvite: `${api_econfig}/notoken/createTenantUserByInvite`,
    verifications: `${api_econfig}/verifications`, // 发送验证码
    getInviteAndUserInfo: `${api_econfig}/notoken/getInviteAndUserInfo`, // 验证是否有效
    activeUser: `${api_econfig}/notoken/tenants/activeUser`, // 激活用户
    userLogin: `${sso_service}/sso/doLogin`,
    doPwdStrategyGetByTenantId: `${api_econfig}/notoken/doPwdStrategyGetByTenantId`, // 外部用户校验密码
    doPwdStrategyGetByUserId: `${api_econfig}/notoken/doPwdStrategyGetByUserId`, // 内部用户校验密码
    checkAccountNameIsValid: `${api_econfig}/notoken/checkAccountNameIsValid`, // 校验账户名
    updPswd: `${api_econfig}/notoken/updPswd`,
    verifyValid: `${api_econfig}/notoken/verifyValid`,
    updPswdPinCode: `${api_econfig}/notoken/updPswdPinCode`,
    checkMobileIsValid: `${api_econfig}/notoken/checkMobileIsValid/{mobile}`,
    activePersonalUser: `${api_econfig}/notoken/tenants/activePersonalUser`,
    // 国际化
    getI18nValues: `${api_omp_service}/getI18nValues`,
    resetLanguage: `${api_csp_service}/users/reset/language`,
    // 菜单
    getCurrentUserMenu: `${api_econfig}/users/getCurrentUserMenu`,
    getSoftListFilterApp: `${api_econfig}/eConfig/soft/listTenantSofts?isFilterApp=true`,
    assignStoreroom: `${api_econfig}/web/storeroom/assignStoreroom`,
    assignedStoreroom: `${api_econfig}/web/storeroom/assignedStoreroom`,
    listStoreroomEnable: `${api_econfig}/web/storeroom/listStoreroomEnable`,
    // 验证手机
    checkEconfigCode: `${api_csp_service}/verifications/users/{accountId}/check`, // 验证code
    sendEconfigCode: `${api_csp_service}/verifications/noToken`, // 通过econfig发送验证码
    sendMobileEmail: `${api_econfig}/notoken/sendMobileEmail`, // 发送邮件
    checkTwofactorAuthentication: `${sso_service}/sso/checkTwofactorAuthentication`, // 选择租户后是否需要双因素认证
    addMark: `${sso_service}/sso/addMark`, // 添加标记
    cspVerifications: `${api_econfig}/verifications`,
    usersCheck: `${api_econfig}/verifications/users/check`, // 验证code
    getCodeGlobal: `${api_csp_service}/verifications/global`, // 全能发送验证码接口 发送模式sendMode1.账号不存在 2.账号存在，指定某个租户 3.账号存在，不指定租户
    findLoginPageConfig: `${api_econfig}/web/loginPageConfig/findLoginPageConfig`,
    delLoginPageConfig: `${api_econfig}/web/loginPageConfig/delLoginPageConfig`,
    editLoginPageConfig: `${api_econfig}/web/loginPageConfig/editLoginPageConfig`,
    loginPageConfig: `${api_econfig}/web/loginPageConfig/loginPageConfig`,

    // 授权查询
    getAuthSearchList: `${api_econfig}/users/listAuthUserByParam`,
    exportAuthInfo: `${api_econfig}/users/exportAuthInfo`,
    getAuthTraceList: `${api_econfig}/web/tracelog/searchAuthTraceLog`,
    exportAuthTrace: `${api_econfig}/web/tracelog/exportAuthTraceLog`,

    // csp-service授权接口
    addUserInvite: `${api_csp_service}/usermodule/addUserInvite`, //POST 授权邀请获取key
    getOperateData: `${api_csp_service}/usermodule/getOperateData`, //GET 通过key取数据
    cspListPvSuperRole: `${api_csp_service}/usermodule/ListPvSuperRole`, //GET ListPvSuperRole
    userCheck: `${api_csp_service}/usermodule/userCheck`, //POST 授权编辑获取key
    cspListAuthRoleMenu: `${api_csp_service}/auth/{softId}/roles/listAuthRoleMenu`, //POST 角色权限菜单信息
    cspAuthRoleList: `${api_csp_service}/usermodule/listRolesByAppId`, //GET 角色列表
    cspAuthEconfigRoleList: `${api_csp_service}/usermodule/listRole`,
    cspGetUserRelProAuth: `${api_csp_service}/auth/userroles/getUserRelProAuth`, //GET 获取应用权限信息
    cspEnvList: `${api_csp_service}/envs/list`, //POST 环境列表
    cspListProductEtask: `${api_csp_service}/product/listProductEtask`, //GET 产品列表
    cspProjectList: `${api_csp_service}/usermodule/projectList`, //POST 项目列表
    cspListStoreroom: `${api_csp_service}/usermodule/listStoreroom`, //GET 库房列表
    cspSiteList: `${api_csp_service}/projectsite`, //GET 中心列表
    checkEmailIsExist: `${api_csp_service}/users/checkEmailIsExist`, //GET 邮箱失焦验证
    getUserInfoByUserId: `${api_csp_service}/users/{userId}`, //GET 获取人员信息
    updateAuthUser: `${api_csp_service}/usermodule/updateUserInfo`, //POST 更新人员信息
    cspResendInvite: `${api_csp_service}/usermodule/resendInvite`, //POST 邮箱失焦验证
    cspDisableUser: `${api_csp_service}/users/{userId}/disable`, //PUT 禁用用户
    cspEnableUser: `${api_csp_service}/users/{userId}/enable`, //PUT 启用用户
    cspUnLocklUser: `${api_csp_service}/users/{userId}/unlock`, //PUT 解除锁定
    cspDelUserInfo: `${api_csp_service}/usermodule/delUserInfo`, //Delete 删除
    cspAllEnvList: `${api_csp_service}/usermodule/listMigrateEnv`, //  所有环境列表
    cspProductSearch: `${api_csp_service}/product/list`, //  pv产品高级筛选列表
    cspManufactureList: `${api_csp_service}/product/listManufacture`, //  所有环境列表
    cspAllSoftList: `${api_csp_service}/usermodule/listTenantSofts`, //  所有环境列表
    getProjects: `${api_csp_service}/projects/getProjects`, // 获取所有项目
    authPluginUserCheck: `${api_csp_service}/userBatchAddAuth/userCheck`, // authPlugin 验证人员信息取operatId
    authPluginGetOperateData: `${api_csp_service}/userBatchAddAuth/getOperateData`, // authPlugin 读取人员信息operateData
    authPluginSaveAuth: `${api_csp_service}/userBatchAddAuth/saveBatchUserAuth`, // authPlugin 保存授权

    getProjects_web: `${api_econfig}/web/projects/getProjects`, // 获取所有项目 web
    isSamlflag: `${api_econfig}/web/userManage/isSamlflag`, // 判断租户是否是罗氏租户
    listAuthGroupRole: `${api_econfig}/web/role/listAuthGroupRole`, // 查询角色下的权限组信息
    updateAuthGroupRole: `${api_econfig}/web/role/updateAuthGroupRole`, // 权限组角色授权
    listPvSuperRole: `${api_econfig}/web/role/ListPvSuperRole`, // 获取超级管理员角色id
    getEsLogInfo: `${api_econfig}/web/eslogs/getEsLogInfo`, // 获取日志详情
    getUserInfoByEmailOrMobile: `${api_econfig}/web/userManage/getUserInfoByEmailOrMobile`, // 通过邮箱或者手机号获取用户信息
    getPros: `${api_econfig}/web/projects/getPros`, // 根据项目id查看引用明细
    getProjectList: `${api_econfig}/web/projects/queryProjects`, // 根据方案编号或者流水号检索项目清单
    translateBatch: `${api_ai}/ai/translate/ch2enLR`, // 翻译

    //高级设置  机构管理，申办方管理，CRO管理
    getTenantEnterpriseList: `${api_econfig}/rest/enterprise/list`, // 当前租户获取列表 type区分三个菜单  enterprise_sponsor 申办方, enterprise_institution 机构, enterprise_cro CRO
    getAllEnterpriseList: `${api_econfig}/rest/enterprise/recommend`, // 获取搜索推荐列表 type区分三个菜单  enterprise_sponsor 申办方, enterprise_institution 机构, enterprise_cro CRO
    updateEnterprise: `${api_econfig}/rest/enterprise/`, // 更新 新增 删除 PUT POST DELETE
    getTenantEnterpriseListAll: `${api_econfig}/rest/enterprise/listAll`,
    restEnterpriseSearch: `${api_econfig}/rest/enterprise/search`,
    // econfig申办方 cro 查找
    searchCompany: `${api_econfig}/web/projects/searchCompany`,
    getMaintainPage: `${api_omp_service}/notice/search`, // 维护页面
    batchAddUserAuth: `${api_econfig}/web/userManage/batchAddUserAuth`, // 批量授权
    searchAppTraceLog: `${api_econfig}/web/tracelog/searchAppTraceLog`, // 查询系统痕迹
    searchAct: `${api_econfig}/web/tracelog/searchAct`, // 返回操作模块
    exportAppTraceLog: `${api_econfig}/web/tracelog/exportAppTraceLog`, // 稽查导出

    //签名服务
    serviceStatus: `${api_sign_service}/signcert/serviceStatus`,
    offOnService: `${api_sign_service}/signcert/offOnService`,
    getTenantVerifiedStatus: `${api_sign_service}/accountAuth/enterpriseStatus`,
    getVerifiedUrl: `${api_sign_service}/accountAuth/orgUrl`,
    companySealList: `${api_sign_service}/sealManager/enterprise/signSealList`,
    addSeal: `${api_sign_service}/sealManager/addSignSeal`,
    invalidSeal: `${api_sign_service}/sealManager/invalidSignSeal`,
    updateSeal: `${api_sign_service}/sealManager/updateSignSealName`,
    signUserList: `${api_sign_service}/sealManager/enterprise/signSeal/authUserList`,
    changeSignUser: `${api_sign_service}/sealManager/enterprise/signSeal/authUser`,
    userSealList: `${api_sign_service}/sealManager/enterprise/user/signSealList`,
    saveUserSeal: `${api_sign_service}/sealManager/enterprise/user/signSeal`
};

// 获取url参数
export const getQueryString = function(names, urls) {
    let _urls = urls || window.location.href;
    _urls && _urls.indexOf('?') > -1
        ? (_urls = urls.substring(urls.indexOf('?') + 1))
        : '';
    const reg = new RegExp(`(^|&)${names}=([^&]*)(&|$)`, 'i');
    const r = _urls
        ? _urls.match(reg)
        : window.location.search.substr(1).match(reg);
    if (r !== null && r[2] !== '') return decodeURI(r[2]);

    return null;
};

export function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 解析url {} 值
export const parseApiUrl = function(str, data) {
    const tmpl = `${'var __p=[];' + 'with(obj||{}){__p.push(\''}${str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, '\\\'')
            .replace(/{([\s\S]+?)}/g, function(match, code) {
                return `',${code.replace(/\\'/, '\'')},'`;
            })
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')}');}return __p.join("");`,
        /* jsbint evil:true */
        func = new Function('obj', tmpl);
    return data ? func(data) : func;
};

export default user;
