import { getStore } from '../config/db';
import { CategoryBreakdownResult } from '../types/footprint';

export interface FootprintEntryRecord {
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

export function insertFootprintEntry(id: string, userId: string, breakdown: CategoryBreakdownResult): FootprintEntryRecord {
  const record: FootprintEntryRecord = {
    id,
    user_id: userId,
    transport: breakdown.transport,
    home: breakdown.home,
    diet: breakdown.diet,
    consumption: breakdown.consumption,
    waste: breakdown.waste,
    total_weekly: breakdown.totalWeeklyKgCo2e,
    total_annual: breakdown.totalAnnualKgCo2e,
    created_at: new Date().toISOString()
  };

  getStore().insertFootprintEntry(record);
  return record;
}

export function listFootprintEntriesForUser(userId: string, limit = 100): FootprintEntryRecord[] {
  return getStore().getFootprintEntriesForUser(userId, limit);
}

export function getLatestFootprintEntry(userId: string): FootprintEntryRecord | undefined {
  return getStore().getLatestFootprintEntryForUser(userId);
}
