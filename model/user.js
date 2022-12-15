let { User } = require("../schema/user")
let joi = require("joi")
let bcrypt = require("bcrypt")
let jwt = require("jsonwebtoken")
let Permission = require("../schema/permission")
let { User_permissiion, Op } = require("../schema/user_permission")
let { email } = require("../helper/email")


//for register of user 


async function checkregister(param) {
    let schema = joi.object({
        name: joi.string().max(30).min(3).required(),
        username: joi.string().email({ tlds: { allow: ['com', 'net', 'in'] } }).max(30).min(3).required(),
        password: joi.string().max(200).min(3).required(),
        confirm_password: joi.any().valid(joi.ref("password")).required(),
        mobile_no: joi.number().min(4).max(11).required()
    }).options({
        abortEarly: false
    })

    let check = await schema.validate(param)

    if (!check || check.error) {
        let errors = []
        for (let err of check.error.details) {
            errors.push(err.message)
        }
        return { error: errors }
    }
    return { data: check.value }
}

async function registerpatient(param) {
    let valid = await checkregister(param).catch((err) => {
        return { error: err }
    })
    if (!valid || valid.error) {
        return { error: valid.error }
    }


    let checkpatient = await User.findOne({ where: { username: param.username } }).catch((error) => {
        return { error }
    })
    if (checkpatient) {
        return { error: "This user is already existed" }
    }
    param.password = await bcrypt.hash(param.password, 10).catch((err) => {
        return { error: err }
    })
    let adduser = await User.create({
        name: param.name,
        username: param.username,
        password: param.password,
        mobile_no: param.mobile_no
    }).catch((err) => {
        return { error: err }
    })

    if (!adduser || adduser.error) {
        return { error: "Internal Server Error" }
    }

    let givepermission = await User_permissiion.create({
        user_id: adduser.id,
        permission_id: 1
    }).catch((err) => {
        return { error: err }
    });
    if (!givepermission || givepermission.error) {
        return { error: "Something Went Wrong" }
    }
    return { data: "registered Successfully" }
}

//for login of user

async function checklogin(param) {
    let schema = joi.object({
        username: joi.string().max(30).min(3).email().required(),
        password: joi.string().max(200).min(3).required(),
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        };
        return { error: error }
    }
    return { data: check.value }
}

async function loginpatient(param) {
    let check = await checklogin(param).catch((err) => {
        return { error: err }
    });
    if (!check || check.error) {
        return { error: check.error }
    }
    let checkpatient = await User.findOne({ where: { username: param.username }, raw: true }).catch((err) => {
        return { error: err }
    })
    if (!checkpatient || checkpatient.error) {
        return { error: "Username Not Found" }
    }
    if (checkpatient.is_deleted == 1) {
        return { error: "Your account is temporary deactivated please try again later" }
    }
    if (checkpatient.is_active == 0) {
        return { error: "Your account is temporaryy blocked please try again later" }
    }
    if (checkpatient.is_deletedBy_user == true) {
        return { error: "Your account is deactivate by you please activate again" }
    }
    let checkpass = await bcrypt.compare(param.password, checkpatient.password).catch((err) => {
        return { error: err }
    });
    if (!checkpass || checkpass.error) {
        return { error: "Username & password Invalid" }
    }

    let token = jwt.sign({ id: checkpatient.id }, secretKey, { expiresIn: "1d" })
    if (!token || token.error) {
        return { error: "Internal Server Error" }
    }
    return { data: "Login succeefully", token }
}



//about me

async function getme(userData) {

    let findme = await User.findOne({ attributes: ["name", "username", "mobile_no"], where: { id: userData.id } }).catch((err) => {
        return { error: err }
    });
    if (!findme || findme.error) {
        return { error: "Internal Server Error" }
    }
    return { data: findme }
}

//for forget password

async function checkforget(param) {
    let schema = joi.object({
        username: joi.string().max(300).min(1).required()
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        };
        return { error: error }
    }
    return { data: check.value }
}

