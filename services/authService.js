// Serviço de autenticação

/**
 * Função para limpar a sessão do usuário após o logout
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
function clearSession(req, res) {
    req.logout(err => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log out' });
      }
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ error: 'Failed to destroy session' });
        }
        res.clearCookie('connect.sid'); // Limpa o cookie da sessão
        res.status(200).json({ message: 'Logged out successfully' });
      });
    });
  }
  
  module.exports = {
    clearSession
  };
  