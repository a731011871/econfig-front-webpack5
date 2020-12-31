export function fieldHasError(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}