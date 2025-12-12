const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Trip = require('../../models/Trip');
const Truck = require('../../models/Truck');
const app = require('../../server');

let driverToken;
let otherDriverToken;
let testTruck;
let testDriver;
let otherDriver;
const driver1Email = 'ahmed.driver@trackify.ma';
const driver2Email = 'fatima.driver@trackify.ma';
const truckImmat = 'DRIVER-12345-A-45';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trackify_test');

  await User.deleteMany({ email: { $in: [driver1Email, driver2Email] } });
  await Truck.deleteMany({ immatriculation: truckImmat });

  testDriver = await User.create({
    name: 'Ahmed Benali',
    email: driver1Email,
    password: '123456',
    role: 'chauffeur'
  });
  
  const driverLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: driver1Email,
      password: '123456'
    });
  driverToken = driverLogin.body.token;

  otherDriver = await User.create({
    name: 'Fatima Alami',
    email: driver2Email,
    password: '123456',
    role: 'chauffeur'
  });
  
  const otherLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: driver2Email,
      password: '123456'
    });
   otherDriverToken = otherLogin.body.token;

  testTruck = await Truck.create({
    immatriculation: truckImmat,
    modele: 'Volvo FH',
    marque: 'Volvo'
  });
});

beforeEach(async () => {
  await User.deleteMany({ email: { $in: [driver1Email, driver2Email] } });
  
  testDriver = await User.create({
    name: 'Ahmed Benali',
    email: driver1Email,
    password: '123456',
    role: 'chauffeur'
  });
  
  const driverLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: driver1Email,
      password: '123456'
    });
  driverToken = driverLogin.body.token;

  otherDriver = await User.create({
    name: 'Fatima Alami',
    email: driver2Email,
    password: '123456',
    role: 'chauffeur'
  });
  
  const otherLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: driver2Email,
      password: '123456'
    });
  otherDriverToken = otherLogin.body.token;

  
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
  await Trip.deleteMany({});
});

afterAll(async () => {
  await Truck.deleteMany({ immatriculation: truckImmat });
  await User.deleteMany({ email: { $in: [driver1Email, driver2Email] } });
  await mongoose.connection.close();
});

describe('Driver Controller', () => {
  describe('GET /api/driver/trips', () => {
    it('devrait récupérer les trajets du chauffeur connecté', async () => {
     
      await Trip.deleteMany({ numero: 'DRIVER-TRIP-001' });
      const trip = await Trip.create({
        numero: 'DRIVER-TRIP-001',
        lieuDepart: 'Casablanca',
        lieuArrivee: 'Rabat',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id
      });

      const res = await request(app)
        .get('/api/driver/trips')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    it('ne devrait pas récupérer les trajets d\'un autre chauffeur', async () => {
      await Trip.deleteMany({ numero: 'DRIVER-TRIP-OTHER-002' });
      await Trip.create({
        numero: 'DRIVER-TRIP-OTHER-002',
        lieuDepart: 'Tanger',
        lieuArrivee: 'Fès',
        dateDepart: new Date(),
        chauffeur: otherDriver._id,
        camion: testTruck._id
      });

      const res = await request(app)
        .get('/api/driver/trips')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);
      expect(res.body.count).toBe(0);
    });
  });

  describe('PUT /api/driver/trips/:id/status', () => {
    it('devrait mettre à jour le statut d\'un trajet', async () => {
      await Trip.deleteMany({ numero: 'DRIVER-TRIP-STATUS-001' });
      
      const trip = await Trip.create({
        numero: 'DRIVER-TRIP-STATUS-001',
        lieuDepart: 'Casablanca',
        lieuArrivee: 'Rabat',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id,
        statut: 'a_faire'
      });

      const res = await request(app)
        .put(`/api/driver/trips/${trip._id}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          statut: 'en_cours'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.statut).toBe('en_cours');
    });

    it('ne devrait pas permettre à un chauffeur de modifier le trajet d\'un autre', async () => {
      await Trip.deleteMany({ numero: 'DRIVER-TRIP-OTHER-001' });
      
      const trip = await Trip.create({
        numero: 'DRIVER-TRIP-OTHER-001',
        lieuDepart: 'Tanger',
        lieuArrivee: 'Fès',
        dateDepart: new Date(),
        chauffeur: otherDriver._id,
        camion: testTruck._id
      });

      const res = await request(app)
        .put(`/api/driver/trips/${trip._id}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          statut: 'en_cours'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/driver/trips/:id/update', () => {
    it('devrait mettre à jour les données d\'un trajet', async () => {
      await Trip.deleteMany({ numero: 'DRIVER-TRIP-UPDATE-001' });
      
      const trip = await Trip.create({
        numero: 'DRIVER-TRIP-UPDATE-001',
        lieuDepart: 'Casablanca',
        lieuArrivee: 'Rabat',
        dateDepart: new Date(),
        chauffeur: testDriver._id,
        camion: testTruck._id
      });

      const res = await request(app)
        .put(`/api/driver/trips/${trip._id}/update`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          kilometrageDepart: 50000,
          kilometrageArrivee: 50150,
          volumeGasoil: 45.5,
          remarques: 'Trajet effectué sans problème'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.kilometrageDepart).toBe(50000);
      expect(res.body.data.kilometrageArrivee).toBe(50150);
      expect(res.body.data.volumeGasoil).toBe(45.5);
    });
  });
});

