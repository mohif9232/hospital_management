let { register, login, forgetpassword, about_me, resetpassword, changepassword, updatemyprofile, deactivateme, activateme, addpermission, finduser, updateuser, permission, userpermission, softdeleteuser, softundeleteuser, activeuser, unactiveuser, exporUsert } = require("../controller/user")

let { AddDr, update, updatePic, Delete, unDelete, activate, unActive, view, exporDr } = require("../controller/doctor")
let { appointment } = require("../controller/appointment")

let { auth } = require("../middleware/auth")
require("express-async-errors")
let { errorhandler } = require("../middleware/errorhandling")
let express = require("express")
let app = express();

//user 
app.post("/api/v1/register", register)
app.post("/api/v1/login", login)

app.post("/api/v1/forget_password", forgetpassword)
app.put("/api/v1/reset", resetpassword)

app.get("/api/v1/user/about_me", auth("User"), about_me)
app.put("/api/v1/user/update_myprofile", auth("User"), updatemyprofile)
app.post("/api/v1/user/change_password", auth("User"), changepassword)

app.put("/api/v1/user/deactivate_me", auth("User"), deactivateme)
app.put("/api/v1/activate_me", activateme)

app.post("/api/v1/user/book_appointment", auth("User"), appointment)


//admin

app.get("/api/v1/user/view_user", auth("viewPatint"), finduser)
app.put("/api/v1/user/update_user", auth("updateUser"), updateuser)

app.get("/api/v1/user/get_permission", auth("assignPermission"), permission)
app.get("/api/v1/user/user_permission", auth("assignPermission"), userpermission)
app.post("/api/v1/user/assign_permission", auth("assignPermission"), addpermission)

app.delete("/api/v1/user/delete_user", auth("removePatient"), softdeleteuser)
app.put("/api/v1/user/undelete_user", auth("removePatient"), softundeleteuser)

app.put("/api/v1/user/activate_user", auth("blockPatient"), activeuser)
app.put("/api/v1/user/unactivate_user", auth("viewPatint"), unactiveuser)

app.get("/api/v1/user/export_user", auth("viewPatint"), exporUsert)

app.post("/api/v1/user/add_doctor", auth("addDr"), AddDr)
app.put("/api/v1/user/update_doctor", auth("updateDr"), update)

app.put("/api/v1/user/update_doctor_pic", auth("updateDr"), updatePic)

app.get("/api/v1/user/view_doctor", view)

app.delete("/api/v1/user/delete_doctor", auth("removeDr"), Delete)
app.delete("/api/v1/user/undelete_doctor", auth("removeDr"), unDelete)

app.put("/api/v1/user/activate_doctor", auth("blockDr"), activate)
app.put("/api/v1/user/unactivate_doctor", auth("blockDr"), unActive)

app.get("/api/v1/user/export_doctor", auth("exportDr"), exporDr)

app.use(errorhandler)

module.exports = app

























