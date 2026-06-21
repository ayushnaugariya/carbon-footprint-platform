import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getTotalSavingsForUser, insertCompletedAction, listCompletedActionsForUser } from '../models/actionModel';
import { RECOMMENDATIONS_CATALOG } from '../data/recommendationsCatalog';
import { AppError } from '../middleware/auth.middleware';

export const completeActionSchema = z.object({
  // Restrict to safe slug format: lowercase letters, digits, hyphens only.
  // This blocks path-traversal and injection-style strings entirely.
  actionId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Invalid action id format')
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
  const { actionId } = req.body as z.output<typeof completeActionSchema>;

  const action = RECOMMENDATIONS_CATALOG.find((a) => a.id === actionId);
  if (!action) {
    // Generic message — never echo the raw actionId back to avoid input reflection.
    throw new AppError('Action not found', 404);
  }

  const existingCompletions = listCompletedActionsForUser(userId);
  const isAlreadyCompleted = existingCompletions.some((c) => c.action_id === actionId);
  if (isAlreadyCompleted) {
    throw new AppError('Action already completed', 409);
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

