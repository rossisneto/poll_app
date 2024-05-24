const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const initializeDatabase = require('./db');
const { findOrCreateUser } = require('../models/user');

// Serializa o usuário para a sessão
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Desserializa o usuário da sessão
passport.deserializeUser(async (id, done) => {
  try {
    const db = await initializeDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    await db.close();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const handleSocialLogin = async (accessToken, refreshToken, profile, done) => {
  try {
    const db = await initializeDatabase();
    const user = await findOrCreateUser(db, profile);
    await db.close();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
};

// Configuração do Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, handleSocialLogin));

// Configuração do Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "/auth/facebook/callback"
}, handleSocialLogin));

// Configuração do LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_liteprofile']
}, handleSocialLogin));

module.exports = passport;
