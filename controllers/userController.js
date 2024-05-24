const initializeDatabase = require('../config/db');

// Função para recuperar o perfil do usuário logado
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Captura o ID do usuário logado
    const db = await initializeDatabase();
    const user = await db.get('SELECT id, name, email, provider, created_at FROM users WHERE id = ?', [userId]);
    await db.close();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