async function forget(param) {
    let check = await checkforget(param).catch((err) => {
        return { error: err }
    })
    console.log(check)
    if (!check || check.error) {
        return { error: check.error }
    }
    let getuser = await User.findOne({ where: { username: param.username } }).catch((err) => {
        return { error: err }
    })
    if (!getuser || getuser.error) {
        return { error: "username not found" }
    }
    let token = randomstring.generate(10)
    let addtoken = await User.update({ token: token }, { where: { id: getuser.id } }).catch((err) => {
        return { error: err }
    })
    if (!addtoken || addtoken.error) {
        return { error: addtoken.error }
    }
    let mailoption = {
        from: "mohif.waghu@somaiya.edu",
        to: getuser.username,
        subject: "forget password token",
        text: "for reset your password please use this token:" + token
    };
    let sendmail = await email(mailoption).catch((err) => { return { error: err } });
    if (!sendmail || sendmail.error) {
        return { error: sendmail }
    }

    return { data: sendmail }

}

//for reset password

async function checkreset(param) {
    let schema = joi.object({
        token: joi.string().max(200).min(1).required(),
        newpassword: joi.string().max(20).min(3).required()
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        };
        return { error: error }
    }
    return { data: check.value }
}
async function reset(param) {
    let check = await checkreset(param).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return { error: check.error }
    }
    let verifytoken = await User.findOne({ where: { token: param.token } }).catch((err) => {
        return { error: err }
    });
    if (!verifytoken || (verifytoken && verifytoken.error)) {
        return { error: "Token not valid please provide valid token" }

    }

    let resetpass = await User.update({ password: await bcrypt.hash(param.newpassword, 10) }, { where: { id: verifytoken.id } }).catch((err) => {
        return { error: err }
    });
    if (!resetpass || (resetpass && resetpass.error)) {
        return { error: resetpass.error }
    }

    let emptytoken = await User.update({ token: "" }, { where: { id: verifytoken.id } }).catch((err) => {
        return { error: err }
    })
    if (!emptytoken || emptytoken.error) {
        return { error: "Internal Server Error" }
    }
    return { data: "Password reset successfully", resetpass }

}


//for change password

async function changepass(param) {
    let schema = joi.object({
        password: joi.string().max(20).min(3).required(),
        newpassword: joi.string().max(20).min(3).required()
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        };
        return { error: error }
    }
    return { data: check.value }
}

async function change(param, userData) {
    let check = await changepass(param).catch((err) => {
        return { error: err }
    });
    if (!check || check.error) {
        return { error: check.error }
    }
    let findpass = await User.findOne({ where: { id: userData.id } }).catch((err) => {
        return { error: err }
    })
    if (!findpass || findpass.error) {
        return { error: "username is incorrect" }
    };
    let checkpass = await bcrypt.compare(param.password, findpass.password).catch((err) => {
        return { error: err }
    });

    if (!checkpass || (checkpass && checkpass.error)) {
        return { error: "Invalid Username & password" }
    }
    let changepassword = await User.update({ password: await bcrypt.hash(param.newpassword, 10) }, {
        where: {
            id: findpass.id
        }
    }).catch((err) => {
        return { error: err }
    });
    console.log(changepassword)

    if (!changepassword || changepassword.error) {
        return { error: "internal server error" }
    }
    return { data: "password changed successfully" }
}

//for update user by themselves

async function checkupdate(param) {
    let schema = joi.object({
        name: joi.string().max(30).min(2),
        username: joi.string().max(30).min(3),
        mobile_no: joi.string().max(11).min(5)
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        }
        return { error: check.error }
    }
    return { data: check.value }
}

async function updateprofile(param, userData) {
    let check = await checkupdate(param).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return { error: check.error }
    }
    let finduser = await User.findOne({ where: { id: userData.id } }).catch((err) => {
        return { error: err }
    });
    if (!finduser || (finduser && finduser.error)) {
        return { error: "ID not found" }
    }
    let updatename = await User.update(param, { where: { id: finduser.id } }).catch((err) => {
        return { error: err }
    });
    if (!updatename || (updatename && updatename.error)) {
        return { error: "Internal Server Error" }
    }
    return { data: " Your Profile Updated Successfully" }
}


