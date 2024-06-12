const initializeDatabase = require('../config/db');
const { createCampaign, findCampaignById } = require('../models/campaign');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const path = require('path');
const generateLink = require('../utils/generateLink');  // Importe a função para gerar o link base
//const ip2location = require('ip2location-nodejs');
const {IP2Location, IP2LocationWebService, IPTools, Country, Region} = require("ip2location-nodejs");

let ip2location = new IP2Location();

ip2location.open("./IP2LOCATION-LITE-DB9.BIN");

// Inicializar IP2Location
//ip2location.IP2Location_init('IP2LOCATION-LITE-DB9.BIN');

// Função para registrar a localização do cliente
exports.registerResponseLocation = async (req, res) => {
  try {
    const ip = req.ip; // Capturar o endereço IP do cliente
    console.log(ip);
    const locationResult = ip2location.IP2Location_get_all(ip);
    console.log(locationResult);

    if (!locationResult) {
      return res.status(400).json({ error: 'Unable to determine location' });
    }

    const location = `${locationResult.latitude}, ${locationResult.longitude}`;

    const db = await initializeDatabase();
    await db.run(
      'INSERT INTO response_locations (ip, latitude, longitude) VALUES (?, ?, ?)',
      [ip, locationResult.latitude, locationResult.longitude]
    );

    await db.close();
    res.status(200).json({ message: 'Location registered successfully', location });
  } catch (error) {
    console.error('Error registering location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Função para criar uma nova campanha
exports.createCampaign = async (req, res) => {
  try {
    const { title, question, option1, option2, option3, option4 } = req.body;
    console.log("Request Body:", req.body);  // Log dos dados recebidos

    if (!title || !question || !option1 || !option2 || !option3 || !option4) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const unique_link = nanoid();
    const user_id = req.user ? req.user.id : 1;  // Captura o ID do usuário logado, usando 1 para teste
    const link = generateLink(unique_link);  // Gere o link base

    console.log("Generating QR Code for link:", link);
    // Gera o QR Code
    const qr_code = await QRCode.toDataURL(link);

    const db = await initializeDatabase();
    const campaign = await createCampaign(db, { title, question, option1, option2, option3, option4, unique_link, user_id, qr_code });
    await db.close();
    console.log("Campaign created successfully:", campaign);
    res.status(201).json({ ...campaign, link });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(400).json({ error: error.message });
  }
};

// Função para recuperar uma campanha por ID
exports.getCampaign = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const campaign = await findCampaignById(db, req.params.id);
    await db.close();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(400).json({ error: error.message });
  }
};

// Função para recuperar uma campanha pelo unique_link
exports.getCampaignByUniqueLink = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const campaign = await db.get('SELECT * FROM campaigns WHERE unique_link = ?', [req.params.unique_link]);
    await db.close();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    const surveyPath = path.join(__dirname, '..', 'public', 'html', 'survey.html');
    console.log("Serving survey.html from:", surveyPath);
    res.sendFile(surveyPath);
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(400).json({ error: error.message });
  }
};

// Função para submeter uma resposta
exports.submitResponse = async (req, res) => {
  try {
    const { selectedOption } = req.body;
    const unique_link = req.params.unique_link;

    if (!selectedOption) {
      console.error('No option selected');
      return res.status(400).json({ error: 'No option selected' });
    }

    const db = await initializeDatabase();
    const campaign = await db.get('SELECT * FROM campaigns WHERE unique_link = ?', [unique_link]);

    if (!campaign) {
      await db.close();
      console.error('Campaign not found');
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const user_id = req.user ? req.user.id : 1;  // Captura o ID do usuário logado, usando 1 para teste

    await db.run(
      'INSERT INTO responses (campaign_id, user_id, selected_option) VALUES (?, ?, ?)',
      [campaign.id, user_id, selectedOption]
    );

    await db.close();
    console.log('Response submitted successfully');
    res.status(200).json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(400).json({ error: error.message });
  }
};

// Função para recuperar os resultados das respostas
exports.getResponses = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const responses = await db.all(`
      SELECT 
        responses.id, 
        responses.selected_option, 
        responses.created_at, 
        campaigns.title AS campaign_title, 
        campaigns.question, 
        users.name AS user_name, 
        users.email AS user_email 
      FROM responses 
      JOIN campaigns ON responses.campaign_id = campaigns.id 
      JOIN users ON responses.user_id = users.id
    `);
    await db.close();

    if (!responses) {
      return res.status(404).json({ error: 'No responses found' });
    }
    res.status(200).json(responses);
  } catch (error) {
    console.error('Error getting responses:', error);
    res.status(400).json({ error: error.message });
  }
};

// Função para recuperar todas as campanhas
exports.getAllCampaigns = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const campaigns = await db.all('SELECT id, title FROM campaigns');
    await db.close();

    if (!campaigns) {
      return res.status(404).json({ error: 'No campaigns found' });
    }
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    res.status(400).json({ error: error.message });
  }
};

// Função para recuperar respostas de uma campanha específica
exports.getCampaignResponses = async (req, res) => {
  try {
    const db = await initializeDatabase();
    const { campaignId } = req.params;
    const responses = await db.all('SELECT selected_option, COUNT(*) as count FROM responses WHERE campaign_id = ? GROUP BY selected_option', [campaignId]);
    await db.close();

    if (!responses) {
      return res.status(404).json({ error: 'No responses found' });
    }
    res.status(200).json(responses);
  } catch (error) {
    console.error('Error getting campaign responses:', error);
    res.status(400).json({ error: error.message });
  }
};
