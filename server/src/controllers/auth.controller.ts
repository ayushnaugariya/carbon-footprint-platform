import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createUser, findUserByEmail, findUserById, UserRecord } from '../models/userModel';
import { hashPassword, signToken, verifyPassword } from '../services/authService';
import { AppError } from '../middleware/auth.middleware';

/** Strips HTML tags from a string to prevent stored XSS via display names. */
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .refine((p) => /[A-Z]/.test(p), { message: 'Password must contain at least one uppercase letter' })
    .refine((p) => /\d/.test(p), { message: 'Password must contain at least one digit' }),
  displayName: z.string().trim().min(1).max(60).transform(stripHtml)
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(100)
});

export const guestSchema = z.object({
  displayName: z.string().trim().min(1).max(60).transform(stripHtml).optional()
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
  // req.body is already validated+parsed by the validateBody middleware.
  const { email, password, displayName } = req.body as z.output<typeof signupSchema>;

  if (findUserByEmail(email)) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({ id: uuidv4(), email, passwordHash, displayName, isGuest: false });
  const token = signToken({ userId: user.id, isGuest: false });

  res.status(201).json({ token, user: sanitizeUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as z.output<typeof loginSchema>;

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
  const { displayName } = req.body as z.output<typeof guestSchema>;
  const user = createUser({
    id: uuidv4(),
    email: null,
    passwordHash: null,
    displayName: displayName ?? 'Guest',
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

