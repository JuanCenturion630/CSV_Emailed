const { Client } = require('../models/client');

/** CREAR CLIENTES EN BASE DE DATOS.
 * 
 * @param {*} clients 
 * @returns 
 */
const bulkCreateClients = async (clients) => {
  return await Client.bulkCreate(clients);
};

/** OBTENER CLIENTES EN UN RANGO.
 * 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
const getClientsInRange = async (start, end) => {
  return await Client.findAll({
    where: {
      email_received: false,
      unsubscribed: false
    },
    offset: Number(start),
    limit: Number(end) - Number(start) + 1
  });
};

/** ACTUALIZAR CLIENTES.
 * 
 * @param {*} clientId 
 * @param {*} updateFields : objeto.
 * @returns 
 */
const updateClient = async (code, updateFields) => {
  return await Client.update(updateFields, { where: { code_email: code } });
};

/** OBTENER CLIENTES QUE FALLARON EL ENVÍO.
 * 
 * @returns 
 */
const getFailedClients = async () => {
  return await Client.findAll({ where: { sending_error: true } });
};

/** ELIMINAR TODOS LOS CLIENTES.
 * 
 */
const deleteAllClients = async () => {
  try {
    await Client.destroy({
      where: {}, //Eliminar todos los registros.
      truncate: true //Resetea los IDs autoincrementales.
    });
    console.log('Todos los registros de Clients han sido eliminados.');
  } catch (error) {
    throw new Error('Error al eliminar los registros: ' + error);
  }
};

/** OBTENER TODOS LOS CLIENTES.
 * 
 * @returns 
 */
const getAllClients = async () => {
  try {
    return await Client.findAll();
  } catch (error) {
    throw new Error("En clientRepository.getAllClients: " + error.message);
  }
}

/** OBTENER TODOS LOS CLIENTES DESUSCRIPTOS.
 * 
 * @returns 
 */
const getClienUnsubscribe = async () => {
  try {
    return await Client.findAll({
      where: {
        unsubscribed: true
      }
    });
  } catch (error) {
    throw new Error("En clientRepository.getClienUnsubscribe: " + error.message);
  }
}

module.exports = {
  bulkCreateClients,
  getClientsInRange,
  updateClient,
  getFailedClients,
  deleteAllClients,
  getAllClients,
  getClienUnsubscribe
}