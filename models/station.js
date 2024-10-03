const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Station = sequelize.define('Station', {
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
});

module.exports = Station;
