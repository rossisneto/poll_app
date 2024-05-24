const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const initializeDatabase = require('../config/db');
const passportStub = require('passport-stub');

chai.use(chaiHttp);
chai.should();

passportStub.install(app);

describe("Auth", () => {
  let db;

  before(async () => {
    db = await initializeDatabase();
    await db.exec('DELETE FROM users');
    await db.run('INSERT INTO users (name, email, social_id, provider) VALUES (?, ?, ?, ?)', ['Test User', 'test@example.com', '123', 'google']);
  });

  after(async () => {
    passportStub.logout();
    passportStub.uninstall();
    await db.close();
  });

  it("should authenticate with Google", (done) => {
    chai.request(app)
      .get('/auth/google')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("should authenticate with Facebook", (done) => {
    chai.request(app)
      .get('/auth/facebook')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("should authenticate with LinkedIn", (done) => {
    chai.request(app)
      .get('/auth/linkedin')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("should log out the user", (done) => {
    passportStub.login({ id: 1, name: 'Test User', email: 'test@example.com' });
    chai.request(app)
      .get('/logout')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message').eql('Logged out successfully');
        done();
      });
  });
});
