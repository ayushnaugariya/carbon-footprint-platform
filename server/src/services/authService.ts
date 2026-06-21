import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const SALT_ROUNDS = 10;

export interface JwtPayload {
  userId: string;
  isGuest: boolean;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = { 
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256'
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as JwtPayload;
}
