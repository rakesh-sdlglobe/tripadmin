const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/database');

const FlightStatus = sequelize.define('FlightStatus', {
    status_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
   Types.STRING(50),
        allowNull: false
    }, flight_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Flight', 
            key: 'flight_id' 
        }
    },
    status: {
        type: Data
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'flight_status',
    timestamps: false
});

module.exports = FlightStatus;
