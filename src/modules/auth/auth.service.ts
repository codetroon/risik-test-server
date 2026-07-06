import argon2 from 'argon2';
import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../shared/errors/AppError.js';
import { signAccessToken } from '../../shared/lib/jwt.js';
import type { AuthUser, LoginInput } from './auth.schemas.js';

/** Shape returned to the client alongside the token. */
function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  role: AuthUser['role'];
  status: AuthUser['status'];
  image: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    image: user.image,
  };
}

export class AuthService {
  /** Verify credentials and issue a JWT access token. */
  async login({ email, password }: LoginInput): Promise<{ token: string; user: AuthUser }> {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    // Uniform error to avoid leaking which accounts exist.
    if (!user || !user.passwordHash) {
      throw new ApiError.Unauthorized('Invalid email or password');
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new ApiError.Unauthorized('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new ApiError.Forbidden('Your account is not active. Contact an administrator.');
    }

    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: toAuthUser(user) };
  }

  /** Load the current user by id (from a verified token). */
  async me(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) {
      throw new ApiError.Unauthorized('Account no longer exists');
    }
    return toAuthUser(user);
  }
}
