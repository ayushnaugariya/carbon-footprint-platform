import request from 'supertest';
import { createApp } from '../app';
import { closeDb } from '../config/db';

const app = createApp();

afterAll(() => {
  closeDb();
});

const validInput = {
  transport: {
    carPetrolKmPerWeek: 200,
    carDieselKmPerWeek: 0,
    carElectricKmPerWeek: 0,
    carHybridKmPerWeek: 0,
    motorbikeKmPerWeek: 0,
    busKmPerWeek: 0,
    trainKmPerWeek: 0,
    metroKmPerWeek: 0,
    bicycleKmPerWeek: 0,
    walkKmPerWeek: 0,
    flightsShortHaulPerYear: 0,
    flightsLongHaulPerYear: 0
  },
  home: { electricityKwhPerWeek: 10, usesRenewableElectricity: false, naturalGasKwhPerWeek: 5, lpgKgPerWeek: 0 },
  diet: { type: 'average' },
  consumption: {
    fastFashionItemsPerMonth: 0,
    generalClothingItemsPerMonth: 0,
    electronicsSmallPerYear: 0,
    electronicsLargePerYear: 0,
    foodDeliveryOrdersPerWeek: 0,
    onlineParcelsPerWeek: 0
  },
  waste: { landfillKgPerWeek: 1, recycledKgPerWeek: 1, compostedKgPerWeek: 0 }
};

async function getAuthToken(): Promise<string> {
  const res = await request(app).post('/api/auth/guest').send({ displayName: 'Tester' });
  return res.body.token;
}

describe('Actions catalog and completion', () => {
  it('exposes the recommendation catalog without auth', async () => {
    const res = await request(app).get('/api/actions/catalog');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.catalog)).toBe(true);
    expect(res.body.catalog.length).toBeGreaterThan(0);
  });

  it('rejects actionId containing injection-style characters', async () => {
    const token = await getAuthToken();
    // Path traversal attempt
    const res1 = await request(app)
      .post('/api/actions/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ actionId: '../../etc/passwd' });
    expect(res1.status).toBe(400);

    // SQL/script injection attempt
    const res2 = await request(app)
      .post('/api/actions/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ actionId: "'; DROP TABLE actions; --" });
    expect(res2.status).toBe(400);
  });

  it('rejects completing an unknown action id with a generic error (no input reflection)', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/actions/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ actionId: 'not-a-real-action' });
    expect(res.status).toBe(404);
    // The raw actionId must NOT appear in the error response (input reflection prevention).
    expect(res.body.error).not.toContain('not-a-real-action');
  });

  it('completes a valid action and accumulates savings', async () => {
    const token = await getAuthToken();
    const first = await request(app).post('/api/actions/complete').set('Authorization', `Bearer ${token}`).send({ actionId: 'transport-bike-commute' });
    expect(first.status).toBe(201);
    expect(first.body.totalSavingsKg).toBeGreaterThan(0);

    const second = await request(app).post('/api/actions/complete').set('Authorization', `Bearer ${token}`).send({ actionId: 'home-led-bulbs' });
    expect(second.body.totalSavingsKg).toBeGreaterThan(first.body.totalSavingsKg);
  });

  it('rejects completing the same action more than once', async () => {
    const token = await getAuthToken();
    const first = await request(app).post('/api/actions/complete').set('Authorization', `Bearer ${token}`).send({ actionId: 'home-led-bulbs' });
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/actions/complete').set('Authorization', `Bearer ${token}`).send({ actionId: 'home-led-bulbs' });
    expect(second.status).toBe(409);
    expect(second.body.error).toContain('Action already completed');
  });

  it('allows a guest user to complete actions', async () => {
    // Guest users get a real userId and should be able to track actions.
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/actions/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ actionId: 'diet-meatless-day' });
    expect(res.status).toBe(201);
    expect(res.body.record.action_id).toBe('diet-meatless-day');
  });

  it('lists completed actions for the authenticated user', async () => {
    const token = await getAuthToken();
    await request(app).post('/api/actions/complete').set('Authorization', `Bearer ${token}`).send({ actionId: 'waste-recycle-more' });

    const res = await request(app).get('/api/actions').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.completed.length).toBe(1);
  });
});

describe('Insights recommendations', () => {
  it('returns a helpful message when no footprint has been submitted yet', async () => {
    const token = await getAuthToken();
    const res = await request(app).get('/api/insights/recommendations').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.recommendations).toEqual([]);
  });

  it('returns ranked recommendations after a footprint submission, excluding completed ones', async () => {
    const token = await getAuthToken();
    await request(app).post('/api/footprint').set('Authorization', `Bearer ${token}`).send(validInput);
    await request(app).post('/api/actions/complete').set('Authorization', `Bearer ${token}`).send({ actionId: 'transport-bike-commute' });

    const res = await request(app).get('/api/insights/recommendations').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.persona.title).toBeDefined();
    const ids = res.body.recommendations.map((r: { id: string }) => r.id);
    expect(ids).not.toContain('transport-bike-commute');
  });
});

