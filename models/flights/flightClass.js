const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/database');

const FlightClass = sequelize.define('FlightClass', {
    class_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    class_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'flight_classes',
    timestamps: false
});

module.exports = FlightClass;
