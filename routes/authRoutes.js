const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Rotas para iniciar o processo de autenticação
router.get('/auth/google', authController.googleLogin);
router.get('/auth/facebook', authController.facebookLogin);
router.get('/auth/linkedin', authController.linkedinLogin);

// Rotas de callback após a autenticação
router.get('/auth/google/callback', authController.googleCallback);
router.get('/auth/facebook/callback', authController.facebookCallback);
router.get('/auth/linkedin/callback', authController.linkedinCallback);

// Rota para cadastro de usuário
router.post('/api/register', authController.registerUser);

// Rota para autenticação com novo provedor
router.post('/api/auth/globo', authController.authWithGlobo);

// Rota para logout
router.get('/logout', authController.logout);

module.exports = router;
