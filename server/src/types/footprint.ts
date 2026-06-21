import { z } from 'zod';

// All numeric habit fields are non-negative. Frequencies are explicitly
// scoped per unit of time (week/month/year) in the field name to avoid
// ambiguity when converting everything to a common weekly basis.
export const footprintInputSchema = z.object({
  transport: z.object({
    carPetrolKmPerWeek: z.number().min(0).max(5000).default(0),
    carDieselKmPerWeek: z.number().min(0).max(5000).default(0),
    carElectricKmPerWeek: z.number().min(0).max(5000).default(0),
    carHybridKmPerWeek: z.number().min(0).max(5000).default(0),
    motorbikeKmPerWeek: z.number().min(0).max(2000).default(0),
    busKmPerWeek: z.number().min(0).max(2000).default(0),
    trainKmPerWeek: z.number().min(0).max(3000).default(0),
    metroKmPerWeek: z.number().min(0).max(2000).default(0),
    bicycleKmPerWeek: z.number().min(0).max(1000).default(0),
    walkKmPerWeek: z.number().min(0).max(200).default(0),
    // Flights are discrete events; fractional values are not physically meaningful.
    flightsShortHaulPerYear: z.number().int().min(0).max(100).default(0),
    flightsLongHaulPerYear: z.number().int().min(0).max(100).default(0)
  }),
  home: z.object({
    electricityKwhPerWeek: z.number().min(0).max(2000).default(0),
    usesRenewableElectricity: z.boolean().default(false),
    naturalGasKwhPerWeek: z.number().min(0).max(2000).default(0),
    lpgKgPerWeek: z.number().min(0).max(200).default(0)
  }),
  diet: z.object({
    type: z.enum(['meat_heavy', 'average', 'pescatarian', 'vegetarian', 'vegan'])
  }),
  consumption: z.object({
    // Item counts are discrete; fractional values are not meaningful.
    fastFashionItemsPerMonth: z.number().int().min(0).max(200).default(0),
    generalClothingItemsPerMonth: z.number().int().min(0).max(200).default(0),
    electronicsSmallPerYear: z.number().int().min(0).max(100).default(0),
    electronicsLargePerYear: z.number().int().min(0).max(50).default(0),
    foodDeliveryOrdersPerWeek: z.number().int().min(0).max(50).default(0),
    onlineParcelsPerWeek: z.number().int().min(0).max(50).default(0)
  }),
  waste: z.object({
    landfillKgPerWeek: z.number().min(0).max(200).default(0),
    recycledKgPerWeek: z.number().min(0).max(200).default(0),
    compostedKgPerWeek: z.number().min(0).max(200).default(0)
  })
});

export type FootprintInput = z.infer<typeof footprintInputSchema>;

export interface CategoryBreakdownResult {
  transport: number;
  home: number;
  diet: number;
  consumption: number;
  waste: number;
  totalWeeklyKgCo2e: number;
  totalAnnualKgCo2e: number;
}
