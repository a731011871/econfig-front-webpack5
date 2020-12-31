import im from 'seamless-immutable';
import { createAction } from 'react-popo';
import { updateUser } from './helper';

const state = im({
    users: [] ,
    newUserForm: {}
});


export const userModel = {
    namespace: 'user' ,
    state ,
    reducer: {
        add(state , {payload: userDto}) {
            const users = state.users.asMutable();

            users.push({
                ...userDto ,
                id: state.users.length + 1
            });

            return state.set('users' , users);
        } ,
        delete(state , {payload: id}) {
            const users = state.users.asMutable().filter(user => {
                return user.id !== id;
            });

            return state.set('users' , users);
        } ,
        update(state , {payload}) {
            return updateUser(state , payload);
        } ,
        fieldChange(state , {payload}) {
            return state.set('newUserForm' , {
                ...state.newUserForm ,
                ...payload
            });
        }
    } ,
    actions: {
        add: createAction('user/add') ,
        delete: createAction('user/delete') ,
        update: createAction('user/update') ,
        fieldChange: createAction('user/fieldChange')
    } ,
    effects: {

    }
};

