const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: true, //Activa los logs de SQL en la consola.
});

module.exports = sequelize;