let { appoint } = require("../model/appointment")


async function appointment(request, response) {
    let check = await appoint(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    console.log(check)
    if (!check || check.error) {
        return response.status(500).send({ error: check.error })
    }
    return response.status(200).send({ data: check.data })
}


module.exports = { appointment }