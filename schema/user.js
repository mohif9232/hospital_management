let { sequelize, DataTypes, Model } = require("../init/dbconnect");
class User extends Model { }

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profile_pic_path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.INTEGER,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.INTEGER,
        defaultValue: true,
    },
    is_deletedBy_user: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    modelName: "User",
    tableName: "user",
    sequelize
})

module.exports = { User }