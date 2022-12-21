let { todayDate, tomorrowDate } = require("../config/time")
let joi = require("joi");
const Doctor = require("../schema/doctor");
let { Appointment } = require("../schema/appointment")
let Slot = require("../schema/slot");
let moment = require("moment")

function joiCheck(param) {
    let schema = joi.object({
        doctor_id: joi.number().min(1).required(),
        date: joi.string().valid(tomorrowDate).required()
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
    if (param.date != tomorrowDate) {
        return { error: "The appointment is only available for tomorrow" }
    }
    let get = await Slot.findOne({
        where: {
            doctor_id: find.id,
            is_available: true
        }, raw: true
    }).catch((err) => {
        return { error: err }
    })
    if (!get || get.error) {
        return { error: "Slots are not available for appointment" }
    }
    let how = await Appointment.findOne({
        where: {
            user_id: userData.id,
            doctor_id: param.doctor_id
        }
    }).catch((err) => {
        return { error: err }
    })
    if (how) {
        return { error: "You cant make booking multiple times" }
    }
    let assign = await Appointment.create({
        user_id: userData.id,
        doctor_id: find.id,
        time_slot: get.time_slot,
        appointment_date: param.date
    }).catch((err) => {
        return { error: err }
    })
    if (!assign || assign.error) {
        return { error: "Internal Server Error" }
    }

    let update = await Slot.update({ is_available: false }, {
        where: {
            id: get.id
        }
    }).catch((err) => {
        return { error: err }
    })
    if (!update || update.error) {
        return { error: "Internal Server Error" }
    }

    return { data: `Your Appointment is Under process for tomorrow ${tomorrowDate} please wait for confirmation ` }



}


module.exports = { appoint }