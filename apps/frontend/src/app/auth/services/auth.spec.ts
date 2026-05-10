import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Auth } from '@/app/auth/services/auth';
import { RegisterUserDto } from '@shared/dtos/auth/register-user.dto';
import { UserResponseDto } from '@shared/dtos/user/user-response.dto';
import { LoginUserDto } from '@shared/dtos/auth/login-user.dto';
import { AccessTokenDto } from '@shared/dtos/auth/access-token.dto';
import { environment } from '@/environments/environment';

const API_URL = `${environment.apiUrl}/auth`;
const TOKEN_KEY = 'access_token';

// Build a minimal valid JWT with the given payload (not cryptographically signed).
// btoa is available globally in Node.js 18+ and all browsers; requires Node 18+ in Jest.
function makeJwt(payload: object): string {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
}

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── register ─────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should POST to /register and return user data', () => {
      const dto: RegisterUserDto = { name: 'Test', email: 'email@test.com', password: 'TestPassword@123' };
      const response: UserResponseDto = { id: 1, name: 'Test', email: 'email@test.com', access_token: 'tok' };

      service.register(dto).subscribe(res => expect(res).toEqual(response));

      const req = httpMock.expectOne(`${API_URL}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(response);
    });

    it('should store the access token in localStorage after registration', () => {
      const dto: RegisterUserDto = { name: 'Test', email: 'email@test.com', password: 'TestPassword@123' };
      const response: UserResponseDto = { id: 1, name: 'Test', email: 'email@test.com', access_token: 'stored_token' };

      service.register(dto).subscribe();
      httpMock.expectOne(`${API_URL}/register`).flush(response);

      expect(localStorage.getItem(TOKEN_KEY)).toBe('stored_token');
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should POST to /login and return the access token', () => {
      const dto: LoginUserDto = { email: 'email@test.com', password: 'TestPassword@123' };
      const response: AccessTokenDto = { access_token: 'tok' };

      service.login(dto).subscribe(res => expect(res).toEqual(response));

      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(response);
    });

    it('should store the access token in localStorage after login', () => {
      const dto: LoginUserDto = { email: 'email@test.com', password: 'TestPassword@123' };
      const response: AccessTokenDto = { access_token: 'login_token' };

      service.login(dto).subscribe();
      httpMock.expectOne(`${API_URL}/login`).flush(response);

      expect(localStorage.getItem(TOKEN_KEY)).toBe('login_token');
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should remove the access token from localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'some_token');
      service.logout();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  // ── isAuthenticated ───────────────────────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('should return true when a token exists in localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'some_token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when no token exists in localStorage', () => {
      localStorage.removeItem(TOKEN_KEY);
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  // ── getToken ──────────────────────────────────────────────────────────────────

  describe('getToken', () => {
    it('should return the stored token', () => {
      localStorage.setItem(TOKEN_KEY, 'my_token');
      expect(service.getToken()).toBe('my_token');
    });

    it('should return null when no token is stored', () => {
      localStorage.removeItem(TOKEN_KEY);
      expect(service.getToken()).toBeNull();
    });
  });

  // ── getUserEmail ──────────────────────────────────────────────────────────────

  describe('getUserEmail', () => {
    it('should decode and return the email from a valid JWT payload', () => {
      const token = makeJwt({ sub: 1, email: 'user@test.com' });
      localStorage.setItem(TOKEN_KEY, token);
      expect(service.getUserEmail()).toBe('user@test.com');
    });

    it('should return null when no token is stored', () => {
      localStorage.removeItem(TOKEN_KEY);
      expect(service.getUserEmail()).toBeNull();
    });

    it('should return null when the token payload is malformed', () => {
      localStorage.setItem(TOKEN_KEY, 'bad.token.here');
      expect(service.getUserEmail()).toBeNull();
    });

    it('should return null when the payload has no email field', () => {
      const token = makeJwt({ sub: 1 });
      localStorage.setItem(TOKEN_KEY, token);
      expect(service.getUserEmail()).toBeNull();
    });
  });
});
