import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { Role } from '../../generated/prisma/enums.js';

/** Claims carried in the signed access token. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

/** Sign a short-lived access token for an authenticated user. */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/** Verify and decode an access token, throwing if invalid/expired. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string') {
    throw new Error('Malformed token payload');
  }
  return decoded as AccessTokenPayload;
}
