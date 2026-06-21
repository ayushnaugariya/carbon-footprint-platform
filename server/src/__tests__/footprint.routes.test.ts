import request from 'supertest';
import { createApp } from '../app';
import { closeDb } from '../config/db';

const app = createApp();

afterAll(() => {
  closeDb();
});

const validInput = {
  transport: {
    carPetrolKmPerWeek: 100,
    carDieselKmPerWeek: 0,
    carElectricKmPerWeek: 0,
    carHybridKmPerWeek: 0,
    motorbikeKmPerWeek: 0,
    busKmPerWeek: 10,
    trainKmPerWeek: 0,
    metroKmPerWeek: 0,
    bicycleKmPerWeek: 5,
    walkKmPerWeek: 2,
    flightsShortHaulPerYear: 1,
    flightsLongHaulPerYear: 0
  },
  home: { electricityKwhPerWeek: 60, usesRenewableElectricity: false, naturalGasKwhPerWeek: 30, lpgKgPerWeek: 0 },
  diet: { type: 'average' },
  consumption: {
    fastFashionItemsPerMonth: 1,
    generalClothingItemsPerMonth: 0,
    electronicsSmallPerYear: 1,
    electronicsLargePerYear: 0,
    foodDeliveryOrdersPerWeek: 1,
    onlineParcelsPerWeek: 2
  },
  waste: { landfillKgPerWeek: 5, recycledKgPerWeek: 3, compostedKgPerWeek: 1 }
};

async function getAuthToken(): Promise<string> {
  const res = await request(app).post('/api/auth/guest').send({ displayName: 'Tester' });
  return res.body.token;
}

describe('Footprint routes', () => {
  it('rejects requests without authentication', async () => {
    const res = await request(app).post('/api/footprint').send(validInput);
    expect(res.status).toBe(401);
  });

  it('rejects invalid input shape', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/footprint')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validInput, diet: { type: 'not_a_real_diet' } });
    expect(res.status).toBe(400);
  });

  it('accepts valid input and returns a breakdown with persona and percentile', async () => {
    const token = await getAuthToken();
    const res = await request(app).post('/api/footprint').set('Authorization', `Bearer ${token}`).send(validInput);

    expect(res.status).toBe(201);
    expect(res.body.breakdown.totalWeeklyKgCo2e).toBeGreaterThan(0);
    expect(res.body.persona.title).toBeDefined();
    expect(res.body.percentile).toBeGreaterThanOrEqual(0);
  });

  it('stores and returns history across multiple submissions', async () => {
    const token = await getAuthToken();
    await request(app).post('/api/footprint').set('Authorization', `Bearer ${token}`).send(validInput);
    await request(app).post('/api/footprint').set('Authorization', `Bearer ${token}`).send(validInput);

    const res = await request(app).get('/api/footprint/history').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.entries.length).toBe(2);
  });

  it('returns null insights for a user with no entries yet', async () => {
    const token = await getAuthToken();
    const res = await request(app).get('/api/footprint/latest').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.entry).toBeNull();
    expect(res.body.trend.available).toBe(false);
  });

  it('returns persona and trend info for a user with entries', async () => {
    const token = await getAuthToken();
    await request(app).post('/api/footprint').set('Authorization', `Bearer ${token}`).send(validInput);

    const res = await request(app).get('/api/footprint/latest').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.entry).not.toBeNull();
    expect(res.body.persona.title).toBeDefined();
  });

  it('rejects fractional flight count', async () => {
    const token = await getAuthToken();
    const badInput = {
      ...validInput,
      transport: {
        ...validInput.transport,
        flightsShortHaulPerYear: 1.5,
      },
    };
    const res = await request(app)
      .post('/api/footprint')
      .set('Authorization', `Bearer ${token}`)
      .send(badInput);
    expect(res.status).toBe(400);
  });

  it('rejects fractional clothing item count', async () => {
    const token = await getAuthToken();
    const badInput = {
      ...validInput,
      consumption: {
        ...validInput.consumption,
        generalClothingItemsPerMonth: 2.3,
      },
    };
    const res = await request(app)
      .post('/api/footprint')
      .set('Authorization', `Bearer ${token}`)
      .send(badInput);
    expect(res.status).toBe(400);
  });

  it('accepts zero-value footprint and returns non-negative numbers', async () => {
    const token = await getAuthToken();
    const zeroInput = {
      transport: {
        carPetrolKmPerWeek: 0,
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
      home: { electricityKwhPerWeek: 0, usesRenewableElectricity: false, naturalGasKwhPerWeek: 0, lpgKgPerWeek: 0 },
      diet: { type: 'vegan' },
      consumption: {
        fastFashionItemsPerMonth: 0,
        generalClothingItemsPerMonth: 0,
        electronicsSmallPerYear: 0,
        electronicsLargePerYear: 0,
        foodDeliveryOrdersPerWeek: 0,
        onlineParcelsPerWeek: 0
      },
      waste: { landfillKgPerWeek: 0, recycledKgPerWeek: 0, compostedKgPerWeek: 0 }
    };
    const res = await request(app)
      .post('/api/footprint')
      .set('Authorization', `Bearer ${token}`)
      .send(zeroInput);
    expect(res.status).toBe(201);
    expect(res.body.breakdown.totalWeeklyKgCo2e).toBeGreaterThanOrEqual(0);
  });
});
