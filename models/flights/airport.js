const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/database');

const Airport = sequelize.define('Airport', {
    airport_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    airport_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    airport_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'airports',
    timestamps: false
});

module.exports = Airport;
