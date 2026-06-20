import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getTotalSavingsForUser, insertCompletedAction, listCompletedActionsForUser } from '../models/actionModel';
import { RECOMMENDATIONS_CATALOG } from '../data/recommendationsCatalog';
import { AppError } from '../middleware/auth.middleware';

export const completeActionSchema = z.object({
  actionId: z.string().min(1)
});

function requireUserId(req: Request): string {
  const userId = req.auth?.userId;
  if (!userId) throw new AppError('Not authenticated', 401);
  return userId;
}

export function getCatalog(_req: Request, res: Response): void {
  res.status(200).json({ catalog: RECOMMENDATIONS_CATALOG });
}

export function completeAction(req: Request, res: Response): void {
  const userId = requireUserId(req);
  const { actionId } = req.body as z.infer<typeof completeActionSchema>;

  const action = RECOMMENDATIONS_CATALOG.find((a) => a.id === actionId);
  if (!action) {
    throw new AppError(`Unknown action id: ${actionId}`, 404);
  }

  const record = insertCompletedAction(uuidv4(), userId, action.id, action.estimatedWeeklySavingsKg);
  const totalSavingsKg = getTotalSavingsForUser(userId);

  res.status(201).json({ record, totalSavingsKg });
}

export function listCompleted(req: Request, res: Response): void {
  const userId = requireUserId(req);
  const completed = listCompletedActionsForUser(userId);
  const totalSavingsKg = getTotalSavingsForUser(userId);

  res.status(200).json({ completed, totalSavingsKg });
}
