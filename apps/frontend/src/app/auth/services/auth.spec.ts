import { TestBed } from '@angular/core/testing';
import { Auth } from '@/app/auth/services/auth';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RegisterUserDto } from '@shared/dtos/auth/register-user.dto';
import { UserResponseDto } from '@shared/dtos/user/user-response.dto';
import { LoginUserDto } from '@shared/dtos/auth/login-user.dto';
import { AccessTokenDto } from '@shared/dtos/auth/access-token.dto';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:3000/auth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should POST to /register and return user data', () => {
      const mockRegisterData: RegisterUserDto = {
        name: 'Test',
        email: 'email@test.com',
        password: 'TestPassword@123',
      };

      const mockResponse: UserResponseDto = {
        id: 1,
        name: 'Test',
        email: 'email@test.com',
      };

      service.register(mockRegisterData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterData);

      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    it('should POST to /login and return acces token', () => {
      const mockLoginData: LoginUserDto = {
        email: 'email@test.com',
        password: 'TestPassword@123',
      };

      const mockResponse: AccessTokenDto = {
        access_token: 'access_token',
      };

      service.login(mockLoginData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginData);

      req.flush(mockResponse);
    });
  });
});
