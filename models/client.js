const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Name: DataTypes.STRING,
  BusinessHours: DataTypes.STRING,
  PropertiesForSale: DataTypes.STRING,
  PropertiesForRent: DataTypes.STRING,
  Address: DataTypes.STRING,
  Neighborhood: DataTypes.STRING,
  Website: DataTypes.STRING,
  WhatsApp: DataTypes.STRING,
  Phone: DataTypes.STRING,
  AdditionalPhones: DataTypes.STRING,
  Email: DataTypes.STRING,
  code_email: DataTypes.STRING,
  email_received: { type: DataTypes.BOOLEAN, defaultValue: false },
  sending_error: { type: DataTypes.BOOLEAN, defaultValue: false },
  description_sending_error: { type: DataTypes.STRING, allowNull: true },
  unsubscribed: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'clients',
  timestamps: false
});

module.exports = { Client };
