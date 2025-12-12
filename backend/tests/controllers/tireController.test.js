const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Tire = require('../../models/Tire');
const Truck = require('../../models/Truck');
const app = require('../../server');

let authToken;
let testTruck;
const adminEmail = 'admin.tire@trackify.ma';
const truckImmat = 'TIRE-12345-A-45';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trackify_test');
  
  await User.deleteMany({ email: adminEmail });
  await Truck.deleteMany({ immatriculation: truckImmat });
  
  const admin = await User.create({
    name: 'Mohamed Admin',
    email: adminEmail,
    password: '123456',
    role: 'admin'
  });
  
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: adminEmail,
      password: '123456'
    });
  
  authToken = loginRes.body.token;

  testTruck = await Truck.create({
    immatriculation: truckImmat,
    modele: 'Volvo FH',
    marque: 'Volvo'
  });
});

afterEach(async () => {
  await Tire.deleteMany({});
});

afterAll(async () => {
  await Truck.deleteMany({ immatriculation: truckImmat });
  await User.deleteMany({ email: adminEmail });
  await mongoose.connection.close();
});

describe('Tire Controller', () => {
  describe('POST /api/tires', () => {
    it('devrait créer un pneu', async () => {
      let user = await User.findOne({ email: adminEmail });
      if (!user) {
        user = await User.create({
          name: 'Mohamed Admin',
          email: adminEmail,
          password: '123456',
          role: 'admin'
        });
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: adminEmail, password: '123456' });
        authToken = loginRes.body.token;
      }
      
      const tireData = {
        reference: 'PNEU-001',
        etat: 'neuf',
        kilometrage: 0,
        vehiculeType: 'camion',
        vehiculeId: testTruck._id
      };

      const res = await request(app)
        .post('/api/tires')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tireData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toBe(tireData.reference);
    });

    it('ne devrait pas créer un pneu sans token', async () => {
      const res = await request(app)
        .post('/api/tires')
        .send({
          reference: 'PNEU-001',
          vehiculeType: 'camion',
          vehiculeId: testTruck._id
        })
        .expect(401);
    });
  });

  describe('GET /api/tires', () => {
    it('devrait récupérer tous les pneus', async () => {
      let user = await User.findOne({ email: adminEmail });
      if (!user) {
        user = await User.create({
          name: 'Mohamed Admin',
          email: adminEmail,
          password: '123456',
          role: 'admin'
        });
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: adminEmail, password: '123456' });
        authToken = loginRes.body.token;
      }
      
      await Tire.create({
        reference: 'PNEU-001',
        etat: 'neuf',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id
      });

      const res = await request(app)
        .get('/api/tires')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tires/:id', () => {
    it('devrait récupérer un pneu par ID', async () => {
      let user = await User.findOne({ email: adminEmail });
      if (!user) {
        user = await User.create({
          name: 'Mohamed Admin',
          email: adminEmail,
          password: '123456',
          role: 'admin'
        });
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: adminEmail, password: '123456' });
        authToken = loginRes.body.token;
      }
      
      const tire = await Tire.create({
        reference: 'PNEU-001',
        etat: 'neuf',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id
      });

      const res = await request(app)
        .get(`/api/tires/${tire._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toBe('PNEU-001');
    });

    it('devrait retourner 404 si le pneu n\'existe pas', async () => {
      let user = await User.findOne({ email: adminEmail });
      if (!user) {
        user = await User.create({
          name: 'Mohamed Admin',
          email: adminEmail,
          password: '123456',
          role: 'admin'
        });
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: adminEmail, password: '123456' });
        authToken = loginRes.body.token;
      }
      
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/tires/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/tires/:id', () => {
    it('devrait modifier un pneu', async () => {
      const tire = await Tire.create({
        reference: 'PNEU-001',
        etat: 'neuf',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id
      });

      const res = await request(app)
        .put(`/api/tires/${tire._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          etat: 'usure'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.etat).toBe('usure');
    });
  });

  describe('DELETE /api/tires/:id', () => {
    it('devrait supprimer un pneu', async () => {
      const tire = await Tire.create({
        reference: 'PNEU-001',
        etat: 'neuf',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id
      });

      const res = await request(app)
        .delete(`/api/tires/${tire._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});

