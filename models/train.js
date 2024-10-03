const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const Station = require('./station');

const Train = sequelize.define('Train', {
  name: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.STRING, allowNull: false, unique: true },
  days:{type:DataTypes.STRING, allowNull:false,defaultValue:''}
});

Train.belongsTo(Station, { as: 'startStation', foreignKey: 'start_station_id' });
Train.belongsTo(Station, { as: 'endStation', foreignKey: 'end_station_id' });

module.exports = Train;
