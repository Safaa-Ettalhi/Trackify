const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Truck = require('../../models/Truck');

let authToken;
let app;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  app = require('../../server');
});

beforeEach(async () => {

  await User.findOneAndDelete({ email: 'admin@trackify.ma' });
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const admin = await User.create({
    name: 'Mohamed Admin',
    email: 'admin@trackify.ma',
    password: '123456',
    role: 'admin'
  });
  
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@trackify.ma',
      password: '123456'
    });
  
  if (loginRes.status !== 200) {
    throw new Error('Échec de la connexion: ' + JSON.stringify(loginRes.body));
  }
  
  if (!loginRes.body.token) {
    throw new Error('Token non reçu lors de la connexion: ' + JSON.stringify(loginRes.body));
  }
  
  authToken = loginRes.body.token;
});

afterEach(async () => {
  await Truck.deleteMany({});
  await User.deleteMany({ email: 'admin@trackify.ma' });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Truck Controller', () => {
  describe('POST /api/trucks', () => {
    it('devrait créer un camion', async () => {
      let user = await User.findOne({ email: 'admin@trackify.ma' });
      if (!user) {
        user = await User.create({
          name: 'Mohamed Admin',
          email: 'admin@trackify.ma',
          password: '123456',
          role: 'admin'
        });
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: 'admin@trackify.ma', password: '123456' });
        authToken = loginRes.body.token;
      }
      
      const uniqueImmat = `TRUCK-TEST-${Date.now()}`;
      
      const truckData = {
        immatriculation: uniqueImmat,
        modele: 'Volvo FH',
        marque: 'Volvo',
        kilometrageTotal: 0,
        etat: 'disponible'
      };

      const res = await request(app)
        .post('/api/trucks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(truckData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.immatriculation).toBe(uniqueImmat);
    });

    it('ne devrait pas créer un camion sans token', async () => {
      const res = await request(app)
        .post('/api/trucks')
        .send({
          immatriculation: '12345-A-45',
          modele: 'Volvo FH'
        })
        .expect(401);
    });
  });

  describe('GET /api/trucks', () => {
    it('devrait récupérer tous les camions', async () => {
      await Truck.create({
        immatriculation: '12345-A-45',
        modele: 'Volvo FH',
        marque: 'Volvo'
      });

      const res = await request(app)
        .get('/api/trucks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('GET /api/trucks/:id', () => {
    it('devrait récupérer un camion par ID', async () => {
      const truck = await Truck.create({
        immatriculation: '12345-A-45',
        modele: 'Volvo FH',
        marque: 'Volvo'
      });

      const res = await request(app)
        .get(`/api/trucks/${truck._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.immatriculation).toBe('12345-A-45');
    });

    it('devrait retourner 404 si le camion n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/trucks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});