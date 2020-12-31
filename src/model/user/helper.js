export function updateUser(state, payload) {
    const { id, userDto } = payload;
    const users = state.users.asMutable({ deep: true });
    const userCount = users.length;
    for (let i = 0; i < userCount; i++) {
        const user = users[i];
        if (id === user.id) {
            users[i] = {
                ...user,
                ...userDto
            };
            return state.set('users', users);
        }
    }

    return state;
}



export function findOneById(source, id) {
    const [record] = source.filter(record => record.id === id);
    return record || null;
}
