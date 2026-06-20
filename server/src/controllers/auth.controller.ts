import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createUser, findUserByEmail, findUserById, UserRecord } from '../models/userModel';
import { hashPassword, signToken, verifyPassword } from '../services/authService';
import { AppError } from '../middleware/auth.middleware';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(60)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const guestSchema = z.object({
  displayName: z.string().min(1).max(60).optional()
});

function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    isGuest: Boolean(user.is_guest)
  };
}

export async function signup(req: Request, res: Response): Promise<void> {
  const { email, password, displayName } = req.body as z.infer<typeof signupSchema>;

  if (findUserByEmail(email)) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({ id: uuidv4(), email, passwordHash, displayName, isGuest: false });
  const token = signToken({ userId: user.id, isGuest: false });

  res.status(201).json({ token, user: sanitizeUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = findUserByEmail(email);
  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({ userId: user.id, isGuest: false });
  res.status(200).json({ token, user: sanitizeUser(user) });
}

export async function guestLogin(req: Request, res: Response): Promise<void> {
  const { displayName } = req.body as z.infer<typeof guestSchema>;
  const user = createUser({
    id: uuidv4(),
    email: null,
    passwordHash: null,
    displayName: displayName?.trim() || 'Guest',
    isGuest: true
  });

  const token = signToken({ userId: user.id, isGuest: true });
  res.status(201).json({ token, user: sanitizeUser(user) });
}

export function me(req: Request, res: Response): void {
  const userId = req.auth?.userId;
  if (!userId) throw new AppError('Not authenticated', 401);

  const user = findUserById(userId);
  if (!user) throw new AppError('User not found', 404);

  res.status(200).json({ user: sanitizeUser(user) });
}
