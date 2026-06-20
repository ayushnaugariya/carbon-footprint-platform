import factors from '../data/emissionFactors.json';
import { CategoryBreakdownResult, FootprintInput } from '../types/footprint';

const AVG_SHORT_HAUL_FLIGHT_KM = 1500;
const AVG_LONG_HAUL_FLIGHT_KM = 6500;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateTransport(input: FootprintInput['transport']): number {
  const f = factors.transport;
  const flightShortHaulWeekly = (input.flightsShortHaulPerYear * AVG_SHORT_HAUL_FLIGHT_KM * f.flight_short_haul_km) / 52;
  const flightLongHaulWeekly = (input.flightsLongHaulPerYear * AVG_LONG_HAUL_FLIGHT_KM * f.flight_long_haul_km) / 52;

  const total =
    input.carPetrolKmPerWeek * f.car_petrol_km +
    input.carDieselKmPerWeek * f.car_diesel_km +
    input.carElectricKmPerWeek * f.car_electric_km +
    input.carHybridKmPerWeek * f.car_hybrid_km +
    input.motorbikeKmPerWeek * f.motorbike_km +
    input.busKmPerWeek * f.bus_km +
    input.trainKmPerWeek * f.train_km +
    input.metroKmPerWeek * f.metro_km +
    input.bicycleKmPerWeek * f.bicycle_km +
    input.walkKmPerWeek * f.walk_km +
    flightShortHaulWeekly +
    flightLongHaulWeekly;

  return round2(total);
}

export function calculateHome(input: FootprintInput['home']): number {
  const f = factors.home_energy;
  const electricityFactor = input.usesRenewableElectricity ? f.renewable_electricity_kwh : f.electricity_kwh;

  const total =
    input.electricityKwhPerWeek * electricityFactor +
    input.naturalGasKwhPerWeek * f.natural_gas_kwh +
    input.lpgKgPerWeek * f.lpg_kg;

  return round2(total);
}

export function calculateDiet(input: FootprintInput['diet']): number {
  const f = factors.diet;
  const dailyKey = `${input.type}_daily` as keyof typeof f;
  const dailyValue = f[dailyKey];
  return round2(dailyValue * 7);
}

export function calculateConsumption(input: FootprintInput['consumption']): number {
  const f = factors.consumption;

  const total =
    (input.fastFashionItemsPerMonth * f.fast_fashion_item) / 4.345 +
    (input.generalClothingItemsPerMonth * f.general_clothing_item) / 4.345 +
    (input.electronicsSmallPerYear * f.electronics_small_item) / 52 +
    (input.electronicsLargePerYear * f.electronics_large_item) / 52 +
    input.foodDeliveryOrdersPerWeek * f.food_delivery_order +
    input.onlineParcelsPerWeek * f.online_parcel_delivery;

  return round2(total);
}

export function calculateWaste(input: FootprintInput['waste']): number {
  const f = factors.waste;

  const total =
    input.landfillKgPerWeek * f.landfill_kg +
    input.recycledKgPerWeek * f.recycled_kg +
    input.compostedKgPerWeek * f.composted_kg;

  return round2(total);
}

/** Computes the full weekly category breakdown and totals for a footprint input. */
export function calculateFootprint(input: FootprintInput): CategoryBreakdownResult {
  const transport = calculateTransport(input.transport);
  const home = calculateHome(input.home);
  const diet = calculateDiet(input.diet);
  const consumption = calculateConsumption(input.consumption);
  const waste = calculateWaste(input.waste);

  const totalWeeklyKgCo2e = round2(transport + home + diet + consumption + waste);
  const totalAnnualKgCo2e = round2(totalWeeklyKgCo2e * 52);

  return { transport, home, diet, consumption, waste, totalWeeklyKgCo2e, totalAnnualKgCo2e };
}
