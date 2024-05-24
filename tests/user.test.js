const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const initializeDatabase = require('../config/db');
const passportStub = require('passport-stub');

chai.use(chaiHttp);
chai.should();

passportStub.install(app);

describe("User", () => {
  let user;
  let db;

  before(async () => {
    db = await initializeDatabase();
    await db.exec('DELETE FROM users');
    const result = await db.run('INSERT INTO users (name, email, social_id, provider) VALUES (?, ?, ?, ?)', ['Test User', 'test@example.com', '123', 'google']);
    user = { id: result.lastID, name: 'Test User', email: 'test@example.com' };
    passportStub.login(user);
  });

  after(async () => {
    passportStub.logout();
    passportStub.uninstall();
    await db.close();
  });

  it("should get the profile of the logged-in user", (done) => {
    chai.request(app)
      .get('/profile')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('id').eql(user.id);
        res.body.should.have.property('name').eql(user.name);
        res.body.should.have.property('email').eql(user.email);
        res.body.should.have.property('provider').eql('google');
        done();
      });
  });

  it("should return unauthorized when not logged in", (done) => {
    passportStub.logout();
    chai.request(app)
      .get('/profile')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('message').eql('Unauthorized');
        passportStub.login(user); // Re-login for further tests if needed
        done();
      });
  });
});
