const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailControllers');

//Subir y procesar CSV.
router.post('/upload-csv', emailController.uploadCSV);

//Enviar campaña (especificando el rango de clientes).
router.post('/send-campaign', emailController.sendCampaign);

//Obtener clientes con envío fallido.
router.get('/failed-emails', emailController.getFailedEmails);

//Reenviar emails a clientes que fallaron previamente.
router.post('/resend-failed', emailController.resendFailedEmails);

//Registra los clicks en el botón "Comenzar gratis".
router.get('/click-start-free/:code', emailController.clickStartFree);

//Ver todos los usuarios que dieron click en "comenzar gratis".
router.get('/get-all-clients-click-start-free/', emailController.getClientsWithClicks);

//Desuscribe a un cliente.
router.get('/unsubscribe/:code', emailController.unsubscribe);

//Ver todos los usuarios que dieron click en "Desuscribirse".
router.get('/get-all-clients-click-unsubscribe/', emailController.getClienUnsubscribe);

//Elimina todos los clientes.
router.delete('/delete-all-clients/', emailController.deleteAllClients);

//Elimina todos los emails enviados.
router.delete('/delete-all-email-sent/', emailController.deleteAllEmailSent);

//Elimina todos las campañas.
router.delete('/delete-all-campaign/', emailController.deleteAllCampaign);

//Obtener todos los clientes.
router.get('/get-all-clients/', emailController.getAllClients);

//Obtener todos los emails enviados.
router.get('/get-all-email-sent/', emailController.getAllEmailSent);

//Obtener todos las campañas enviadas.
router.get('/get-all-campaign/', emailController.getAllCampaign);

module.exports = router;
