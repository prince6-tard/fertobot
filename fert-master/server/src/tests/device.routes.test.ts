import request from 'supertest';
import app from '../index';
import { seedUser, seedProbe } from './setup';
import SensorReading from '../models/SensorReading';
import Probe from '../models/Probe';
import { deliverCommand } from '../services/commandQueue';

const DEVICE_API_KEY = process.env.DEVICE_API_KEY || 'fertobot-esp32-key-2024';

describe('Device Routes', () => {
  let userId: any;

  beforeEach(async () => {
    const { user } = await seedUser();
    userId = user._id;
  });

  describe('POST /api/device/reading', () => {
    it('returns 401 if no valid x-api-key', async () => {
      const res = await request(app)
        .post('/api/device/reading')
        .send({ probeUuid: '123' });
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid device API key/);
    });

    it('returns 400 on missing required fields via Zod', async () => {
      const res = await request(app)
        .post('/api/device/reading')
        .set('x-api-key', DEVICE_API_KEY)
        .send({ probeUuid: '123' }); // missing soilMoisture, temperature
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
      expect(res.body.errors).toBeDefined();
    });

    it('returns 400 on out-of-range values via Zod', async () => {
      const res = await request(app)
        .post('/api/device/reading')
        .set('x-api-key', DEVICE_API_KEY)
        .send({
          probeUuid: '123',
          soilMoisture: 150, // max is 100
          temperature: 20
        });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('auto-provisions probe and saves reading', async () => {
      const res = await request(app)
        .post('/api/device/reading')
        .set('x-api-key', DEVICE_API_KEY)
        .send({
          probeUuid: 'NEW-UUID',
          soilMoisture: 45,
          temperature: 28,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();

      const probe = await Probe.findOne({ uuid: 'NEW-UUID' });
      expect(probe).not.toBeNull();
      expect(probe?.userId.toString()).toBe(userId.toString());

      const reading = await SensorReading.findOne({ probeId: probe?._id });
      expect(reading).not.toBeNull();
      expect(reading?.soilMoisture).toBe(45);
    });

    it('piggybacks pending command in response', async () => {
      await seedProbe(userId, 'CMD-UUID');
      deliverCommand('CMD-UUID', { relay: 'on' });

      const res = await request(app)
        .post('/api/device/reading')
        .set('x-api-key', DEVICE_API_KEY)
        .send({
          probeUuid: 'CMD-UUID',
          soilMoisture: 40,
          temperature: 25,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.command).toEqual({ relay: 'on' });
    });
  });

  describe('GET /api/device/command', () => {
    it('returns 400 if probeUuid is missing', async () => {
      const res = await request(app)
        .get('/api/device/command')
        .set('x-api-key', DEVICE_API_KEY);
      expect(res.status).toBe(400);
    });

    it('returns 204 when no command pending', async () => {
      const res = await request(app)
        .get('/api/device/command?probeUuid=test-device')
        .set('x-api-key', DEVICE_API_KEY);
      expect(res.status).toBe(204);
    });

    it('returns 200 and consumes command when pending', async () => {
      deliverCommand('test-device', { pump: true });
      
      const res = await request(app)
        .get('/api/device/command?probeUuid=test-device')
        .set('x-api-key', DEVICE_API_KEY);
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ pump: true });

      // Ensure consumed
      const res2 = await request(app)
        .get('/api/device/command?probeUuid=test-device')
        .set('x-api-key', DEVICE_API_KEY);
      expect(res2.status).toBe(204);
    });
  });
});
