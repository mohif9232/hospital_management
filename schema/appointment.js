const { date } = require("joi")
let { sequelize, DataTypes, Model, QueryTypes } = require("../init/dbconnect")

class Appointment extends Model { }

Appointment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    confirmedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cancelledBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    modelName: "Appointment",
    tableName: "appointment",
    sequelize
})

module.exports = { Appointment }