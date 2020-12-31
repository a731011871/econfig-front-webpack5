export function updateRecord(source , payload) {
    const {id , dto} = payload;
    const userCount = source.length;
    for (let i = 0; i < userCount; i++) {
        const record = source[ i ];
        if (id === record.id) {
            source[ i ] = {
                ...record ,
                ...dto
            };
            return source;
        }
    }

}