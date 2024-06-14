require('dotenv').config();  // Carrega variáveis de ambiente do .env

const express = require('express');
const session = require('express-session');
const passport = require('./config/auth');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const initializeDatabase = require('./config/db');
//var getIP = require('ipware')().get_ip;



// Inicializa o banco de dados e cria as tabelas necessárias
initializeDatabase().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

const app = express();

app.set('trust proxy', true);

// Middleware para analisar o corpo das requisições JSON
app.use(express.json());

// Middleware para servir arquivos estáticos
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/html', express.static(__dirname + '/public/html'));

// Middleware para gerenciar sessões
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Inicializa o Passport e gerencia sessões
app.use(passport.initialize());
app.use(passport.session());

// Define as rotas
app.use(authRoutes);
app.use(userRoutes);
app.use(campaignRoutes);

// Rota para exibir a campanha para resposta
app.get('/campaign/:unique_link', (req, res) => {
  res.sendFile(__dirname + '/public/html/survey.html');
});

// Rota para recuperar dados da campanha pelo unique_link
app.get('/api/campaign/:unique_link', async (req, res) => {
  try {
    const db = await initializeDatabase();
    const campaign = await db.get('SELECT * FROM campaigns WHERE unique_link = ?', [req.params.unique_link]);
    await db.close();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
