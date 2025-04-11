const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const colors = require('colors');
const clientRepository = require('../repositories/clientRepository');
const campaignRepository = require('../repositories/campaignRepository');
const emailSentRepository = require('../repositories/emailSentRepository');
require('dotenv').config();

//Se configura la conexión entre el emisor (admin) y su servidor de correo.
const transporter = nodemailer.createTransport({
  host: process.env.HOST, //Servidor de correo que usa el administrador.
  port: Number(process.env.PORT), //Puerto del servidor de correo.
  secure: process.env.SECURE === 'false' ? false : true, //STARTTLS requiere 'false' (leer descripción abajo).
  auth: {
    user: process.env.NAME_EMAIL, //Email del administrador.
    pass: process.env.PASSWORD_EMAIL, //Contraseña del correo del administrador.
  },
  /** ¿QUÉ ES STARTTLS?
   * Es el estándar de conexión entre un cliente y el servidor SMTP, donde se inicia una conexión sin cifrado
   * y luego, automáticamente en el servidor (si es que lo soporta), se negocia un certificado TLS/SSL.
   * Sino se utiliza esta opción, el cliente deberá proporcionar un certificado válido de antemano.
   */
});

/** PROCESAR ARCHIVO CSV.
 * 
 * @param {*} filePath 
 * @returns 
 */
const processCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    const clients = [];
    fs.createReadStream(filePath)
    .pipe(csv({ separator: ',' })) //Cambiar por ',' en caso de ser necesario.
    .on('data', (row) => {
      //Ademá de los campos en el CSV, se crean campos adicionales.
      row.code_email = Math.random().toString(36).substring(2, 10); //Generar código aleatorio para el email.
      row.email_received = false;
      row.sending_error = false;
      row.description_sending_error = null;
      row.unsubscribed = false;
      clients.push(row); //Se guardan los datos en el vector.
    })
    .on('end', async () => {
      try {
        //Se crea el registroe en base de datos.
        const createdClients = await clientRepository.bulkCreateClients(clients);
        resolve(createdClients); //Retornar los datos insertados.
      } catch (error) {
        reject(error); //Promesa rechazada.
      }
    })
    .on('error', reject);
  });
};

/** ENVIAR CAMPAÑA (LOTES DE 10 MENSAJES).
 * 
 * Si eliges de 25 a 700, le enviará emails a todos los usuarios entre ese rango.
 * @param {*} start : Índice del usuario que inicia la campaña.
 * @param {*} end : Índice del usuario que termina la campaña.
 * @returns 
 */
const sendCampaign = async (start, end, onProgress) => {
  //Obtener clientes en el rango que aún no han recibido email y que no están desuscritos.
  const clients = await clientRepository.getClientsInRange(start, end);
  console.log("Clientes:".bgGreen, clients);
  const totalClients = clients.length;
  let processedClients = 0;

  let emailsReceived = 0;
  let emailsFailed = 0;
  
  //Crear un registro de campaña.
  const campaign = await campaignRepository.createCampaign({ 
    number_emails_received: 0, number_emails_failled: 0 
  });

  //Verifica que la conexión con el servidor SMTP sea valida.
  transporter.verify((error, success) => {
    if (error) return { error: "El servidor SMTP no esta disponible: ", error };
    else console.log('Servidor SMTP funcionando correctamente. Estado: '.green, success);
  });

  //Enviar correos en lotes de 10 correos por ciclo.
  for (let i = 0; i < clients.length; i += 10) {
    const batch = clients.slice(i, i + 10);
    const send = batch.map(async (client) => {
      //Si ya se envió o el cliente está desuscrito, se omite:
      if (client.email_received || client.unsubscribed) return;
      
      //Leer la plantilla HTML y reemplazar {{code}} por el código aletorio del correo de cliente. 
      const templatePath = path.join(__dirname, '../htmlTemplate/emailTemplate.html');
      let htmlContent = fs.readFileSync(templatePath, 'utf8');
      htmlContent = htmlContent.replace(/{{code}}/g, client.code_email);
      try {
        
        //Enviar correo.
        await transporter.sendMail({
          from: `"Inmser" <${process.env.NAME_EMAIL}>`,
          to: client.Email,
          subject: 'Campaña de Inmser',
          html: htmlContent
        });

        //Actualizar estado en "clients" y registrar en "emails_sent".
        console.log("ID:".bgMagenta, client.id);
        console.log("CODE EMAIL:".bgCyan, client.code_email);
        await clientRepository.updateClient({ email_received: true }, { id: client.id });
        await emailSentRepository.createEmailSent({ 
          code_email: client.code_email, 
          sent: true 
        });
        emailsReceived++;

      } catch (error) {
        //Registrar error en el cliente:
        console.log(client.id);
        await clientRepository.updateClient(
          { sending_error: true, description_sending_error: error.message }, 
          { id: client.id }
        );

        //Registrar envío fallido:
        await emailSentRepository.createEmailSent({ 
          code_email: client.code_email, 
          click_btn_start_free: 0, 
          sent: false 
        });
        emailsFailed++;
      }
    });
    await Promise.all(send);

    //Actualizar el número de mensajes enviados y notificar el progreso.
    processedClients += batch.length;
    if (onProgress) {
      const percentage = Math.round((processedClients / totalClients) * 100);
      onProgress(percentage);
    }
  }
    
  // Actualizar la campaña con los totales
  await campaignRepository.updateCampaign(campaign.id, {
    number_emails_received: emailsReceived,
    number_emails_failled: emailsFailed
  });
    
  return { emailsReceived, emailsFailed, campaignId: campaign.id };
};

