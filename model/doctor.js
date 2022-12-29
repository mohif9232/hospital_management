let doctor = require("../schema/doctor")
let joi = require("joi");
const Doctor = require("../schema/doctor");
const Slot = require("../schema/slot");
let = require("../schema/slot")



// for adding dr

function draddjoi(param) {
    let schema = joi.object({
        name: joi.string().max(30).min(1).required(),
        degree: joi.string().required(),
        specialization: joi.string().required(),
        fees: joi.number().required(),
        time_slots: joi.array().items({ slot: joi.string().required(), limit: joi.number().required() }).required(),
    }).options({ abortEarly: false })
    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        }
        return { error: error }
    }
    return { data: check.value }
}

async function addDr(param, image_path, userData) {
    let check = draddjoi(param)
    if (!check || check.error) {
        return { error: check.error }
    }
    let checkdr = await Doctor.findOne({
        where: {
            name: param.name,
            degree: param.degree
        }
    }).catch((err) => {
        return { error: err }
    })
    if (checkdr) {
        return { error: "Doctor already existed" }
    }
    let data = param.time_slots
    let newData = JSON.stringify(data)
    let add = await Doctor.create({
        name: param.name,
        degree: param.degree,
        specialization: param.specialization,
        fees: param.fees,
        advanced_fees: (param.fees / 2),
        time_slots: newData,
        image_path: image_path,
        createdBy: userData.id
    }).catch((err) => {
        return { error: err }
    })
    if (!add || add.error) {
        return { error: "Internal Server Error" }
    }
    return { data: "Added succesffullyy" }

}

//update user profile
function updatejoi(param) {
    let schema = joi.object({
        doctor_id: joi.number().min(1).required(),
        name: joi.string().max(30).min(1),
        degree: joi.string(),
        specialization: joi.string(),
        fees: joi.number(),
        time_slots: joi.array().items(joi.string().required()),
    }).options({ abortEarly: false })
    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        }
        return { error: error }
    }
    return { data: check.value }
}
async function updateDr(param, userData) {
    let check = updatejoi(param)
    if (!check || check.error) {
        return { error: check.error }
    }
    let find = await Doctor.findOne({ where: { id: param.doctor_id } }).catch((err) => {
        return { error: err }
    })
    if (!find || find.error) {
        return { error: "id not found" }
    }
    let data = param.time_slots
    let newData = data.toString()

    let update = await Doctor.update({
        name: param.name,
        degree: param.degree,
        specialization: param.specialization,
        fees: param.fees,
        advanced_fees: (param.fees / 2),
        time_slots: newData,
        updateBy: userData.id
    }, { where: { id: param.doctor_id } }).catch((err) => {
        return { error: err }
    })
    if (!update || update.error) {
        return { error: "Internal Error server" }
    }
    if (param.time_slots) {
        let done = await Slot.destroy({ where: { doctor_id: find.id } }).catch((err) => {
            return { error: err }
        })

        if (!done || done.error) {
            return { error: "Internal server Error" }
        }
        let slot = [];
        for (let a of param.time_slots) {
            slot.push({ doctor_id: find.id, time_slot: a, is_available: true })
        }
        let add = await Slot.bulkCreate(slot).catch((err) => {
            return { error: err }
        })
        if (!add || add.error) {
            return { error: "Internal Server Error" }
        }
    }

    return { data: "Updated Successfullyy..." }
}

//for updating pic of dr

function picjoi(param) {
    let schema = joi.object({
        doctor_id: joi.number().min(1).required(),
    }).options({ abortEarly: false })
    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        }
        return { error: error }
    }
    return { data: check.value }
}

async function updateDrpic(param, image_path, userData) {
    let check = picjoi(param)
    if (!check || check.error) {
        return { error: check.error }
    }
    let find = await Doctor.findOne({ where: { id: param.doctor_id } }).catch((err) => {
        return { error: err }
    })
    if (!find || find.error) {
        return { error: "id not found" }
    }
    let update = await Doctor.update({
        image_path: image_path,
        updateBy: userData.id
    }, {
        where: {
            id: find.id
        }
    }).catch((err) => {
        return { error: err }
    })

    if (!update || update.error) {
        return { error: "Internal Server Error" }
    }
    return { data: " Profile pic updated successfullyyy..." }
}

