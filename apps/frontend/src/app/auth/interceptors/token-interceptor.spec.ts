import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { tokenInterceptor } from '@/app/auth/interceptors/token-interceptor';
import { Auth } from '@/app/auth/services/auth';

describe('tokenInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authServiceSpy: jasmine.SpyObj<Auth>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<Auth>('Auth', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: authServiceSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(tokenInterceptor).toBeTruthy();
  });

  it('should attach Authorization: Bearer header when a token is present', () => {
    authServiceSpy.getToken.and.returnValue('my_jwt_token');

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my_jwt_token');
    req.flush({});
  });

  it('should forward the request unchanged when no token is present', () => {
    authServiceSpy.getToken.and.returnValue(null);

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
