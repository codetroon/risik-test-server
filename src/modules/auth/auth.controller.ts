import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { responseHandler } from '../../shared/lib/responseHandler.js';
import type { LoginInput } from './auth.schemas.js';

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body as LoginInput);
    responseHandler.ok(res, result);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.me(req.auth!.id);
    responseHandler.ok(res, user);
  };

  // Stateless JWT: the client discards the token. Endpoint kept for symmetry.
  logout = (_req: Request, res: Response): void => {
    responseHandler.ok(res, { success: true });
  };
}
