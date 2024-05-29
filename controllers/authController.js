const passport = require('../config/auth');
const initializeDatabase = require('../config/db');
const axios = require('axios');
const globoConfig = require('../config/globoConfig');

// Funções para iniciar o processo de autenticação
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });
exports.facebookLogin = passport.authenticate('facebook', { scope: ['email'] });
exports.linkedinLogin = passport.authenticate('linkedin');

// Funções de callback após a autenticação
exports.googleCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: '/'
});

exports.facebookCallback = passport.authenticate('facebook', {
  failureRedirect: '/login',
  successRedirect: '/'
});

exports.linkedinCallback = passport.authenticate('linkedin', {
  failureRedirect: '/login',
  successRedirect: '/'
});

// Função para registrar um usuário
exports.registerUser = async (req, res) => {
  const { name, email, phone, location } = req.body;

  if (!name || !email || !phone || !location) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  try {
      const db = await initializeDatabase();
      const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

      if (existingUser) {
          await db.close();
          return res.status(400).json({ error: 'User already exists' });
      }

      await db.run(
          'INSERT INTO users (name, email, phone, location) VALUES (?, ?, ?, ?)',
          [name, email, phone, location]
      );

      await db.close();
      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

// Função para autenticar com a Globo
exports.authWithGlobo = async (req, res) => {
  const { email, password, serviceId, url } = globoConfig;

  const jsonAuth = {
    captcha: '',
    payload: {
      email: email,
      password: password,
      serviceId: serviceId
    }
  };

  try {
    const response = await axios.post(url, jsonAuth, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.glbId) {
      req.session.glbId = response.data.glbId;
      res.status(200).json({ message: 'Authenticated successfully', glbId: response.data.glbId });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Error authenticating with Globo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Função para logout
exports.logout = (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};
