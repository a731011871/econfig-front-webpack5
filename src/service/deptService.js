import { $http } from 'utils/http';
import urls, { parseApiUrl } from 'utils/urls';

export const deptService = {
    /*人员相关接口
      pageIndex, pageSize 弃用
    * */
    fetchMember(
        organId,
        status = '1',
        keyword = '',
        pageIndex = 1,
        pageSize = 50,
        position = ''
    ) {
        const obj = {};
        if (status === '2') {
            obj.status = '';
        } else if (status === '1') {
            obj.status = '1';
            obj.enabled = '1';
        } else if (status === '0') {
            obj.status = '0';
        } else if (status === '3') {
            obj.enabled = '0';
            obj.status = '1';
        }
        return $http.post(`${urls.getDeptMember}/${organId}/users`, {
            // status: status || '',
            keyword,
            pageIndex,
            pageSize,
            position,
            ...obj
        });
    },
    getMemberInfo(userId) {
        return $http.get(`${urls.getMemberInfo}?userId=${userId}`);
    },
    getCspMemberInfo(userId) {
        return $http.get(parseApiUrl(urls.getUserInfoByUserId, { userId }));
    },

    /*科室/部门 相关*/

    fetchDepartment() {
        return $http.get(urls.getDeptList);
    },
    getDepartmentInfo(departmentId) {
        return $http.get(`${urls.deptUrl}/${departmentId}`);
    },
    addDepartment(departmentInfo) {
        return $http.post(urls.deptUrl, departmentInfo);
    },
    updateDepartment(departmentInfo) {
        return $http.put(
            `${urls.deptUrl}/${departmentInfo.id}`,
            departmentInfo
        );
    },
    deleteDepartment(departmentId) {
        return $http.delete(`${urls.deptUrl}/${departmentId}`);
    }
};
