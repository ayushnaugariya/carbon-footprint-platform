import { getStore } from '../config/db';

export interface UserRecord {
  id: string;
  email: string | null;
  password_hash: string | null;
  display_name: string;
  is_guest: number;
  created_at: string;
}

export function createUser(params: {
  id: string;
  email: string | null;
  passwordHash: string | null;
  displayName: string;
  isGuest: boolean;
}): UserRecord {
  const record: UserRecord = {
    id: params.id,
    email: params.email,
    password_hash: params.passwordHash,
    display_name: params.displayName,
    is_guest: params.isGuest ? 1 : 0,
    created_at: new Date().toISOString()
  };

  getStore().insertUser(record);
  return record;
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return getStore().getUserByEmail(email);
}

export function findUserById(id: string): UserRecord | undefined {
  return getStore().getUserById(id);
}
