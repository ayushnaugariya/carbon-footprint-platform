import { Request, Response } from 'express';
import { getLatestFootprintEntry } from '../models/footprintModel';
import { listCompletedActionsForUser } from '../models/actionModel';
import { rankRecommendations } from '../services/rulesEngine';
import { detectPersona } from '../services/mlInsights';
import { AppError } from '../middleware/auth.middleware';

export async function getRecommendations(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.userId;
  if (!userId) throw new AppError('Not authenticated', 401);

  const latest = getLatestFootprintEntry(userId);
  if (!latest) {
    res.status(200).json({
      recommendations: [],
      message: 'Submit a footprint calculation first to get personalized recommendations.'
    });
    return;
  }

  const completed = listCompletedActionsForUser(userId);
  const excludeActionIds = completed.map((c) => c.action_id);

  const breakdown = {
    transport: latest.transport,
    home: latest.home,
    diet: latest.diet,
    consumption: latest.consumption,
    waste: latest.waste
  };

  const persona = detectPersona(breakdown);
  const recommendations = rankRecommendations(breakdown, { excludeActionIds });

  res.status(200).json({ persona, recommendations });
}
