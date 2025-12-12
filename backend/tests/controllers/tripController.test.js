const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Trip = require('../../models/Trip');
const Truck = require('../../models/Truck');
const Trailer = require('../../models/Trailer');
const app = require('../../server');

let adminToken;
let driverToken;
let testTruck;
let testTrailer;
let testDriver;
const adminEmail = 'admin.trip@trackify.ma';
const driverEmail = 'chauffeur.trip@trackify.ma';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trackify_test');
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
  testDriver = await User.create({
    name: 'Ahmed Benali',
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
  driverToken = driverLogin.body.token;
  await Truck.deleteMany({ immatriculation: 'TRIP-12345-A-45' });
  await Trailer.deleteMany({ numero: 1001 });

  testTruck = await Truck.create({
    immatriculation: 'TRIP-12345-A-45',
    modele: 'Volvo FH',
    marque: 'Volvo'
  });

  testTrailer = await Trailer.create({
    numero: 1001,
    type: 'Frigorifique'
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
  testDriver = await User.create({
    name: 'Ahmed Benali',
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
  driverToken = driverLogin.body.token;
  let truck = await Truck.findOne({ immatriculation: 'TRIP-12345-A-45' });
  if (!truck) {
    testTruck = await Truck.create({
      immatriculation: 'TRIP-12345-A-45',
      modele: 'Volvo FH',
      marque: 'Volvo'
    });
  } else {
    testTruck = truck;
  }

  let trailer = await Trailer.findOne({ numero: 1001 });
  if (!trailer) {
    testTrailer = await Trailer.create({
      numero: 1001,
      type: 'Frigorifique'
    });
  } else {
    testTrailer = trailer;
  }
});

afterEach(async () => {
  await Trip.deleteMany({});
});

afterAll(async () => {
  await Truck.deleteMany({ immatriculation: 'TRIP-12345-A-45' });
  await Trailer.deleteMany({ numero: 1001 });
  await User.deleteMany({ email: { $in: [adminEmail, driverEmail] } });
  await mongoose.connection.close();
});

describe('Trip Controller', () => {
  describe('POST /api/trips', () => {
    it('devrait créer un trajet (admin)', async () => {
      const tripData = {
        numero: 'TRIP-TEST-001',
        lieuDepart: 'Casablanca',
        lieuArrivee: 'Rabat',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id,
        remorque: testTrailer._id
      };

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tripData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.numero).toBe(tripData.numero);
    });

    it('ne devrait pas créer un trajet sans être admin', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          numero: 'TRIP-002',
          lieuDepart: 'Casablanca',
          lieuArrivee: 'Marrakech',
          dateDepart: new Date(),
          chauffeur: testDriver._id,
          camion: testTruck._id
        })
        .expect(403);
    });
  });

  describe('GET /api/trips', () => {
    beforeEach(async () => {
      await Trip.deleteMany({ numero: 'TRIP-TEST-001' });
      
      await Trip.create({
        numero: 'TRIP-TEST-001',
        lieuDepart: 'Casablanca',
        lieuArrivee: 'Rabat',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id
      });
    });

    it('devrait récupérer tous les trajets (admin)', async () => {
      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('devrait récupérer seulement les trajets du chauffeur', async () => {
      const otherDriverEmail = 'fatima.trip@trackify.ma';
      await User.deleteMany({ email: otherDriverEmail });
      
      const otherDriver = await User.create({
        name: 'Fatima Alami',
        email: otherDriverEmail,
        password: '123456',
        role: 'chauffeur'
      });

      await Trip.deleteMany({ numero: 'TRIP-TEST-OTHER-002' });

      await Trip.create({
        numero: 'TRIP-TEST-OTHER-002',
        lieuDepart: 'Tanger',
        lieuArrivee: 'Fès',
        dateDepart: new Date(),
        chauffeur: otherDriver._id,
        camion: testTruck._id
      });
      
      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(res.body.count).toBe(1);
    });
  });

  describe('GET /api/trips/:id', () => {
    it('devrait récupérer un trajet par ID', async () => {
      await Trip.deleteMany({ numero: 'TRIP-TEST-ID-001' });
      
      const trip = await Trip.create({
        numero: 'TRIP-TEST-ID-001',
        lieuDepart: 'Casablanca',
        lieuArrivee: 'Rabat',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id
      });

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
        adminToken = loginRes.body.token;
      }

      const res = await request(app)
        .get(`/api/trips/${trip._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.numero).toBe('TRIP-TEST-ID-001');
    });

    it('devrait retourner 404 si le trajet n\'existe pas', async () => {
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
        adminToken = loginRes.body.token;
      }
      
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/trips/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});

