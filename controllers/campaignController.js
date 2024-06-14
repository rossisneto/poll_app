const initializeDatabase = require('../config/db');
const { createCampaign, findCampaignById } = require('../models/campaign');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const path = require('path');
const generateLink = require('../utils/generateLink');
const axios = require('axios');
const http = require('http');

const apiKey = 'at_XdIUHrJJRYBTsPRHuiR69VNKeW96b'; // Chave de API para geo.ipify.org

// Função para submeter uma resposta e registrar a localização
exports.submitResponseAndLocation = async (req, res) => {
  try {
    const { selectedOption } = req.body;
    const unique_link = req.params.unique_link;

    if (!selectedOption) {
      return res.status(400).json({ error: 'No option selected' });
    }

    // Capturar o IP público do cliente usando api.ipify.org
    http.get({ host: 'api.ipify.org', port: 80, path: '/' }, async (resp) => {
      let ip = '';
      resp.on('data', (chunk) => {
        ip += chunk;
      });
      resp.on('end', async () => {
        try {
          const apiUrl = `https://geo.ipify.org/api/v1?apiKey=${apiKey}&ipAddress=${ip}`;

          const geoResponse = await axios.get(apiUrl);
          const locationData = geoResponse.data;

          const db = await initializeDatabase();
          const campaign = await db.get('SELECT * FROM campaigns WHERE unique_link = ?', [unique_link]);

          if (!campaign) {
            await db.close();
            return res.status(404).json({ error: 'Campaign not found' });
          }

          const user_id = req.user ? req.user.id : 1;  // Captura o ID do usuário logado, usando 1 para teste

          await db.run(
            'INSERT INTO responses (campaign_id, user_id, selected_option, location_data) VALUES (?, ?, ?, ?)',
            [campaign.id, user_id, selectedOption, JSON.stringify(locationData)]
          );

          await db.close();
          res.status(200).json({ message: 'Response submitted successfully', location: locationData });
        } catch (error) {
          console.error('Error registering location:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    }).on('error', (err) => {
      console.error('Error fetching IP:', err);
      res.status(500).json({ error: 'Error fetching IP' });
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Função para criar uma nova campanha
exports.createCampaign = async (req, res) => {
  try {
    const { title, question, option1, option2, option3, option4 } = req.body;

    if (!title || !question || !option1 || !option2 || !option3 || !option4) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const unique_link = nanoid();
    const user_id = req.user ? req.user.id : 1;  // Captura o ID do usuário logado, usando 1 para teste
    const link = generateLink(unique_link);  // Gere o link base

    const qr_code = await QRCode.toDataURL(link);

    const db = await initializeDatabase();
    const campaign = await createCampaign(db, { title, question, option1, option2, option3, option4, unique_link, user_id, qr_code });
    await db.close();

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
    res.sendFile(surveyPath);
  } catch (error) {
    console.error('Error getting campaign:', error);
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
        responses.location_data, 
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
