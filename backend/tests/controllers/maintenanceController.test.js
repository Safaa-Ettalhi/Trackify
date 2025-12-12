const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Maintenance = require('../../models/Maintenance');
const Truck = require('../../models/Truck');
const app = require('../../server');

let adminToken;
let testTruck;
const adminEmail = 'admin.maintenance@trackify.ma';
const truckImmat = 'MAINT-12345-A-45';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trackify_test');
});

beforeEach(async () => {
  await User.deleteMany({ email: adminEmail });
  
  const admin = await User.create({
    name: 'Mohamed Admin',
    email: adminEmail,
    password: '123456',
    role: 'admin'
  });
  
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: adminEmail,
      password: '123456'
    });
  adminToken = adminLogin.body.token;

  let truck = await Truck.findOne({ immatriculation: truckImmat });
  if (!truck) {
    testTruck = await Truck.create({
      immatriculation: truckImmat,
      modele: 'Volvo FH',
      marque: 'Volvo'
    });
  } else {
    testTruck = truck;
  }
});

afterEach(async () => {
  await Maintenance.deleteMany({});
});

afterAll(async () => {
  await Truck.deleteMany({ immatriculation: truckImmat });
  await User.deleteMany({ email: adminEmail });
  await mongoose.connection.close();
});

describe('Maintenance Controller', () => {
  describe('POST /api/maintenance', () => {
    it('devrait créer une règle de maintenance', async () => {
      const maintenanceData = {
        type: 'vidange',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id,
        periodiciteKm: 10000,
        periodiciteJours: 90,
        derniereMaintenance: new Date(),
        prochaineMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      };

      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maintenanceData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe(maintenanceData.type);
    });

    it('ne devrait pas créer une maintenance sans token', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .send({
          type: 'vidange',
          vehiculeType: 'camion',
          vehiculeId: testTruck._id
        })
        .expect(401);
    });
  });

  describe('GET /api/maintenance', () => {
    it('devrait récupérer toutes les maintenances', async () => {
      await Maintenance.create({
        type: 'vidange',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id,
        periodiciteKm: 10000
      });

      const res = await request(app)
        .get('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('GET /api/maintenance/upcoming', () => {
    it('devrait récupérer les maintenances à venir', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await Maintenance.create({
        type: 'vidange',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id,
        prochaineMaintenance: yesterday
      });

      const res = await request(app)
        .get('/api/maintenance/upcoming')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/maintenance/:id', () => {
    it('devrait modifier une règle de maintenance', async () => {
      const maintenance = await Maintenance.create({
        type: 'vidange',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id,
        periodiciteKm: 10000
      });

      const res = await request(app)
        .put(`/api/maintenance/${maintenance._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          periodiciteKm: 15000
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.periodiciteKm).toBe(15000);
    });
  });
});

