import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { authGuard } from '@/app/auth/guards/auth-guard';
import { Auth } from '@/app/auth/services/auth';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<Auth>;
  let routerSpy: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...args) =>
    TestBed.runInInjectionContext(() => authGuard(...args));

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<Auth>('Auth', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true when the user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const result = executeGuard({} as never, {} as never);
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should return false and redirect to /auth/login when the user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const result = executeGuard({} as never, {} as never);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
