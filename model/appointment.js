let { todayDate, tomorrowDate } = require("../config/time")
let joi = require("joi");
const Doctor = require("../schema/doctor");
let { Appointment } = require("../schema/appointment")
let Slot = require("../schema/slot")

function joiCheck(param) {
    let schema = joi.object({
        doctor_id: joi.number().min(1).required(),
        date: joi.date().required()
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

async function appoint(param, userData) {
    let check = joiCheck(param)
    if (!check || check.error) {
        return { error: check.error }
    }
    let find = await Doctor.findOne({ where: { id: param.doctor_id }, raw: true }).catch((err) => {
        return { error: err }
    })
    if (!find || find.error) {
        return { error: "This Doctor is not available" }
    }


}