export const getNewMenus = (econfigMenu) => {

    const oneDatas = [], 
        twoDatas = [], 
        menu = [{
            id: 'index',
            code: 'index',
            name: '首页',
            i18nKey: 'ECONFIG_FRONT_A0550'
        }];

    econfigMenu && econfigMenu.map(item => {
        oneDatas.push({
            id: item.id,
            parentId: item.parentId,
            code: item.code,
            name: item.name,
            i18nKey: item.i18nKey,
        });
        item.children && item.children.map(i => {
            twoDatas.push({
                id: i.id,
                parentId: i.parentId,
                code: i.code,
                name: i.name,
                i18nKey: i.i18nKey,
            });
        });
    }); 

    // console.log(econfigMenu);
    // console.log(oneDatas);
    // console.log(twoDatas);

    // 新用户菜单
    if(oneDatas.find(item => item.code === 'department_manage') || oneDatas.find(item => item.code === 'user_manage') || oneDatas.find(item => item.code === 'project_user') || oneDatas.find(item => item.code === 'role_manage')) {
        const userItem = {
            id: 'user',
            code: 'user',
            name: '用户',
            i18nKey: 'ECONFIG_FRONT_A0551',
            children: [],
        };
        if(oneDatas.find(item => item.code === 'department_manage')) {
            userItem.children.push({...oneDatas.find(item => item.code === 'department_manage'), parentId: userItem.id});
        }
        if(oneDatas.find(item => item.code === 'user_manage')) {
            userItem.children.push({...oneDatas.find(item => item.code === 'user_manage'), parentId: userItem.id});
        }
        if(oneDatas.find(item => item.code === 'project_user')) {
            userItem.children.push({...oneDatas.find(item => item.code === 'project_user'), parentId: userItem.id});
        }
        if(oneDatas.find(item => item.code === 'role_manage')) {
            userItem.children.push({...oneDatas.find(item => item.code === 'role_manage'), parentId: userItem.id});
        }
        menu.push(userItem);
    }
    // 项目菜单
    if(oneDatas.find(item => item.code === 'project_manage')) {
        menu.push(oneDatas.find(item => item.code === 'project_manage'));
    }
    // 设置
    if(econfigMenu.find(item => item.code === 'senior_config')) {
        menu.push({
            ...econfigMenu.find(item => item.code === 'senior_config'),
            name: '设置',
            i18nKey: 'ECONFIG_FRONT_A0552'
        });
    }
    // 查询
    if(oneDatas.find(item => item.code === 'query_stats')) {
        const queryItem = {
            ...oneDatas.find(item => item.code === 'query_stats'),
            name: '查询',
            i18nKey: 'ECONFIG_FRONT_A0553',
            children: []
        };
        if(twoDatas.find(item => item.code === 'auth_search')) {
            queryItem.children.push({
                ...twoDatas.find(item => item.code === 'auth_search'),
                name: '用户授权查询',
                i18nKey: 'ECONFIG_FRONT_A0554'
            });
        }
        if(twoDatas.find(item => item.code === 'log_search')) {
            queryItem.children.push({
                ...twoDatas.find(item => item.code === 'log_search'),
                name: '操作日志查询',
                i18nKey: 'ECONFIG_FRONT_A0555'
            });
        }
        menu.push(queryItem);
    }
    // 我的企业
    if(oneDatas.find(item => item.code === 'company_manage')) {
        const companyItem = {
            ...oneDatas.find(item => item.code === 'company_manage'),
            name: '我的企业',
            i18nKey: 'ECONFIG_FRONT_A0556',
            children: []
        };
        if(twoDatas.find(item => item.code === 'base_info')) {
            companyItem.children.push({
                ...twoDatas.find(item => item.code === 'base_info'),
                name: '企业信息维护',
                i18nKey: 'ECONFIG_FRONT_A0557'
            });
        }
        if(twoDatas.find(item => item.code === 'admin')) {
            companyItem.children.push({
                ...twoDatas.find(item => item.code === 'admin'),
                name: '管理员维护',
                i18nKey: 'ECONFIG_FRONT_A0558'
            });
        }
        if(oneDatas.find(item => item.code === 'soft_list')) {
            companyItem.children.push({
                ...oneDatas.find(item => item.code === 'soft_list'),
                name: '我的应用',
                i18nKey: 'ECONFIG_FRONT_A0559'
            });
        }
        menu.push(companyItem);
    }
    console.log(menu);
    return menu;
};