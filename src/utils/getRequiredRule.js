export function getRequiredRule(fieldName) {
    return {
        required: true ,
        message: `${fieldName}为必填项`
    };
}