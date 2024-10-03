const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  mobile: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.STRING, allowNull: true },
  dob: { type: DataTypes.DATEONLY, allowNull: true },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
}, {
  timestamps: true
});

module.exports = User;