//for unactive

function joimain(param) {
    let schema = joi.object({
        doctor_id: joi.number().max(100).min(0).required(),
        name: joi.string().max(100).min(0).required()

    }).options({ abortEarly: false })
    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        }
        return { error: error }
    }
    return { data: check.value }
}

async function drUnactive(param, userData) {
    let check = await joimain(param)
    if (check.error) {
        return { error: check.error }
    };
    let findpro = await Doctor.findOne({ where: { id: param.doctor_id, name: param.name } }).catch((err) => {
        return { error: err }
    })
    if (!findpro || findpro.error) {
        return { error: "Id and Name not matched" }
    }
    let updatepro = await Doctor.update({ is_available: false, updatedBy: userData.id }, { where: { id: findpro.id } }).catch((err) => {
        return { error: err }
    });
    if (!updatepro || updatepro.error) {
        return { error: "server error" }
    }
    return { data: "Doctor block succeesfuuly" }
}

//for activate


async function dractive(param, userData) {
    let check = await joimain(param)
    if (check.error) {
        return { error: check.error }
    };
    let findpro = await Doctor.findOne({ where: { id: param.doctor_id, name: param.name } }).catch((err) => {
        return { error: err }
    })
    if (!findpro || findpro.error) {
        return { error: "Id and Name not matched" }
    }
    let updatepro = await Doctor.update({ is_available: true, updatedBy: userData.id }, { where: { id: findpro.id } }).catch((err) => {
        return { error: err }
    });
    if (!updatepro || updatepro.error) {
        return { error: "server error" }
    }
    return { data: "Doctor  unblock succeesfuuly" }
}

//for delete

async function deletedr(param, userData) {
    let check = await joimain(param)
    if (check.error) {
        return { error: check.error }
    };
    let findpro = await Doctor.findOne({ where: { id: param.doctor_id, name: param.name } }).catch((err) => {
        return { error: err }
    })
    if (!findpro || findpro.error) {
        return { error: "Id and Name not matched" }
    }
    let updatepro = await Doctor.update({ is_available: false, is_deleted: true, updatedBy: userData.id }, { where: { id: findpro.id } }).catch((err) => {
        return { error: err }
    });
    if (!updatepro || updatepro.error) {
        return { error: "server error" }
    }
    return { data: "Doctor deleted succeesfuuly" }
}

//for undelete



async function undeletedr(param, userData) {
    let check = await joimain(param)
    if (check.error) {
        return { error: check.error }
    };
    let findpro = await Doctor.findOne({ where: { id: param.doctor_id, name: param.name } }).catch((err) => {
        return { error: err }
    })
    if (!findpro || findpro.error) {
        return { error: "Id and Name not matched" }
    }
    let updatepro = await Doctor.update({ is_available: true, is_deleted: false, updatedBy: userData.id }, { where: { id: findpro.id } }).catch((err) => {
        return { error: err }
    });
    if (!updatepro || updatepro.error) {
        return { error: "server error" }
    }
    return { data: "Doctor undeleted succeesfuuly" }
}

//find view

function joiview(param) {
    let schema = joi.object({
        doctor_id: joi.number().max(100).min(0),
        name: joi.string().max(100).min(0),

    }).options({ abortEarly: false })
    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        }
        return { error: error }
    }
    return { data: check.value }
}

async function find(param) {
    let check = joiview(param)
    if (!check || check.error) {
        return { error: check.error }
    }
    let query = {};
    if (param.doctor_id) {
        query = { id: param.doctor_id }
    }
    if (param.name) {
        query = { name: param.name }
    }
    let find = await Doctor.findAll({ attributes: ["name", "degree", "specialization", "image_path", "fees", "advanced_fees", "is_available","time_slots"], where: query, raw: true }).catch((err) => {
        return { error: err }
    })
   
    for (let i of find) {
        let data= JSON.parse(i.time_slots)
        let slot = []
        for(let a of data){
            slot.push(a.slot)
        }
        i.time_slots= slot
        i.is_available = i.is_available == 1 ? "available" : "Not available";
        
    }
    if (!find || find.error || find.length == 0) {
        return { error: "OOps cant find" }
    }
    return { data: find }
}

module.exports = { addDr, updateDr, updateDrpic, deletedr, undeletedr, dractive, drUnactive, find }