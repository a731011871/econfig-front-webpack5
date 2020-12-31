import { $http } from 'utils/http';
import urls from 'utils/urls';

export const authServices = {
    getTenantProjects(projectIds) {
        return $http.post(urls.tenantProjects, {
            projectIds: projectIds || []
        });
    },
    getProjectList(appId) {
        return $http.post(urls.projectList, { appId });
    },
    getRoleList(appId) {
        return $http.get(`${urls.getAuthRoleList}?appId=${appId}`);
    },
    getListPvSuperRole(userProperty) {
        return $http.get(`${urls.listPvSuperRole}?userProperty=${userProperty}`);
    },
    getEnvList(appId) {
        // const envparams = {
        //     criteria: {
        //         conditions: [
        //             {
        //                 joint: 'AND',
        //                 operator: 'in',
        //                 propertyName: 'appId',
        //                 value: `${appId},*`
        //             },
        //
        //             {
        //                 joint: 'AND',
        //                 operator: 'contains',
        //                 propertyName: 'envName',
        //                 value: ''
        //             }
        //         ]
        //     },
        //     needPaging: false,
        //     pageNo: 0,
        //     pageSize: 0
        // };
        return $http.get(urls.getAllEnvList, { appId });
    },
    getAssignedSiteList(projectId, searchValue, pageSize = 9999) {
        console.log(projectId, searchValue);
        const params = {
            pageIndex: 1,
            pageSize,
            aliasNameOrSecondaryCode: searchValue,
            projectId
        };
        return $http.post(urls.getAssignedSiteList, params);
        // return $http.post(urls.getInstitution, params);
    },
    getAssignedStorageList(projectId, appId) {
        console.log(projectId, appId);
        const params = {
            projectId,
            appId
        };
        return $http.post(urls.assignedStoreroom, params);
        // return $http.post(urls.getInstitution, params);
    },
    getStorageList() {
        const params = {
            pageNo: 0,
            paging: false,
            pageSize: 0,
            criteria: {
                conditions: [
                    {
                        join: 'AND',
                        subConditions: [
                            {
                                entityName: 'storeroomDo',
                                joint: 'AND',
                                operator: 'contains',
                                propertyName: 'storeroomName',
                                value: ''
                            },
                            {
                                entityName: 'storeroomDo',
                                joint: 'OR',
                                operator: 'contains',
                                propertyName: 'contact',
                                value: ''
                            }
                        ]
                    }
                ]
            }
        };
        return $http.post(urls.getWareHouseList, params);
    },
    getProductDataList(appId) {
        return $http.get(`${urls.getProductDataList}/${appId}`);
    },

    getCspTenantProjects(projectNameOrCode = '', ids = null, paging = false) {
        return $http.post(`${urls.cspProjectList}`, {
            keyword: projectNameOrCode,
            pageIndex: paging ? 1 : 0,
            pageSize: paging ? 20 : 0,
            paging,
            projectIds: ids
        });
    },
    getCspProjectList(appId, paging = false, projectNameOrCode = '') {
        return $http.post(`${urls.cspProjectList}`,
            {
                appId,
                keyword: projectNameOrCode,
                pageIndex: paging ? 1 : 0,
                pageSize: paging ? 20 : 0,
                paging
            }
        );
    },
    getCspRoleList(appId) {
        return $http.get(`${urls.cspAuthRoleList}?appId=${appId}`);
    },
    getCspEnvList(appId) {
        return $http.get(urls.cspAllEnvList, {appId});
    },
    getCspSiteList(projectId, siteName = '') {
        return $http.get(
            `${
                urls.cspSiteList
            }?projectId=${projectId}&siteName=${siteName}&pageIndex=0&pageSize=0`
        );
    },
    getCspStorageList(projectId = '', appId = '') {
        return $http.get(
            `${urls.cspListStoreroom}?appId=${appId}&projectId=${projectId}`
        );
    },
    getCspProductDataList(appId) {
        return $http.get(`${urls.cspListProductEtask}?appId=${appId}`);
    },
    getCspListPvSuperRole(userProperty) {
        return $http.get(`${urls.cspListPvSuperRole  }?userProperty=${userProperty}`);
    },
};
