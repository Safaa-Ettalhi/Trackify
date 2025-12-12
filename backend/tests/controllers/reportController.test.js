const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Trip = require('../../models/Trip');
const Truck = require('../../models/Truck');
const Maintenance = require('../../models/Maintenance');
const app = require('../../server');

let adminToken;
let testTruck;
let testDriver;
const adminEmail = 'admin.report@trackify.ma';
const driverEmail = 'ahmed.report@trackify.ma';
const truckImmat = 'REPORT-12345-A-45';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trackify_test');

  await User.deleteMany({ email: { $in: [adminEmail, driverEmail] } });
  await Truck.deleteMany({ immatriculation: truckImmat });
  
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

  testTruck = await Truck.create({
    immatriculation: truckImmat,
    modele: 'Volvo FH',
    marque: 'Volvo'
  });

  testDriver = await User.create({
    name: 'Ahmed Benali',
    email: driverEmail,
    password: '123456',
    role: 'chauffeur'
  });
});

beforeEach(async () => {
  await User.deleteMany({ email: { $in: [adminEmail, driverEmail] } });
  
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

  testDriver = await User.create({
    name: 'Ahmed Benali',
    email: driverEmail,
    password: '123456',
    role: 'chauffeur'
  });
});

afterEach(async () => {
  await Trip.deleteMany({});
  await Maintenance.deleteMany({});
});

afterAll(async () => {
  await Truck.deleteMany({ immatriculation: truckImmat });
  await User.deleteMany({ email: { $in: [adminEmail, driverEmail] } });
  await mongoose.connection.close();
});

describe('Report Controller', () => {
  describe('GET /api/reports/consumption', () => {
    it('devrait générer un rapport de consommation', async () => {
      await Trip.deleteMany({ numero: { $in: ['REPORT-TRIP-001', 'REPORT-TRIP-002'] } });
      
      await Trip.create({
        numero: 'REPORT-TRIP-001',
        lieuDepart: 'Casablanca',
        lieuArrivee: 'Rabat',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id,
        statut: 'termine',
        volumeGasoil: 50
      });

      await Trip.create({
        numero: 'REPORT-TRIP-002',
        lieuDepart: 'Rabat',
        lieuArrivee: 'Marrakech',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id,
        statut: 'termine',
        volumeGasoil: 45
      });

      const res = await request(app)
        .get('/api/reports/consumption')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].totalGasoil).toBe(95); 
    });

    it('ne devrait pas être accessible sans être admin', async () => {
      const driverEmail = 'fatima.report@trackify.ma';
      await User.deleteMany({ email: driverEmail });
      
      const driver = await User.create({
        name: 'Fatima Alami',
        email: driverEmail,
        password: '123456',
        role: 'chauffeur'
      });

      const driverLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: driverEmail,
          password: '123456'
        });

      const res = await request(app)
        .get('/api/reports/consumption')
        .set('Authorization', `Bearer ${driverLogin.body.token}`)
        .expect(403);
    });
  });

  describe('GET /api/reports/kilometrage', () => {
    it('devrait générer un rapport de kilométrage', async () => {
      await Trip.deleteMany({ numero: 'REPORT-TRIP-KM-001' });
      
      await Trip.create({
        numero: 'REPORT-TRIP-KM-001',
        lieuDepart: 'Casablanca',
        lieuArrivee: 'Rabat',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id,
        statut: 'termine',
        kilometrageDepart: 50000,
        kilometrageArrivee: 50150
      });

      const res = await request(app)
        .get('/api/reports/kilometrage')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].totalKilometres).toBe(150); 
    });
  });

  describe('GET /api/reports/maintenance', () => {
    it('devrait générer un rapport de maintenance', async () => {
      await Maintenance.deleteMany({ vehiculeId: testTruck._id });
      
      await Maintenance.create({
        type: 'vidange',
        vehiculeType: 'camion',
        vehiculeId: testTruck._id,
        periodiciteKm: 10000,
        prochaineMaintenance: new Date()
      });

      const res = await request(app)
        .get('/api/reports/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });
});

