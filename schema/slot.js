let { sequelize, DataTypes, Model } = require("../init/dbconnect")

class Slot extends Model { }

Slot.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    slot_time: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    modelName: "Slot",
    tableName: "slot",
    sequelize
})

module.exports = Slot