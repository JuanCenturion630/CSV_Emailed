const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sequelize = require('./config/database');
const colors = require('colors');
require('dotenv').config();

//Importación de las rutas:
const emailRoutes = require('./routes/emailRoutes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Uso de rutas:
app.use('/api', emailRoutes);

//Inicialización del servidor:
const port = process.env.PORT_EXPRESS || 3000;
app.listen(port, async () => {
  await synchronizeDatabase(); //Sincronizar con Sequelize.
  console.log(`Servidor corriendo en el puerto ${port}`);
});

//Sincronizar los modelos con la base de datos (EXCLUSIVAMENTE EN ENTORNO DE DESARROLLO):
async function synchronizeDatabase() {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    }

    //SIEMPRE DEBE ESTAR EN 'FALSE' EN ENTORNO DE PRODUCCIÓN.
    //El modelo sequelize no intentará cambiar campos de las tablas para volverlos idénticos al modelo,
    //solo creara las tablas sino existen.
    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync({ alter: false });
    }
    console.log('Base de datos sincronizada con Sequelize.'.green);
  } catch (error) {
    console.error('No se sincronizaron todos los modelos con la base de datos: '.yellow, error);
  }
}