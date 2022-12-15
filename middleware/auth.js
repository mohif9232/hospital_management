
let { sequelize, QueryTypes } = require("../init/dbconnect")
let jwt = require("jsonwebtoken")
let { secretKey } = require("../config/constant")

function auth(permission) {
    return async function (request, response, next) {
        if (!request.headers || !request.headers.token) {
            return response.status(401).send("Token NOT FOUND")
        }
        let verify = '';
        try {
            verify = jwt.verify(request.headers.token, secretKey)
        } catch (error) {
            if (!verify || verify.error) {
                return response.status(402).send("Token Invalid")
            }
        }


        let user = await sequelize.query(`SELECT user.name, permission.permission as permission FROM user LEFT JOIN user_permission ON user.id = user_permission.user_id LEFT JOIN permission ON  user_permission.permission_id = permission.id WHERE user.id=:key`, {
            replacements: { key: verify.id },
            type: QueryTypes.SELECT
        }).catch((err) => {
            return { error: err }
        });

        if (!user || (user && user.error)) {
            return response.status(401).send({ error: "User Not Found" })
        }
        let userpermission = {};
        for (let data of user) {
            userpermission[data.permission] = 1
        }

        if (permission && !userpermission[permission]) {
            return response.status(401).send("Access denied")
        }

        request.userData = { id: verify.id, name: user[0].name, permission: userpermission }

        next();
    }

}

module.exports = { auth }