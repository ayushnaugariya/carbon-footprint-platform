import { calculateConsumption, calculateDiet, calculateFootprint, calculateHome, calculateTransport, calculateWaste } from '../services/emissionCalculator';
import { FootprintInput } from '../types/footprint';

const emptyInput: FootprintInput = {
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
  diet: { type: 'average' },
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

describe('emissionCalculator', () => {
  describe('calculateTransport', () => {
    it('returns 0 for entirely zero/zero-emission transport', () => {
      expect(calculateTransport(emptyInput.transport)).toBe(0);
    });

    it('scales linearly with petrol car distance', () => {
      const a = calculateTransport({ ...emptyInput.transport, carPetrolKmPerWeek: 100 });
      const b = calculateTransport({ ...emptyInput.transport, carPetrolKmPerWeek: 200 });
      expect(b).toBeCloseTo(a * 2, 5);
    });

    it('produces zero emissions for cycling and walking', () => {
      const result = calculateTransport({ ...emptyInput.transport, bicycleKmPerWeek: 50, walkKmPerWeek: 20 });
      expect(result).toBe(0);
    });

    it('includes a non-zero contribution from long-haul flights', () => {
      const noFlights = calculateTransport(emptyInput.transport);
      const withFlight = calculateTransport({ ...emptyInput.transport, flightsLongHaulPerYear: 1 });
      expect(withFlight).toBeGreaterThan(noFlights);
    });

    it('electric car emits less than petrol car for the same distance', () => {
      const petrol = calculateTransport({ ...emptyInput.transport, carPetrolKmPerWeek: 100 });
      const electric = calculateTransport({ ...emptyInput.transport, carElectricKmPerWeek: 100 });
      expect(electric).toBeLessThan(petrol);
    });
  });

  describe('calculateHome', () => {
    it('renewable electricity produces less than grid electricity for the same usage', () => {
      const grid = calculateHome({ ...emptyInput.home, electricityKwhPerWeek: 100, usesRenewableElectricity: false });
      const renewable = calculateHome({ ...emptyInput.home, electricityKwhPerWeek: 100, usesRenewableElectricity: true });
      expect(renewable).toBeLessThan(grid);
    });
  });

  describe('calculateDiet', () => {
    it('orders diet types from highest to lowest footprint as expected', () => {
      const meatHeavy = calculateDiet({ type: 'meat_heavy' });
      const average = calculateDiet({ type: 'average' });
      const vegetarian = calculateDiet({ type: 'vegetarian' });
      const vegan = calculateDiet({ type: 'vegan' });

      expect(meatHeavy).toBeGreaterThan(average);
      expect(average).toBeGreaterThan(vegetarian);
      expect(vegetarian).toBeGreaterThan(vegan);
    });
  });

  describe('calculateConsumption', () => {
    it('increases with more fast fashion purchases', () => {
      const base = calculateConsumption(emptyInput.consumption);
      const more = calculateConsumption({ ...emptyInput.consumption, fastFashionItemsPerMonth: 4 });
      expect(more).toBeGreaterThan(base);
    });
  });

  describe('calculateWaste', () => {
    it('recycling the same mass produces less footprint than landfill', () => {
      const landfill = calculateWaste({ landfillKgPerWeek: 10, recycledKgPerWeek: 0, compostedKgPerWeek: 0 });
      const recycled = calculateWaste({ landfillKgPerWeek: 0, recycledKgPerWeek: 10, compostedKgPerWeek: 0 });
      expect(recycled).toBeLessThan(landfill);
    });
  });

  describe('calculateFootprint', () => {
    it('sums all categories into matching weekly and annual totals', () => {
      const result = calculateFootprint(emptyInput);
      const expectedWeekly = result.transport + result.home + result.diet + result.consumption + result.waste;
      expect(result.totalWeeklyKgCo2e).toBeCloseTo(expectedWeekly, 2);
      expect(result.totalAnnualKgCo2e).toBeCloseTo(result.totalWeeklyKgCo2e * 52, 2);
    });

    it('returns all non-negative category values for valid input', () => {
      const result = calculateFootprint({
        ...emptyInput,
        transport: { ...emptyInput.transport, carPetrolKmPerWeek: 150 },
        home: { ...emptyInput.home, electricityKwhPerWeek: 80 }
      });
      expect(result.transport).toBeGreaterThanOrEqual(0);
      expect(result.home).toBeGreaterThanOrEqual(0);
      expect(result.diet).toBeGreaterThanOrEqual(0);
      expect(result.consumption).toBeGreaterThanOrEqual(0);
      expect(result.waste).toBeGreaterThanOrEqual(0);
    });
  });
});
