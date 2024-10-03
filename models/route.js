const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const Train = require('./train');
const Station = require('./station');

const Route = sequelize.define('Route', {
  arrival_time: { type: DataTypes.TIME },
  departure_time: { type: DataTypes.TIME },
  sequence: { type: DataTypes.INTEGER, allowNull: false },
});

Route.belongsTo(Train);
Route.belongsTo(Station);

module.exports = Route;
