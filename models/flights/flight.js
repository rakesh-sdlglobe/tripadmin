const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/database');

const Flight = sequelize.define('flight', {
    flight_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    flight_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    airline: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    departure_airport_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    arrival_airport_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    departure_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    arrival_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total_seats: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'flight',
    timestamps: false
});

module.exports = Flight;
