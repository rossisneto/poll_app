const passport = require('../config/auth');

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

// Função para logout
exports.logout = (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};
