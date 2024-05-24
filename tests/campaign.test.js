const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const initializeDatabase = require('../config/db');
const passportStub = require('passport-stub');

chai.use(chaiHttp);
chai.should();

passportStub.install(app);

describe("Campaigns", () => {
  let user;
  let db;

  before(async () => {
    db = await initializeDatabase();
    await db.exec('DELETE FROM campaigns');
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

  it("should create a new campaign with QR code", (done) => {
    const campaign = {
      title: "Campaign 1",
      question: "What is your favorite color?",
      option1: "Red",
      option2: "Blue",
      option3: "Green",
      option4: "Yellow"
    };

    chai.request(app)
      .post('/campaigns')
      .send(campaign)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('id');
        res.body.should.have.property('unique_link');
        res.body.should.have.property('qr_code');
        res.body.should.have.property('user_id').eql(user.id);
        done();
      });
  });

  it("should get a campaign by id", (done) => {
    const campaign = {
      title: "Campaign 2",
      question: "What is your favorite season?",
      option1: "Spring",
      option2: "Summer",
      option3: "Autumn",
      option4: "Winter"
    };

    chai.request(app)
      .post('/campaigns')
      .send(campaign)
      .end((err, res) => {
        const campaignId = res.body.id;
        chai.request(app)
          .get(`/campaigns/${campaignId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id').eql(campaignId);
            res.body.should.have.property('title').eql(campaign.title);
            res.body.should.have.property('question').eql(campaign.question);
            res.body.should.have.property('option1').eql(campaign.option1);
            res.body.should.have.property('option2').eql(campaign.option2);
            res.body.should.have.property('option3').eql(campaign.option3);
            res.body.should.have.property('option4').eql(campaign.option4);
            res.body.should.have.property('unique_link');
            res.body.should.have.property('qr_code');
            res.body.should.have.property('user_id').eql(user.id);
            done();
          });
      });
  });

  it("should return unauthorized when not logged in", (done) => {
    passportStub.logout();
    const campaign = {
      title: "Campaign 3",
      question: "What is your favorite food?",
      option1: "Pizza",
      option2: "Burger",
      option3: "Pasta",
      option4: "Salad"
    };

    chai.request(app)
      .post('/campaigns')
      .send(campaign)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('message').eql('Unauthorized');
        passportStub.login(user); // Re-login for further tests if needed
        done();
      });
  });
});
