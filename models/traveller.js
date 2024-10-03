const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user');  

const Traveller = sequelize.define('Traveller', {
  firstname: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: true },
  mobile: { type: DataTypes.STRING, allowNull: true }, 
  dob: { type: DataTypes.DATEONLY, allowNull: true },
  userId: { 
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  }
});

// Define associations
Traveller.belongsTo(User, { foreignKey: 'userId', allowNull: false });
User.hasMany(Traveller, { foreignKey: 'userId' });


module.exports = Traveller;
