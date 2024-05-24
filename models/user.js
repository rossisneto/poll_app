async function findOrCreateUser(db, profile) {
    const user = await db.get('SELECT * FROM users WHERE social_id = ? AND provider = ?', [profile.id, profile.provider]);
    
    if (user) {
      return user;
    }
  
    const result = await db.run(
      'INSERT INTO users (name, email, social_id, provider) VALUES (?, ?, ?, ?)',
      [profile.displayName, profile.emails[0].value, profile.id, profile.provider]
    );
  
    return {
      id: result.lastID,
      name: profile.displayName,
      email: profile.emails[0].value,
      social_id: profile.id,
      provider: profile.provider
    };
  }
  
  module.exports = {
    findOrCreateUser
  };
  