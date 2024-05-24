async function createCampaign(db, data) {
  const result = await db.run(
    'INSERT INTO campaigns (title, question, option1, option2, option3, option4, unique_link, user_id, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [data.title, data.question, data.option1, data.option2, data.option3, data.option4, data.unique_link, data.user_id, data.qr_code]
  );

  return { id: result.lastID, ...data };
}

async function findCampaignById(db, id) {
  return db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
}

module.exports = {
  createCampaign,
  findCampaignById
};
