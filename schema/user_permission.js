let { sequelize, DataTypes, Model, Op } = require("../init/dbconnect");
class User_permissiion extends Model { }
User_permissiion.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    modelName: "User_permission",
    tableName: "user_permission",
    sequelize
})


module.exports = { User_permissiion, Op }