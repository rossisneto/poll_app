const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const ensureAuthenticated = require('../middlewares/authMiddleware');

// Rota para criar uma nova campanha
router.post('/campaigns', ensureAuthenticated, campaignController.createCampaign);

// Rota para recuperar uma campanha por ID
router.get('/campaigns/:id', ensureAuthenticated, campaignController.getCampaign);

// Rota para exibir a campanha para resposta
router.get('/campaign/:unique_link', campaignController.getCampaignByUniqueLink);

// Rota para submeter uma resposta
router.post('/campaign/:unique_link/submit', campaignController.submitResponse);

// Rota para registrar a localização do cliente
router.post('/campaign/:unique_link/register-location', campaignController.registerResponseLocation);

// Rota para recuperar os resultados das respostas
router.get('/responses', ensureAuthenticated, campaignController.getResponses);

// Rota para recuperar todas as campanhas
router.get('/campaigns', ensureAuthenticated, campaignController.getAllCampaigns);

// Rota para recuperar respostas de uma campanha específica
router.get('/campaigns/:campaignId/responses', ensureAuthenticated, campaignController.getCampaignResponses);

module.exports = router;
