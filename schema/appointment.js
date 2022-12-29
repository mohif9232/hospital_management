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
    time_slot: {
        type: DataTypes.STRING,
        allowNull: false
    },
    appointment_date: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    appointment_status:{
        type:DataTypes.INTEGER,
        defaultValue:1
    },
    payment_status:{
        type:DataTypes.INTEGER,
        defaultValue:0
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