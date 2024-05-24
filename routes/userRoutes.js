const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const ensureAuthenticated = require('../middlewares/authMiddleware');

// Rota para recuperar o perfil do usuário logado
router.get('/profile', ensureAuthenticated, userController.getProfile);

module.exports = router;
