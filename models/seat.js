const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const Train = require('./train');

const Seat = sequelize.define('Seat', {
  class: { type: DataTypes.STRING, allowNull: false },
  total_seats: { type: DataTypes.INTEGER, allowNull: false },
  available_seats: { type: DataTypes.INTEGER, allowNull: false },
  price:{type: DataTypes.INTEGER,allowNull:false}
});

Seat.belongsTo(Train);

module.exports = Seat;
