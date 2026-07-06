import { z } from 'zod';

// ── Request ────────────────────────────────────────────────────

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: 'A valid email is required' }))
      .meta({ example: 'super@risik.gov' }),
    password: z.string().min(1, 'Password is required').meta({ example: 'Password123!' }),
  })
  .meta({ id: 'LoginRequest' });

export type LoginInput = z.infer<typeof loginSchema>;

// ── Response ───────────────────────────────────────────────────

export const authUserSchema = z
  .object({
    id: z.string().meta({ example: 'a1b2c3d4' }),
    name: z.string().meta({ example: 'Super Admin' }),
    email: z.string().meta({ example: 'super@risik.gov' }),
    role: z.enum(['super_admin', 'admin', 'researcher', 'officer']).meta({ example: 'super_admin' }),
    status: z.enum(['pending_approval', 'active', 'deactivated', 'banned']).meta({ example: 'active' }),
    image: z.string().nullable().meta({ example: null }),
  })
  .meta({ id: 'AuthUser' });

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z
  .object({
    token: z.string().meta({ description: 'JWT access token', example: 'eyJhbGciOi...' }),
    user: authUserSchema,
  })
  .meta({ id: 'LoginResponse' });
