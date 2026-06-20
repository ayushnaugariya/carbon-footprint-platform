import { getStore } from '../config/db';

export interface CompletedActionRecord {
  id: string;
  user_id: string;
  action_id: string;
  estimated_savings_kg: number;
  completed_at: string;
}

export function insertCompletedAction(id: string, userId: string, actionId: string, estimatedSavingsKg: number): CompletedActionRecord {
  const record: CompletedActionRecord = {
    id,
    user_id: userId,
    action_id: actionId,
    estimated_savings_kg: estimatedSavingsKg,
    completed_at: new Date().toISOString()
  };

  getStore().insertCompletedAction(record);
  return record;
}

export function listCompletedActionsForUser(userId: string): CompletedActionRecord[] {
  return getStore().getCompletedActionsForUser(userId);
}

export function getTotalSavingsForUser(userId: string): number {
  return getStore().getTotalSavingsForUser(userId);
}
