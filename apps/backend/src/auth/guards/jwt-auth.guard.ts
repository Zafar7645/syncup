/**
 * @file jwt-auth.guard.ts
 * @description Route guard that enforces JWT authentication via Passport's 'jwt' strategy.
 * Apply with @UseGuards(JwtAuthGuard) on any controller or route that requires a
 * valid, unexpired access token. On success, populates req.user with { userId, email }.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
