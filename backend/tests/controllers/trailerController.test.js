const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Trailer = require('../../models/Trailer');
const app = require('../../server');

let authToken;
const adminEmail = 'admin.trailer@trackify.ma';

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
  
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: adminEmail,
      password: '123456'
    });
  
  authToken = loginRes.body.token;
});

afterEach(async () => {
  await Trailer.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({ email: adminEmail });
  await mongoose.connection.close();
});

describe('Trailer Controller', () => {
  describe('POST /api/trailers', () => {
    it('devrait créer une remorque', async () => {
      const trailerData = {
        numero: 1001,
        type: 'Frigorifique',
        capacite: 20,
        etat: 'disponible'
      };

      const res = await request(app)
        .post('/api/trailers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(trailerData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.numero).toBe(trailerData.numero);
    });

    it('ne devrait pas créer une remorque sans token', async () => {
      const res = await request(app)
        .post('/api/trailers')
        .send({
          numero: 1001,
          type: 'Frigorifique'
        })
        .expect(401);
    });
  });

  describe('GET /api/trailers', () => {
    it('devrait récupérer toutes les remorques', async () => {
      await Trailer.deleteMany({ numero: 1001 });
      
      const trailer = await Trailer.create({
        numero: 1001,
        type: 'Frigorifique',
        capacite: 20
      });

      const res = await request(app)
        .get('/api/trailers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('GET /api/trailers/:id', () => {
    it('devrait récupérer une remorque par ID', async () => {
      const trailer = await Trailer.create({
        numero: 1001,
        type: 'Frigorifique',
        capacite: 20
      });

      const res = await request(app)
        .get(`/api/trailers/${trailer._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.numero).toBe(1001);
    });

    it('devrait retourner 404 si la remorque n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/trailers/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/trailers/:id', () => {
    it('devrait modifier une remorque', async () => {
      const trailer = await Trailer.create({
        numero: 1001,
        type: 'Frigorifique',
        capacite: 20
      });

      const res = await request(app)
        .put(`/api/trailers/${trailer._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          capacite: 25
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.capacite).toBe(25);
    });
  });

  describe('DELETE /api/trailers/:id', () => {
    it('devrait supprimer une remorque', async () => {
      const trailer = await Trailer.create({
        numero: 1001,
        type: 'Frigorifique'
      });

      const res = await request(app)
        .delete(`/api/trailers/${trailer._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});

