import im from 'seamless-immutable';
import { createAction } from 'react-popo';
import { message } from 'antd';
import urls from 'utils/urls';
import { $http } from 'utils/http';

const state = im({
    softList: [], // 软件列表
    softInfo: {}, // 软件详情
    roleTypes: [], // 角色类型
    signatureList: [], // 签名设置
    roleLoading: false,
    customTable: { // 自定义角色数据
        list: [],
        loading: false
    }, 
    builtTable: { // 内置角色数据
        list: [],
        loading: false
    }, 
});

export const roleModel = {
    namespace: 'role',
    state,
    reducer: {
        setSoftList(state, {payload}) {
            return state.set('softList', payload);
        } ,
        setSoftInfo(state, {payload: {children, eventKey}}) {
            return state.set('softInfo', {children, eventKey});
        } ,
        setRoleTypes(state, {payload}) {
            return state.set('roleTypes', payload);
        },
        setSignatureList(state, {payload}) {
            return state.set('signatureList', payload);
        },
        setCustomTable(state, {payload}) {
            return state.set('customTable', payload);
        },
        setbuiltTable(state, {payload}) {
            return state.set('builtTable', payload);
        },
        setRoleLoading(state, {payload}) {
            return state.set('roleLoading', payload);
        },
    },
    actions: {
        setSoftList: createAction('role/setSoftList'),
        setSoftInfo: createAction('role/setSoftInfo'),
        setRoleTypes: createAction('role/setRoleTypes'),
        setSignatureList: createAction('role/setSignatureList'),
        setCustomTable: createAction('role/setCustomTable'),
        setbuiltTable: createAction('role/setbuiltTable'),
        setRoleLoading: createAction('role/setRoleLoading'),
    },
    effects: {
        async setSoftList() {
            try{
                this.actions.role.setRoleLoading(true);
                const softList = await $http.get(urls.getRoles) || [];
                if(softList.length > 0) {
                    await this.actions.role.setSoftList(softList || []);
                    await this.effects.role.setSoftInfo({eventKey: softList[0] && softList[0].appId,children: softList[0] && softList[0].appName});
                    await this.effects.role.setbuiltTable(softList[0] && softList[0].appId);
                    await this.effects.role.setRoleTypes(softList[0] && softList[0].appId);
                    await this.actions.role.setRoleLoading(false);
                } else {
                    this.actions.role.setRoleLoading(false);
                }
            }catch(e) {
                message.error(e.message);
            }
        },
        async setSignatureList() {
            try{
                const result = await $http.post(urls.getSigns, {
                    needCount: false,
                    needPaging: false,
                    'criteria': {
                        sortProperties: [
                            {
                                'propertyName': 'createTime',
                                'sort': 'DESC'
                            }
                        ]
                    },
                });
                if(result.rows){
                    const signatureList = result.rows.filter(item => item.status !== '0');
                    this.actions.role.setSignatureList([{id: 'no', signName: '无'}, ...signatureList] || []);
                }else{
                    this.actions.role.setSignatureList([{id: 'no', signName: '无'}] || []);
                }
            }catch(e) {
                message.error(e.message);
            }
        },
        setSoftInfo(data) {
            this.actions.role.setSoftInfo(data || []);
        },
        async setRoleTypes(id) {
            try{
                const roleTypes = await $http.get(urls.listApplicationRoleType, {
                    appId: id,
                });
                this.actions.role.setRoleTypes(roleTypes || []);
            }catch(e) {
                message.error(e.message);
            }
        },
        async setCustomTable(id, sort = '', order = '') {
            try{
                this.actions.role.setCustomTable({
                    list: [],
                    loading: true
                });
                const tableData = await $http.get(urls.getAuthRole, {
                    appId: id,
                    isBuiltin: false,
                    sort,
                    order
                });
                this.actions.role.setCustomTable({
                    list: tableData,
                    loading: false
                });
            }catch(e) {
                message.error(e.message);
            }
        },
        async setbuiltTable(id) {
            try{
                this.actions.role.setbuiltTable({
                    list: [],
                    loading: true
                });
                const tableData = await $http.get(urls.getAuthRole, {
                    appId: id,
                    isBuiltin: true
                });
                this.actions.role.setbuiltTable({
                    list: tableData,
                    loading: false
                });
            }catch(e) {
                message.error(e.message);
            }
        }
    }
};
