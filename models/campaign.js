const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('Campaign', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    number_emails_received: DataTypes.INTEGER,
    number_emails_failled: DataTypes.INTEGER,
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
    tableName: 'campaigns',
    timestamps: false
});

module.exports = { Campaign };
