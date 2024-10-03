const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const Booking = require('./booking');

const Payment = sequelize.define('Payment', {
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
});

Payment.belongsTo(Booking);

module.exports = Payment;

