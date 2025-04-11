const emailService = require('../services/emailServices');

/** SUBIR ARCHIVO CSV.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const uploadCSV = async (req, res) => {
  try {
    const filePath = req.body.filePath;
    const data = await emailService.processCSV(filePath);
    res.status(200).json({ message: 'CSV procesado exitosamente', data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** ENVIAR EMAILS DENTRO DE UNA CAMPAÑA.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const sendCampaign = async (req, res) => {
  try {
    //Configuramos la respuesta para usar SSE.
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*"); //Permitir conexiones desde cualquier origen.
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    const { start, end } = req.body; //Rangos: por ejemplo, cliente 1 a 500.
    const result = await emailService.sendCampaign(start, end, (progress) => {
      res.write(`Progreso: ${JSON.stringify({ progress })} %\n\n`);
    });
    res.write(`Progreso: ${JSON.stringify({ result })} %\n\n`);
    res.end();
  } catch (error) {
    res.write(`Progreso: ${JSON.stringify({ error: error.message })} %\n\n`);
    res.end();
  }
};

/** OBTENER USUARIOS QUE NO RECIBIERON EL EMAIL.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getFailedEmails = async (req, res) => {
  try {
    const failedClients = await emailService.getFailedEmails();
    res.status(200).json(failedClients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** REENVIAR LOS EMAILS FALLIDOS.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const resendFailedEmails = async (req, res) => {
  try {
    const result = await emailService.resendFailedEmails();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** REGISTRAR EL CLICK EN "COMIENZA GRATIS".
 * 
 * @param {*} req 
 * @param {*} res 
 */
const clickStartFree = async (req, res) => {
  try {
    const { code } = req.params;
    await emailService.registerClickStartFree(code);
    res.redirect('https://www.inmser.com'); //Redirige a www.inmser.com.
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** OBTENER CLIENTES QUE DIERON CLICK AL BOTÓN "COMENZAR GRATIS".
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getClientsWithClicks = async (req, res) => {
  try {
    const clients = await emailService.getClientsWithClicks();
    res.status(200).json({ clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** REGISTRAR EL CLICK EN "DESUSCRIBIRSE".
 * 
 * @param {*} req 
 * @param {*} res 
 */
const unsubscribe = async (req, res) => {
  try {
    const { code } = req.params;
    await emailService.unsubscribeClient(code);
    res.status(200).json({ message: 'Cliente desuscrito correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** REGISTRAR EL CLICK EN "DESUSCRIBIRSE".
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getClienUnsubscribe = async (req, res) => {
  try {
    const clients = await emailService.getClienUnsubscribe();
    res.status(200).json({ message: 'ClienteS desuscritos.', clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** ELIMINAR TODOS LOS CLIENTES.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const deleteAllClients = async (req, res) => {
  try {
    await emailService.deleteAllClients();
    res.status(200).json({ message: 'Clientes eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** ELIMINAR TODOS LOS CLIENTES.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const deleteAllEmailSent = async (req, res) => {
  try {
    await emailService.deleteAllEmailSent();
    res.status(200).json({ message: 'Correos eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** ELIMINAR TODAS LAS CAMPAÑAS.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const deleteAllCampaign = async (req, res) => {
  try {
    await emailService.deleteAllCampaign();
    res.status(200).json({ message: 'Campañas eliminadas correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** OBTENER TODOS LOS CLIENTES.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getAllClients = async (req, res) => {
  try {
    const clients = await emailService.getAllClients();
    res.status(200).json({ message: "Tus clientes", clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** OBTENER TODOS LOS CLIENTES.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getAllEmailSent = async (req, res) => {
  try {
    const emails = await emailService.getAllEmailSent();
    res.status(200).json({ message: "Tus correos enviados", emails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** OBTENER TODAS TUS CAMPAÑAS.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getAllCampaign = async (req, res) => {
  try {
    const campaign = await emailService.getAllCampaign();
    res.status(200).json({ message: "Tus campañas.", campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadCSV,
  sendCampaign,
  getFailedEmails,
  resendFailedEmails,
  clickStartFree,
  getClientsWithClicks,
  unsubscribe,
  getClienUnsubscribe,
  deleteAllClients,
  deleteAllEmailSent,
  deleteAllCampaign,
  getAllClients,
  getAllEmailSent,
  getAllCampaign
}