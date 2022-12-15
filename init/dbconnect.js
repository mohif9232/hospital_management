let { Sequelize, DataTypes, Model, QueryTypes, Op } = require("sequelize")

let sequelize = new Sequelize("mysql://root:@localhost/hospital_management_system")

sequelize.authenticate().then(() => {
    console.log("Connected")
}).catch((err) => {
    console.log("Unable to connect")
})



module.exports = {
    sequelize,
    DataTypes,
    Model,
    QueryTypes,
    Op
}