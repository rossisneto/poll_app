const initializeDatabase = require('../config/db');
const { createCampaign, findCampaignById } = require('../models/campaign');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');

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

    console.log("Generating QR Code for link:", `http://localhost:3000/campaign/${unique_link}`);
    // Gera o QR Code
    const qr_code = await QRCode.toDataURL(`http://localhost:3000/campaign/${unique_link}`);

    const db = await initializeDatabase();
    const campaign = await createCampaign(db, { title, question, option1, option2, option3, option4, unique_link, user_id, qr_code });
    await db.close();
    console.log("Campaign created successfully:", campaign);
    res.status(201).json(campaign);
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
    res.sendFile(__dirname + '/../public/html/survey.html');
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(400).json({ error: error.message });
  }
};