//for deactivate account
async function checkupdate(param) {
    let schema = joi.object({
        name: joi.string().max(30).min(2),
        username: joi.string().max(30).min(3),
        mobile_no: joi.string().max(11).min(5)
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        }
        return { error: check.error }
    }
    return { data: check.value }
}

//deactivate me


async function deactivate(userData) {
    let finduser = await User.findOne({ where: { id: userData.id } }).catch((err) => {   //id ke jagah token baadme
        return { error: err }
    });
    if (!finduser || (finduser && finduser.error)) {
        return { error: "Invalid Token" }
    }
    let update = await User.update({ is_deletedBy_user: true }, { where: { id: finduser.id } }).catch((err) => {
        return { error: err }
    });
    if (!update || update.error) {
        return { error: "Internal Server Error" }
    }
    return { data: "You are deactivate successfully " }

}

//activate me

function joiActivate(param) {
    let schema = joi.object({
        username: joi.string().max(30).min(5).required(),
        password: joi.string().max(20).min(2).required()
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


async function activate(param) {
    let check = joiActivate(param)
    if (!check || check.error) {
        return { error: check.error }
    }
    let find = await User.findOne({ where: { username: param.username }, raw: true }).catch((err) => {
        return { error: err }
    })
    if (!find || find.error) {
        return { error: "Username & password not matched" }
    }
    let compare = await bcrypt.compare(param.password, find.password).catch((err) => {
        return { error: err }
    })
    if (!compare || compare.error) {
        return { error: "Username & password not matched" }
    }
    let activate = await User.update({ is_deletedBy_user: false }, { where: { id: find.id } }).catch((err) => {
        return { error: err }
    })
    if (!activate || activate.error) {
        return { error: "Internal Server Error" }
    }
    return { data: "Successfully activate your account you can log in now" }
}

/* for admin */

//get all user
async function checkbody(param) {
    let schema = joi.object({
        user_id: joi.number().max(300).min(0),
        name: joi.string().max(30).min(1),
        username: joi.string().max(30).min(3),
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        };
        return { error: error }
    }
    return { data: check.value }
}

async function findall(param) {
    let check = await checkbody(param).catch((err) => {
        return { error: err }
    });
    if (!check || check.error) {
        return { error: check.error }
    }
    let query = {};
    if (param.user_id) {
        query = { where: { id: param.id } }
    }
    if (param.name) {
        query = { where: { name: param.name } }
    }
    if (param.username) {
        query = { where: { username: param.username } }
    }

    let alluser = await User.findAll(query).catch((err) => {
        return { error: err }
    })

    if (!alluser || (alluser && alluser.error) || alluser.length == 0) {
        return { error: "Cant find user" }
    }
    return { data: alluser }
};


//for assigning permission

async function check(param) {
    let schema = joi.object({
        user_id: joi.number().max(30).min(0).required(),
        permission: joi.array().items(joi.number().min(0)).required()
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        };
        return { error: error }
    }
    return { data: check.value }
}

async function assignpermission(param, userData) {
    let checkbody = await check(param).catch((err) => {
        return { error: err }
    })
    if (!checkbody || (checkbody && checkbody.error)) {
        return { error: checkbody.error }
    };
    let user = await User.findOne({ where: { id: param.user_id } }).catch((err) => {
        return { error: err }
    });

    if (!user || (user && user.error)) {
        return { error: " ID not Matched" }
    }

    let checkper = await Permission.findAll({
        where: {
            id: { [Op.in]: param.permission }
        }
    }).catch((err) => {
        return { error: err }
    })
    if (!checkper || checkper.error) {
        return { error: checkper.error }
    }
    if (checkper.length != param.permission.length) {
        return { error: "Invalid Permissions" }
    }
    let pers = [];
    for (let i of param.permission) {
        pers.push({ user_id: user.id, permission_id: i, createdBy: userData.id })
    }
    let perData = await User_permissiion.bulkCreate(pers).catch((err) => {
        return { error: err }
    });
    if (!perData || (perData && perData.error)) {
        return { error: "Internal Server Error" }
    }
    return { data: "sucess" }

}


//for update user

async function checkupdate(param) {
    let schema = joi.object({
        user_id: joi.number().max(300).min(0).required(),
        name: joi.string().max(30).min(1),
        username: joi.string().max(30).min(3),
        mobile_no: joi.string().max(10).min(4)
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        };
        return { error: error }
    }
    return { data: check.value }
}

async function update(param, userData) {
    let check = await checkupdate(param).catch((err) => {
        return { error: err }
    });
    if (!check || check.error) {
        return { error: check.error }
    }
    let finduser = await User.findOne({ where: { id: param.user_id } }).catch((err) => {
        return { error: err }
    })
    if (!finduser || finduser.error) {
        return { error: "Id not found" }
    }
    let updateuser = await User.update({
        name: param.name,
        username: param.username,
        mobile_no: param.mobile_no,
        updatedBy: userData.id
    }, { where: { id: finduser.id } }).catch((err) => {
        return { error: err }
    });
    if (!updateuser || updateuser.error) {
        return { error: " Internal Server Error" }
    }
    return { data: "Updated Successfully" }
}


//get the permissions of the user

async function checkuser(param) {
    let schema = joi.object({
        user_id: joi.number().max(100).min(1).required(),
        name: joi.string().max(30).min(1)
    }).options({
        abortEarly: false
    });

    let check = schema.validate(param)
    if (check.error) {
        let error = [];
        for (let err of check.error.details) {
            error.push(err.message)
        };
        return { error: error }
    }
    return { data: check.value }
}


async function getpermission2(param) {
    let jo = await checkuser(param).catch((err) => {
        return { error: err }
    });
    if (!jo || jo.error) {
        return { error: jo.error }
    }

    let check = await User.findOne({ where: { id: param.user_id } }).catch((err) => {
        return { error: err }
    });
    console.log(check)
    if (!check || check.error) {
        return { error: "id not found" }
    }
    let [result] = await User.sequelize.query("SELECT user.id , user.name , GROUP_CONCAT(permission.permission) AS permission FROM user LEFT JOIN user_permission ON user.id = user_permission.user_id LEFT JOIN permission ON permission.id=user_permission.permission_id WHERE user.id = :key GROUP BY user.id", {
        replacements: { key: param.user_id },
        type: QueryTypes.SELECT
    }).catch((err) => {
        return { error: err }
    })
    let permission = result
    if (!permission || permission.error) {
        return { error: permission.error }

    }
    return { data: permission }
}


//get all the permission from the table

async function getpermission(param) {

    let permission = await User.sequelize.query("SELECT * FROM permission", { type: QueryTypes.SELECT }).catch((err) => {
        return { error: err }
    })

    if (!permission || permission.error) {
        return { error: permission.error }

    }

    return { data: permission }
}

//for soft delete the user

async function checkdelete(param) {
    let schema = joi.object({
        user_id: joi.number().max(100).min(0).required(),
        name: joi.string().max(30).min(1).required(),
    }).options({ abortEarly: false })

    let check = schema.validate(param);
    if (!check || check.error) {
        let error = [];
        for (let a of check.error.details) {
            error.push(a.message)
        }
        return { error: error };
    }
    return { data: check.value }
}




async function softdelete(param, userData) {
    let check = await checkdelete(param).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return { error: check.error }
    };

    let finduser = await User.findOne({
        where: {
            id: param.user_id,
            name: param.name
        }
    }).catch((err) => {
        return { error: err }
    });
    if (!finduser || (finduser && finduser.error)) {
        return { error: "Id and Name not matched" }
    }
    let update = await User.update({ is_deleted: true, is_active: false, updatedBy: userData.id }, {
        where: {
            id: finduser.id
        }
    }).catch((err) => {
        return { error: err }
    });

    if (!update || update.error) {
        return { error: " Internal Server Error" }
    }

    return { data: "Your request succeessfully updated" }
}


//for undo the soft delete

async function checkundelete(param) {
    let schema = joi.object({
        user_id: joi.number().max(100).min(0).required(),
        name: joi.string().max(30).min(1).required(),
    }).options({ abortEarly: false })

    let check = schema.validate(param);
    if (!check || check.error) {
        let error = [];
        for (let a of check.error.details) {
            error.push(a.message)
        }
        return { error: error };
    }
    return { data: check.value }
}


async function softundelete(param, userData) {
    let check = await checkundelete(param).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return { error: check.error }
    };

    let finduser = await User.findOne({
        where: {
            id: param.user_id,
            name: param.name
        }
    }).catch((err) => {
        return { error: err }
    });
    if (!finduser || (finduser && finduser.error)) {
        return { error: "Id and Name not matched" }
    }
    let update = await User.update({ is_deleted: false, is_active: true, updatedBy: userData.id }, {
        where: {
            id: finduser.id
        }
    }).catch((err) => {
        return { error: err }
    });

    if (!update || update.error) {
        return { error: " Internal Server Error" }
    }

    return { data: "Your request succeessfully updated" }
}


//for unblock the block user

async function checkactive(param) {
    let schema = joi.object({
        user_id: joi.number().max(100).min(0).required(),
        name: joi.string().max(30).min(1).required()
    }).options({ abortEarly: false })

    let check = schema.validate(param);
    if (!check || check.error) {
        let error = [];
        for (let a of check.error.details) {
            error.push(a.message)
        }
        return { error: error };
    }
    return { data: check.value }
}


async function active(param, userData) {
    let check = await checkactive(param).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return { error: check.error }
    };

    let finduser = await User.findOne({
        where: {
            id: param.user_id,
            name: param.name
        }
    }).catch((err) => {
        return { error: err }
    });
    if (!finduser || (finduser && finduser.error)) {
        return { error: "Id and Name not matched" }
    }
    let update = await User.update({ is_active: true, updatedBy: userData.id }, {
        where: {
            id: finduser.id,
        }
    }).catch((err) => {
        return { error: err }
    });

    if (!update || update.error) {
        return { error: " Internal Server Error" }
    }

    return { data: "Your request succeessfully updated" }
}

