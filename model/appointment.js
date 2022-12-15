let joi = require("joi")

function appointment(param) {
    let schema = joi.object({
        doctor_id: joi.number().min(1), required()
    }).options({
        abortEarly: false
    })
    let check = schema.validate(param)
    if (!check || check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        }
        return { error: error }
    }
    return { data: check.value }
}

async function makeAppoint(param, userData) {

}