/** OBTENER EMAILS FALLIDOS.
 * 
 * @returns 
 */
const getFailedEmails = async () => {
  return await clientRepository.getFailedClients();
};

/** REENVIAR EMAILS FALLIDOS.
 * 
 * @returns 
 */
const resendFailedEmails = async () => {
  const failedClients = await clientRepository.getFailedClients();
  let emailsReceived = 0;
  let emailsFailed = 0;
  
  //Crear una nueva campaña para el reenvío:
  const campaign = await campaignRepository.createCampaign({ 
    number_emails_received: 0, number_emails_failled: 0 
  });

  //Reenviar:
  for (const client of failedClients) {
    const templatePath = path.join(__dirname, '../htmlTemplates/emailTemplate.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');
    htmlContent = htmlContent.replace(/{{code}}/g, client.code_email);
    try {
      await transporter.sendMail({
        from: `"Inmser" <${process.env.NAME_EMAIL}>`,
        to: client.Email,
        subject: 'Campaña de Inmser',
        html: htmlContent
      });
      
      //Actualiza los clientes fallidos, ahora con envíos exitosos.
      await clientRepository.updateClient( 
        { email_received: true, sending_error: false, description_sending_error: null },
        { id: client.id }
      );
      await emailSentRepository.updateEmailSentByClient(client.code_email, { sent: true });
      emailsReceived++;
    } catch (error) {
      //Actualiza los clientes fallidos con los nuevos errores durante el reenvío.
      await clientRepository.updateClient(
        { sending_error: true, description_sending_error: error.message },
        { id: client.id }
      );
      await emailSentRepository.updateEmailSentByClient(client.code_email, { sent: false });
      emailsFailed++;
    }
  }
  
  //ACtualiza la información de la campaña.
  await campaignRepository.updateCampaign(campaign.id, {
    number_emails_received: emailsReceived,
    number_emails_failled: emailsFailed
  });
  return { emailsReceived, emailsFailed, campaignId: campaign.id };
};

/** REGISTRA EL CLICK EN EL BOTÓN "COMIENZA GRATIS".
 * 
 * @param {*} code 
 */
const registerClickStartFree = async (code) => {
  await emailSentRepository.incrementClickStartFree(code);
};

/** OBTENER CLIENTES QUE DIERON CLICK AL BOTÓN "COMENZAR GRATIS".
 * 
 */
const getClientsWithClicks = async () => {
  return await emailSentRepository.getClientsWithClicks();
};

/** REGISTRA EL CLICK EN EL BOTÓN "DESUSCRIBIRSE".
 * 
 * @param {*} clientId 
 */
const unsubscribeClient = async (code) => {
  await clientRepository.updateClient({ unsubscribed: true }, { code_email: code });
};

/** OBTENER TODOS LOS CLIENTES DESUSCRIPTOS.
 * 
 * @param {*} clientId 
 */
const getClienUnsubscribe = async (clientId) => {
  return await clientRepository.getClienUnsubscribe();
};

/** ELIMINAR TODOS LOS CLIENTES.
 * 
 */
const deleteAllClients = async () => {
  await clientRepository.deleteAllClients();
};

/** ELIMINAR TODOS LOS CORREOS ENVIADOS.
 * 
 */
const deleteAllEmailSent = async () => {
  await emailSentRepository.deleteAllEmailSent();
};

/** ELIMINAR TODAS LAS CAMPAÑAS.
 * 
 */
const deleteAllCampaign = async () => {
  await campaignRepository.deleteAllCampaign();
};

/** OBTENER TODOS LOS CLIENTES.
 * 
 */
const getAllClients = async () => {
  return await clientRepository.getAllClients();
}

/** OBTENER TODOS LOS EMAILS ENVIADOS.
 * 
 */
const getAllEmailSent = async () => {
  return await emailSentRepository.getAllEmailSent();
};

/** OBTENER TODAS LAS CAMPAÑAS.
 * 
 * @returns 
 */
const getAllCampaign = async () => {
  return await campaignRepository.getAllCampaign();
};

module.exports = { 
  transporter,
  processCSV,
  sendCampaign,
  getFailedEmails,
  resendFailedEmails,
  registerClickStartFree,
  getClientsWithClicks,
  unsubscribeClient,
  getClienUnsubscribe,
  deleteAllClients,
  deleteAllEmailSent,
  deleteAllCampaign,
  getAllClients,
  getAllEmailSent,
  getAllCampaign
};