const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany();
});

describe('Auth', () => {

  it('👉 devrait créer un utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@test.com',
        password: '123456'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@test.com');
  });

  it('👉 devrait empêcher la création avec un email déjà utilisé', async () => {
    await User.create({
      name: 'Old User',
      email: 'old@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'old@test.com',
        password: '123456'
      });

    expect(res.status).toBe(400);
  });

  it('👉 devrait connecter un utilisateur valide', async () => {
    await User.create({
      name: 'Login User',
      email: 'login@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@test.com',
        password: '123456'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('👉 devrait refuser un mauvais mot de passe', async () => {
    await User.create({
      name: 'Wrong Pass',
      email: 'wrong@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@test.com',
        password: 'badpassword'
      });

    expect(res.status).toBe(401);
  });
});
