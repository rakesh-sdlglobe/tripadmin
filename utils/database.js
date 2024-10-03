require('dotenv').config();
const { Sequelize } = require('sequelize');

const isDevelopment = process.env.NODE_ENV === 'development';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: 'mysql',
  host: process.env.DB_HOST,
  logging: isDevelopment ? console.log : false
});

module.exports = sequelize;
