let { addDr, updateDr, updateDrpic, deletedr, undeletedr, dractive, drUnactive, find } = require("../model/doctor")
let uploads = require("../helper/file");
const Doctor = require("../schema/doctor");
let excel = require("../helper/excel")

async function AddDr(request, response) {
    let addpic = await uploads(request, response, [{ name: "doctor", maxCount: 3 }], { destination: "./doctor-images/", filesize: 3 * 1000 * 1000 }).catch((err) => {
        return { error: err }
    });
    if (!addpic || addpic.error) {
        return response.status(500).send("something went wrong")
    }

    let data = [];
    for (let i of addpic.doctor) {
        data.push(i.path)
    }
    let path = data.join("   AND  ")
    console.log(path)
    let add = await addDr(request.body, path, request.userData).catch((err) => {
        return { error: err }
    })

    if (!add || add.error) {
        return response.status(500).send({ error: add.error })
    }
    return response.status(200).send({ data: add.data })
}

async function update(request, response) {

    let add = await updateDr(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!add || add.error) {
        return response.status(500).send(add.error)
    }
    return response.status(200).send(add.data)
}

async function updatePic(request, response) {
    let addpic = await uploads(request, response, [{ name: "doctor", maxCount: 3 }], { destination: "./doctor-images/", filesize: 3 * 1000 * 1000 }).catch((err) => {
        return { error: err }
    });
    if (!addpic || addpic.error) {
        return response.status(500).send("something went wrong")
    }
    let data = [];
    for (let i of addpic.doctor) {
        data.push(i.path)
    }
    let path = data.join("   AND  ")
    let update = await updateDrpic(request.body, path, request.userData).catch((err) => {
        return { error: err }
    })
    if (!update || update.error) {
        return response.status(500).send({ error: update.error })
    }
    return response.status(200).send({ data: update.data })

}

async function Delete(request, response) {
    let check = await deletedr(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    console.log(check)
    if (!check || check.error) {
        return response.status(500).send({ error: check.error })
    }
    return response.status(200).send(check.data)
}

async function unDelete(request, response) {
    let check = await undeletedr(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return response.status(500).send({ error: check.error })
    }
    return response.status(200).send(check.data)
}

async function activate(request, response) {
    let check = await dractive(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return response.status(500).send({ error: check.error })
    }
    return response.status(200).send(check.data)
}
async function unActive(request, response) {
    let check = await drUnactive(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return response.status(500).send({ error: check.error })
    }
    return response.status(200).send(check.data)
}

async function view(request, response) {
    let check = await find(request.body).catch((err) => {
        return { error: err }
    })
    console.log(check)
    if (!check || check.error) {
        return response.status(500).send({ error: check.error })
    }
    return response.status(200).send(check.data)
}

// export userss

async function exporDr(request, response) {
    let find = await Doctor.findAll({ raw: true }).catch((err) => {
        return { error: err }
    })
    if (!find || find.error) {
        return response.status(500).send({ error: "Internal server Error" })
    }
    let columns = [
        { header: 'id', key: 'id', width: 10 },
        { header: 'name', key: 'name', width: 10 },
        { header: 'degree', key: 'degree', width: 10 },
        { header: 'createdAt', key: 'createdAt', width: 10 },
    ]

    let filename = "doctors";

    await excel(request, response, filename, columns, find).then((data) => {
        return { data: data }
    }).catch((err) => {
        return { error: err }
    })

}
module.exports = { AddDr, update, updatePic, Delete, unDelete, activate, unActive, view, exporDr }