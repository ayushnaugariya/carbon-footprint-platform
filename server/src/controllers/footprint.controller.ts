import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { calculateFootprint } from '../services/emissionCalculator';
import { insertFootprintEntry, listFootprintEntriesForUser } from '../models/footprintModel';
import { computePercentile, computeTrend, detectPersona, TrendPoint } from '../services/mlInsights';
import { AppError } from '../middleware/auth.middleware';
import { FootprintInput } from '../types/footprint';

function requireUserId(req: Request): string {
  const userId = req.auth?.userId;
  if (!userId) throw new AppError('Not authenticated', 401);
  return userId;
}

export async function submitFootprint(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const input = req.body as FootprintInput;

  const breakdown = calculateFootprint(input);
  const entry = insertFootprintEntry(uuidv4(), userId, breakdown);
  const persona = detectPersona({
    transport: breakdown.transport,
    home: breakdown.home,
    diet: breakdown.diet,
    consumption: breakdown.consumption,
    waste: breakdown.waste
  });
  const percentile = computePercentile(breakdown.totalWeeklyKgCo2e);

  res.status(201).json({ entry, breakdown, persona, percentile });
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const entries = listFootprintEntriesForUser(userId);
  res.status(200).json({ entries });
}

export async function getLatestWithInsights(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const entries = listFootprintEntriesForUser(userId);

  if (entries.length === 0) {
    res.status(200).json({ entry: null, persona: null, percentile: null, trend: { available: false, reason: 'No tracked entries yet.' } });
    return;
  }

  const latest = entries[entries.length - 1];
  const persona = detectPersona({
    transport: latest.transport,
    home: latest.home,
    diet: latest.diet,
    consumption: latest.consumption,
    waste: latest.waste
  });
  const percentile = computePercentile(latest.total_weekly);

  const firstTimestamp = new Date(entries[0].created_at).getTime();
  const trendPoints: TrendPoint[] = entries.map((e) => ({
    daysSinceStart: Math.round((new Date(e.created_at).getTime() - firstTimestamp) / (1000 * 60 * 60 * 24)),
    totalKgCo2e: e.total_weekly
  }));
  const trend = computeTrend(trendPoints);

  res.status(200).json({ entry: latest, persona, percentile, trend });
}
