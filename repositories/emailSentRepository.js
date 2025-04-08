const { Op } = require('sequelize');
const { EmailSent } = require('../models/emailSent');
const { Client } = require('../models/client');

/** CREAR REGISTRO DE EMAILS ENVIADOS. 
 * 
 * @param data 
 * @returns 
 */
exports.createEmailSent = async (data) => {
  return await EmailSent.create(data);
};

/** ACTUALIZAR REGISTRO DE EMAILS ENVIADOS.
 * 
 * @param code_email 
 * @param updateOp 
 * @returns 
 */
exports.updateEmailSentByClient = async (code_email, updateOp) => {
  return await EmailSent.update(updateOp, { where: { code_email: code_email } });
};

/** REGISTRAR EL INCREMENTO DE CLICKS EN EL BOTÓN "COMENZAR GRATIS".
 * 
 * @param code 
 */
exports.incrementClickStartFree = async (code) => {
  const emailSent = await EmailSent.findOne({ where: { code_email: code } });
  if (emailSent) {
    emailSent.click_btn_start_free += 1;
    await emailSent.save();
  }
};

/** OBTENER CLIENTES QUE DIERON CLICK AL BOTÓN "COMENZAR GRATIS".
 * 
 * @returns 
 */
exports.getClientsWithClicks = async () => {
  return await EmailSent.findAll({ 
    where: { 
      click_btn_start_free: {[Op.gt]: 0} 
    },
    include: [{
      model: Client,
      attributes: ['Name', 'BusinessHours', 'Website', 'WhatsApp', 'Email', 'unsubscribed'],
      where: { code_email: { [Op.col]: 'EmailSent.code_email' } }, //Relación manual.
      required: true //Solo traer clientes que tengan coincidencia.
    }]
  });
};

/** OBTENER TODOS LOS EMAILS ENVIADOS.
 * 
 */
exports.getAllEmailSent = async () => {
  return await EmailSent.findAll();
};

/** ELIMINAR TODOS LOS CLIENTES.
 * 
 */
exports.deleteAllEmailSent = async () => {
  try {
    await EmailSent.destroy({
      where: {}, //Eliminar todos los registros.
      truncate: true //Resetea los IDs autoincrementales.
    });
    console.log('Todos los registros de EmailSent han sido eliminados.');
  } catch (error) {
    throw new Error('Error al eliminar los registros: ' + error);
  }
};