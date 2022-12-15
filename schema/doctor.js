let { sequelize, DataTypes, Model } = require("../init/dbconnect")

class Doctor extends Model { }

Doctor.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    degree: {
        type: DataTypes.STRING,
        allowNull: false
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: false
    },
    appointment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            max: 9,
        }
    },
    image_path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fees: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_deleted: {
        type: DataTypes.STRING,
        defaultValue: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    modelName: "Doctor",
    tableName: "doctor",
    sequelize
})

module.exports = Doctor