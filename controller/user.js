let { registerpatient, loginpatient, getme, forget, reset, change, updateprofile, deactivate, activate, assignpermission, findall, update, getpermission, getpermission2, softdelete, softundelete, unactive, active } = require("../model/user")
let excel = require("../helper/excel")

async function register(request, response) {
    let patient = await registerpatient(request.body).catch((err) => {
        return { error: err }
    })
    if (!patient || patient.error) {
        return response.status(500).send({ error: patient.error })
    }
    return response.send(patient)
}

async function login(request, response) {
    let patient = await loginpatient(request.body).catch((err) => {
        return { error: err }
    })
    if (!patient || patient.error) {
        return response.status(401).send({ error: patient.error })
    }
    return response.send({ data: patient })
}


async function about_me(request, response) {
    let get = await getme(request.userData).catch((err) => {
        return { error: err }
    })
    if (!get || get.error) {
        return response.status(401).send({ error: get.error })
    }
    return response.send({ data: get })
}

async function forgetpassword(request, response) {
    let userpass = await forget(request.body, next).catch((err) => {
        return { error: err }
    })
    if (!userpass || (userpass && userpass.error)) {
        return response.status(401).send({ error: userpass.error })
    }
    return response.send({ data: userpass });
}


async function resetpassword(request, response) {
    let userpass = await reset(request.body).catch((err) => {
        return { error: err }
    })
    console.log(userpass)
    if (!userpass || (userpass && userpass.error)) {
        return response.status(401).send({ error: userpass.error })
    }
    return response.send({ data: userpass })
}


async function changepassword(request, response) {
    let check = await change(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return response.status(402).send({ error: check.error })
    }
    return response.send({ data: check })
}

async function updatemyprofile(request, response) {
    let check = await updateprofile(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    console.log(check)
    if (!check || check.error) {
        return response.status(402).send({ error: check.error })
    }
    return response.send({ data: check })
}

async function deactivateme(request, response) {
    let check = await deactivate(request.userData).catch((err) => {
        return { error: err }
    });

    if (!check || check.error) {
        return response.status(401).send({ error: check.error })
    };
    return response.send({ data: check })
}

async function activateme(request, response) {
    let check = await activate(request.body).catch((err) => {
        return { error: err }
    });

    if (!check || check.error) {
        return response.status(401).send({ error: check.error })
    };
    return response.send({ data: check })
}


//admin


async function addpermission(request, response) {
    let task = await assignpermission(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    console.log(task)
    if (!task || (task && task.error)) {
        return response.status(401).send({ error: task.error })
    }
    return response.send({ data: task })
}


async function finduser(request, response) {
    let task = await findall(request.body).catch((err) => {
        return { error: err }
    })
    if (!task || (task && task.error)) {
        return response.status(401).send({ error: task.error })
    }
    return response.send({ data: task })
}

async function updateuser(request, response) {
    let task = await update(request.body, request.userData).catch((err) => {
        return { error: err }
    })

    if (!task || (task && task.error)) {
        return response.status(401).send({ error: task.error })
    }
    return response.send({ data: task })
}

async function permission(request, response) {
    let task = await getpermission().catch((err) => {
        return { error: err }
    })
    if (!task || (task && task.error)) {
        return response.status(401).send({ error: task.error })
    }
    return response.send(task)
}
async function userpermission(request, response) {
    let task = await getpermission2(request.body).catch((err) => {
        return { error: err }
    })

    if (!task || (task && task.error)) {
        return response.status(401).send({ error: task.error })
    }
    return response.send(task)
}


async function softdeleteuser(request, response) {
    let done = await softdelete(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!done || done.error) {
        return response.status(401).send({ error: done.error })
    };
    return response.send({ data: done })
}

async function softundeleteuser(request, response) {
    let done = await softundelete(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!done || done.error) {
        return response.status(401).send({ error: done.error })
    };
    return response.send({ data: done })
}

async function activeuser(request, response) {
    let done = await active(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!done || done.error) {
        return response.status(401).send({ error: done.error })
    };
    return response.send({ data: done })
}
async function unactiveuser(request, response) {
    let done = await unactive(request.body, request.userData).catch((err) => {
        return { error: err }
    })
    if (!done || done.error) {
        return response.status(401).send({ error: done.error })
    };
    return response.send({ data: done })
}

// export userss

async function exporUsert(request, response) {
    let find = await User.findAll({ raw: true }).catch((err) => {
        return { error: err }
    })
    if (!find || find.error) {
        return response.status(500).send({ error: "Internal server Error" })
    }
    let columns = [
        { header: 'id', key: 'id', width: 10 },
        { header: 'name', key: 'name', width: 10 },
        { header: 'username', key: 'username', width: 10 },
        { header: 'phone', key: 'phone', width: 10 },
    ]

    let filename = "users";

    await excel(request, response, filename, columns, find).then((data) => {
        return { data: data }
    }).catch((err) => {
        return { error: err }
    })

}

module.exports = { register, login, forgetpassword, about_me, resetpassword, changepassword, updatemyprofile, deactivateme, activateme, addpermission, finduser, updateuser, permission, userpermission, softdeleteuser, softundeleteuser, activeuser, unactiveuser, exporUsert }