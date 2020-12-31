import im from 'seamless-immutable';
import { message } from 'antd';
import { createAction } from 'react-popo';
import { deptService } from '../../service/deptService';

const state = im({
    departmentList: [],
    activeDepartmentId: '',
    activeDepartmentInfo: {},
    departmentMember: { total: 0, list: [] }
});

function getUserCount(id, tree) {
    let isGet = false;
    let retNode = null;
    function deepSearch(tree, id) {
        for (let i = 0; i < tree.length; i++) {
            if (tree[i].children && tree[i].children.length > 0) {
                deepSearch(tree[i].children, id);
            }
            if (id === tree[i].id || isGet) {
                isGet || (retNode = tree[i]);
                isGet = true;
                break;
            }
        }
    }
    deepSearch(tree, id);
    return retNode.organizeCasecadeUserCount;
}

// const getUserCount = (deptId, deptTree) => {
//     if (find(deptTree, item => item.id === deptId)) {
//         return find(deptTree, item => item.id === deptId).organizeCasecadeUserCount
//     } else {}
//     console.log(deptId, deptTree);
// }

export const deptManagementModel = {
    namespace: 'deptManagement',
    state,
    reducer: {
        /*人员相关*/
        fetchMember(state, { payload }) {
            return state.set('departmentMember', {
                total: payload.total,
                list: payload.data
            });
        },

        fetchDepartment(state, { payload }) {
            const department = state.asMutable();
            department.departmentList = payload;
            return im(department);
        },

        deleteDepartment(state) {
            const department = state.asMutable();
            department.activeDepartmentId = '';
            department.activeDepartmentInfo = {};
            department.departmentMember = { total: 0, list: [] };
            return im(department);
        },
        changeActiveDepartment(state, { payload }) {
            const department = state.asMutable({ deep: true });
            department.activeDepartmentId = payload.departmentId;
            department.departmentMember = {
                total: payload.departmentMember.total,
                list: payload.departmentMember.data
            };
            department.activeDepartmentInfo = payload.activeDepartmentInfo;
            return im(department);
        }
    },
    actions: {
        // 人员
        fetchMember: createAction('deptManagement/fetchMember'),
        // 部门
        fetchDepartment: createAction('deptManagement/fetchDepartment'),
        deleteDepartment: createAction('deptManagement/deleteDepartment'),
        changeActiveDepartment: createAction(
            'deptManagement/changeActiveDepartment'
        )
    },
    effects: {
        async fetchMember(
            deptId,
            status,
            keyWords,
            pageIndex,
            pageSize,
            position
        ) {
            console.log(status, keyWords);
            const data = await deptService.fetchMember(
                deptId,
                status,
                keyWords,
                pageIndex,
                pageSize,
                position
            );
            await this.actions.deptManagement.fetchMember(data);
        },

        /*科室*/
        // refresh 是否需要完全刷新列表，不刷新的话取上一次选中的部门  searchMemberObj-搜索部门人员参数，人员操作后保持上一次的搜索状态
        async fetchDepartment(refresh, searchMemberObj) {
            try {
                const data = await deptService.fetchDepartment();

                if (data && data.length > 0) {
                    const prevActiveDepartmentId = this.getState()
                        .deptManagement.activeDepartmentId;
                    // const prevActiveOrganizeCasecadeUserCount = this.getState()
                    //     .deptManagement.activeDepartmentInfo.organizeCasecadeUserCount;
                    const defaultDepartmentId =
                        !refresh && prevActiveDepartmentId
                            ? prevActiveDepartmentId
                            : data[0].id;
                    const organizeCasecadeUserCount = getUserCount(
                        defaultDepartmentId,
                        data
                    );
                    // console.log(count);
                    // const organizeCasecadeUserCount = (!refresh && prevActiveOrganizeCasecadeUserCount)
                    //     ? prevActiveOrganizeCasecadeUserCount
                    //     : data[0].organizeCasecadeUserCount;
                    await this.effects.deptManagement.changeActiveDepartment(
                        defaultDepartmentId,
                        organizeCasecadeUserCount,
                        searchMemberObj
                    );
                }
                await this.actions.deptManagement.fetchDepartment(data || []);
            } catch (e) {
                message.error(e.message);
            }
        },
        async changeActiveDepartment(
            departmentId,
            organizeCasecadeUserCount = 0,
            searchMemberObj = {}
        ) {
            try {
                const departmentMember = await deptService.fetchMember(
                    departmentId,
                    searchMemberObj.status,
                    searchMemberObj.keyWords,
                    searchMemberObj.pageIndex,
                    searchMemberObj.pageSize,
                    searchMemberObj.position
                );
                const activeDepartmentInfo = await deptService.getDepartmentInfo(
                    departmentId
                );
                await this.actions.deptManagement.changeActiveDepartment({
                    departmentId,
                    activeDepartmentInfo: {
                        ...activeDepartmentInfo,
                        organizeCasecadeUserCount
                    },
                    departmentMember
                });
            } catch (e) {
                message.error(e.message);
            }
        },
        async deleteDepartment(departmentId) {
            try {
                await deptService.deleteDepartment(departmentId);
                await this.actions.deptManagement.deleteDepartment();
                this.effects.deptManagement.fetchDepartment();
            } catch (e) {
                message.error(e.message);
            }
        }
    }
};