//for block the user

async function checkunactive(param) {
    let schema = joi.object({
        user_id: joi.number().max(100).min(0).required(),
        name: joi.string().max(30).min(1).required()
    }).options({ abortEarly: false })

    let check = schema.validate(param);
    if (!check || check.error) {
        let error = [];
        for (let a of check.error.details) {
            error.push(a.message)
        }
        return { error: error };
    }
    return { data: check.value }
}


async function unactive(param, userData) {
    let check = await checkunactive(param).catch((err) => {
        return { error: err }
    })
    if (!check || check.error) {
        return { error: check.error }
    };

    let finduser = await User.findOne({
        where: {
            id: param.user_id,
            name: param.name
        }
    }).catch((err) => {
        return { error: err }
    });
    if (!finduser || (finduser && finduser.error)) {
        return { error: "Id and Name not matched" }
    }
    let update = await User.update({ is_active: false, updatedBy: userData.id }, {
        where: {
            id: finduser.id,
        }
    }).catch((err) => {
        return { error: err }
    });

    if (!update || update.error) {
        return { error: " Internal Server Error" }
    }

    return { data: "Your request succeessfully updated" }
}
module.exports = {
    registerpatient,
    loginpatient,
    getme,
    forget,
    reset,
    change,
    updateprofile,
    deactivate,
    activate,
    assignpermission,
    findall,
    update,
    getpermission,
    getpermission2,
    softdelete,
    softundelete,
    unactive,
    active
}