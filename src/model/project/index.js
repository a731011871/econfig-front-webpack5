import im from 'seamless-immutable';
import { createAction } from 'react-popo';
import { message } from 'antd';
import urls from 'utils/urls';
import { $http } from 'utils/http';

const state = im({
    currentAppId: '', // 当前选择的软件Id
    softList: [], // 软件列表
    searchParams: {},  // 当前所有app列表搜索,分页状态
});

export const projectModel = {
    namespace: 'project',
    state,
    reducer: {
        setCurrentAppId(state, {payload}) {
            return state.set('currentAppId', payload);
        } ,
        setSoftList(state, {payload}) {
            return state.set('softList', payload);
        } ,
        setSearchParams(state, {payload}) {
            return state.set('searchParams', {
                ...state.searchParams,
                [state.currentAppId]: payload,
            });
        } ,
    },
    actions: {
        setCurrentAppId: createAction('project/setCurrentAppId'),
        setSoftList: createAction('project/setSoftList'),
        setSearchParams: createAction('project/setSearchParams'),
    },
    effects: {
        setCurrentAppId(id) {
            this.actions.project.setCurrentAppId(id);
        },
        async setSoftList() {
            try{
                const softList = await $http.get(urls.getSoftListFilterApp);
                this.actions.project.setSoftList(softList);
                if(softList && softList.length > 0) {
                    this.actions.project.setCurrentAppId(softList[0].appId);
                }
            }catch(e) {
                message.error(e.message);
            }
        },
        setSearchParams(val) {
            this.actions.project.setSearchParams(val);
        }
    }
};
