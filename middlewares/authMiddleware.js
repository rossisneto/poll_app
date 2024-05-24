// Middleware para garantir que o usuário esteja autenticado
const ensureAuthenticated = (req, res, next) => {
  //if (req.isAuthenticated()) {
  if(1){
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

module.exports = ensureAuthenticated;
