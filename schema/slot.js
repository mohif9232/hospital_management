let { sequelize, DataTypes, Model } = require("../init/dbconnect")

class Slot extends Model { }

Slot.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    time_slot: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    updatedAt: false,
    createdAt: false,
    modelName: "Slot",
    tableName: "slot",
    sequelize

})

module.exports = Slot