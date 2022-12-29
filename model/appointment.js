
let { todayDate, tomorrowDate } = require("../config/time")
let joi = require("joi");
const Doctor = require("../schema/doctor");
let { Appointment } = require("../schema/appointment");
const { func } = require("joi");
const { use } = require("express/lib/router");
const { sequelize, QueryTypes } = require("../init/dbconnect");
function joiCheck(param) {
    let schema = joi.object({
        doctor_id: joi.number().min(1).required(),
        slots:joi.string().required(),
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

        return { status: 400,error: check.error }
    }
    let find = await Doctor.findOne({ where: { id: param.doctor_id }, raw: true }).catch((err) => {
        return { error: err }
    })
    let data = JSON.parse(find.time_slots)
    if (!find || find.error) {
        return { status:400,error: "This Doctor is not available" }
    }
    console.log(data)
    
    let limit = 0;
    
 let checklimit=false        
    for(let a of data){
        if(a.slot == param.slots){
           limit=a.limit
           checklimit=true

        }
    }
    if(!checklimit){
        return {status:400,error:"plz enter valid slots"}
    }

    
    console.log(limit)
    let get = await Appointment.findAll({
        where: {
            doctor_id: find.id,
            time_slot: param.slots,
            appointment_date:param.date
        }, raw: true
    }).catch((err) => {
        return { error: err }
    })
    if (!get || get.error ) {
        return { status: 501,error: "oops something went wrong" }
    }
    if(get.length >= limit){
        return { status:503,error: "All the slots are full please try again tommorrow"}
    }
    let assign = await Appointment.create({
        user_id: userData.id,
        doctor_id: find.id,
        time_slot: param.slots,
        appointment_date: param.date,
        appointment_status:1,
        payment_status:0
    }).catch((err) => {
        return { error: err }
    })
    if (!assign || assign.error) {
        return { status:500,error: "Internal Server Error" }
    }
    return { status:200,data: `Your Appointment is Under process for tomorrow ${tomorrowDate} please wait for confirmation ` }
}

async function viewMyAppoint(userData){
    let find = await sequelize.query("SELECT appointment.id,doctor.name,appointment.time_slot,appointment.appointment_date, appointment.appointment_status, appointment.payment_status FROM appointment LEFT JOIN doctor ON doctor.id = appointment.doctor_id WHERE user_id=:key",{
        replacements:{key:userData.id},
        type:QueryTypes.SELECT
    }).catch((err)=>{
        return { error : err}
    })
    for(let a of find){
        a.appointment_status=(a.appointment_status==1)? "Appointment Booked but payment not done":(a.appointment_status==2)?"appointment booked & payment successfull":(a.appointment_status==3)?"appointment confirmed":(a.appointment_status==4)?"Appoint cancelled by admin":(a.appointment_status==5)?"Cancelled by you":(a.appointment_status==6)?"Appointment cancelled payment failed":"Not available";
        a.payment_status=(a.payment_status==0)?"Pending":(a.payment_status==1)?"Payment Successfull":(a.payment_status==2)?"Payment Failed":(a.payment_status==3)?"payment Cancelled":"Not Avialable";
    }
    console.log(find)
    if(!find || find.error){
        return {status:501, error:"Something went wrong please try again later"}
    }
    return {status:200, data :find}
}

function viewJoi(param){
    let schema = joi.object({
        doctor_id: joi.number().min(1),
        user_id:joi.number().min(1)
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
async function viewUserAppoint(param,userData){
    let check = viewJoi(param)
    if(!check || check.error){
        return { status:400, error:check.error}
    }
    let query = "SELECT user.name,doctor.name,appointment.id AS appointment_id,appointment.time_slot,appointment.appointment_date , appointment.appointment_status , appointment.payment_status FROM appointment LEFT JOIN Doctor ON appointment.doctor_id = doctor.id LEFT JOIN user ON appointment.user_id = user.id "
    if(param.doctor_id){
        query +=`WHERE appointment.doctor_id=${param.doctor_id}` 
        
    }
    if(param.user_id){
        query +=`WHERE appointment.user_id=${param.user_id}`
    }
    let find = await sequelize.query(query,{
        type:QueryTypes.SELECT
    }).catch((err)=>{
        return { error : err}
    })
    for(let a of find){
        a.appointment_status=(a.appointment_status==1)? "Appointment Booked but payment not done":(a.appointment_status==2)?"appointment booked & payment successfull":(a.appointment_status==3)?"appointment confirmed":(a.appointment_status==4)?"Appoint cancelled by admin":(a.appointment_status==5)?"Cancelled by you":(a.appointment_status==6)?"Appointment cancelled payment failed":"Not available";
        a.payment_status=(a.payment_status==0)?"Pending":(a.payment_status==1)?"Payment Successfull":(a.payment_status==2)?"Payment Failed":(a.payment_status==3)?"payment Cancelled":"Not Avialable";
    }
   
    if(!find || find.error){
        return { status: 400 , error:"Please provide correct information"}
    }
    return { status:200 , data: find}
}



function joiConfirm(param) {
    let schema = joi.object({
        appoitnment_id: joi.number().min(1).required(),
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

async function ConfirmAppointment(param,userData){
    let check = joiConfirm(param)
    if(!check || check.error){
        return { error: check.error}
    }
    let find = await Appointment.findOne({where:{id:param.appoitnment_id}}).catch((err)=>{
        return { error:err}
    })
    if(!find || find.error){
        return {
            status:404,
            error:"This appointment is not found"}
    }
    let confirm= await Appointment.update({appointment_status:3,payment_status:1,confirmedBy:userData.id}).catch((err)=>{
        return { error:err}
    })
    if(!confirm || confirm.error){
        return { status: 500, error:"Internal Server Error"}
    }
    return {status:200, data:"Request suceeded"}
}
module.exports = { appoint , viewMyAppoint, viewUserAppoint}