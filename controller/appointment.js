
let { appoint , viewMyAppoint, viewUserAppoint} = require("../model/appointment")


async function appointment(request, response) {
    let check = await appoint(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return response.status(check.status).send({ error: check.error })
    }
    return response.status(check.status).send({ data: check.data })
}

async function appointMyView(request, response) {
    let check = await viewMyAppoint(request.userData).catch((err) => {
        return { error: err }
    })
    
    if (!check || check.error) {
        return response.status(check.status).send({ error: check.error })
    }
    return response.status(check.status).send({ data: check.data })
}

async function ViewAllappointment(request, response) {
    let check = await viewUserAppoint(request.body,request.userData).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return response.status(check.status).send({ error: check.error })
    }
    return response.status(check.status).send({ data: check.data })
}


module.exports = { appointment ,appointMyView , ViewAllappointment}