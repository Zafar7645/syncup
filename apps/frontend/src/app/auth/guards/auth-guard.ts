/**
 * @file auth-guard.ts
 * @description Functional route guard (CanActivateFn) that protects routes requiring
 * authentication. Checks for a stored JWT token via AuthService. If absent, redirects
 * the user to /auth/login and blocks navigation to the requested route.
 */
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@/app/auth/services/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
