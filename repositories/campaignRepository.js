const { Campaign } = require('../models/campaign');

/** CREAR UNA CAMPAÑA.
 * 
 * @param {*} data 
 * @returns 
 */
exports.createCampaign = async (data) => {
  return await Campaign.create(data);
};

/** ACTUALIZAR UNA CAMPAÑA.
 * 
 * @param {*} campaignId 
 * @param {*} updateOp : Parámetros a actualizar [Objeto].
 * @returns 
 */
exports.updateCampaign = async (campaignId, updateOp) => {
  return await Campaign.update(updateOp, { where: { id: campaignId } });
};

/** OBTENER TODAS LAS CAMPAÑAS.
 * 
 * @returns 
 */
exports.getAllCampaign = async () => {
  return await Campaign.findAll();
};

/** ELIMINAR TODAS LAS CAMPAÑAS.
 * 
 * @returns 
 */
exports.deleteAllCampaign = async () => {
  return await Campaign.destroy({
    where: {}, //Eliminar todos los registros.
    truncate: true //Resetea los IDs autoincrementales.
  });
};