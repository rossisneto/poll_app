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

module.exports = router;
