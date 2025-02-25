const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { Client } = require('./client');

const EmailSent = sequelize.define('EmailSent', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code_email: DataTypes.INTEGER,
    sent: DataTypes.BOOLEAN,
    click_btn_start_free: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'emails_sent',
    timestamps: false
});

Client.hasMany(EmailSent, { foreignKey: 'code_email', sourceKey: 'code_email' });
EmailSent.belongsTo(Client, { foreignKey: 'code_email', targetKey: 'code_email' });

module.exports = { EmailSent };
