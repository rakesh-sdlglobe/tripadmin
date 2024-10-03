const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user');
const Train = require('./train');
const Seat = require('./seat');
const Station = require('./station');
const Route = require('./route');


const Booking = sequelize.define('Booking', {
  departure_date: { type: DataTypes.DATEONLY, allowNull: false },
  arrival_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('booked', 'cancelled'), defaultValue: 'booked' },
});

Booking.belongsTo(User);
Booking.belongsTo(Train);
Booking.belongsTo(Seat);
Booking.belongsTo(Station, { as: 'fromStation', foreignKey: 'from_station_id' });
Booking.belongsTo(Station, { as: 'toStation', foreignKey: 'to_station_id' });
Booking.hasMany(Route, { foreignKey: 'TrainId' }); 

module.exports = Booking;
