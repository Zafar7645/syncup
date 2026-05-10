/**
 * @file token-interceptor.ts
 * @description Functional HTTP interceptor that automatically attaches the JWT access
 * token to every outgoing request as an Authorization: Bearer header. If no token is
 * present (unauthenticated state), the request is forwarded unchanged.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { Auth } from '@/app/auth/services/auth';
import { inject } from '@angular/core';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }
  return next(req);
};
