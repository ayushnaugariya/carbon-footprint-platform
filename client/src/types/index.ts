export type DietType = 'meat_heavy' | 'average' | 'pescatarian' | 'vegetarian' | 'vegan';

export interface FootprintInput {
  transport: {
    carPetrolKmPerWeek: number;
    carDieselKmPerWeek: number;
    carElectricKmPerWeek: number;
    carHybridKmPerWeek: number;
    motorbikeKmPerWeek: number;
    busKmPerWeek: number;
    trainKmPerWeek: number;
    metroKmPerWeek: number;
    bicycleKmPerWeek: number;
    walkKmPerWeek: number;
    flightsShortHaulPerYear: number;
    flightsLongHaulPerYear: number;
  };
  home: {
    electricityKwhPerWeek: number;
    usesRenewableElectricity: boolean;
    naturalGasKwhPerWeek: number;
    lpgKgPerWeek: number;
  };
  diet: {
    type: DietType;
  };
  consumption: {
    fastFashionItemsPerMonth: number;
    generalClothingItemsPerMonth: number;
    electronicsSmallPerYear: number;
    electronicsLargePerYear: number;
    foodDeliveryOrdersPerWeek: number;
    onlineParcelsPerWeek: number;
  };
  waste: {
    landfillKgPerWeek: number;
    recycledKgPerWeek: number;
    compostedKgPerWeek: number;
  };
}

export interface CategoryBreakdown {
  transport: number;
  home: number;
  diet: number;
  consumption: number;
  waste: number;
  totalWeeklyKgCo2e: number;
  totalAnnualKgCo2e: number;
}

export interface FootprintEntry {
  id: string;
  user_id: string;
  transport: number;
  home: number;
  diet: number;
  consumption: number;
  waste: number;
  total_weekly: number;
  total_annual: number;
  created_at: string;
}

export type CategoryDimension = 'transport' | 'home' | 'diet' | 'consumption' | 'waste';

export interface PersonaInfo {
  id: string;
  title: string;
  focus: CategoryDimension;
  description: string;
}

export interface TrendResult {
  available: boolean;
  reason?: string;
  model?: { slope: number; intercept: number; rSquared: number };
  projectedIn30Days?: number;
  percentChangeProjected?: number;
}

export interface RecommendationAction {
  id: string;
  category: CategoryDimension;
  title: string;
  description: string;
  estimatedWeeklySavingsKg: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priorityScore?: number;
}

export interface CompletedAction {
  id: string;
  user_id: string;
  action_id: string;
  estimated_savings_kg: number;
  completed_at: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string;
  isGuest: boolean;
}
