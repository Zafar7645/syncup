import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from '@/app/auth/components/login/login';
import { Auth } from '@/app/auth/services/auth';
import { of, throwError } from 'rxjs';
import { AccessTokenDto } from '@shared/dtos/auth/access-token.dto';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<Auth>;

  const authServiceSpyObj = jasmine.createSpyObj<Auth>('Auth', ['login']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        {
          provide: Auth,
          useValue: authServiceSpyObj,
        },
      ],
    }).compileComponents();

    authService = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required form controls', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email pattern', () => {
    // Invalid
    component.email?.setValue('invalid-email');
    expect(component.email?.valid).toBeFalse();
    expect(component.email?.errors?.['pattern']).toBeTruthy();

    // Valid
    component.email?.setValue('valid-email@test.com');
    expect(component.email?.valid).toBeTrue();
  });

  it('should validate password pattern', () => {
    // Invalid
    component.password?.setValue('invalid-password');
    expect(component.password?.valid).toBeFalse();
    expect(component.password?.errors?.['pattern']).toBeTruthy();

    // Valid
    component.password?.setValue('ValidPassword@123');
    expect(component.password?.valid).toBeTrue();
  });

  describe('onSubmit', () => {
    it('should call markAllAsTouched on loginForm and return when form is invalid', () => {
      // Arrange
      component.loginForm.setValue({
        email: '',
        password: '',
      });
      spyOn(component.loginForm, 'markAllAsTouched');

      // Act
      component.onSubmit();

      // Assert
      expect(component.loginForm.invalid).toBeTrue();
      expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should call login method of Auth service when form is valid', () => {
      // Arrange
      const mockUserData = {
        email: 'email@test.com',
        password: 'TestPassword@123',
      };
      component.loginForm.setValue(mockUserData);
      const mockResponse: AccessTokenDto = {
        access_token: 'access_token',
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act
      component.onSubmit();

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockUserData);
      expect(component.errorMessage).toBe(null);
    });

    it('should set the error message received from server on failure', () => {
      // Arrange
      const mockUserData = {
        email: 'email@test.com',
        password: 'TestPassword#123',
      };
      component.loginForm.setValue(mockUserData);
      const errorResponse = {
        error: {
          message: 'Invalid credentials.',
        },
      };
      authService.login.and.returnValue(throwError(() => errorResponse));

      // Act
      component.onSubmit();

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockUserData);
      expect(component.errorMessage).toBe('Invalid credentials.');
    });

    it('should set the default error message on empty response from server', () => {
      // Arrange
      const mockUserData = {
        email: 'email@test.com',
        password: 'TestPassword@123',
      };
      component.loginForm.setValue(mockUserData);
      const emptyResponse = {};
      authService.login.and.returnValue(throwError(() => emptyResponse));

      // Act
      component.onSubmit();

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockUserData);
      expect(component.errorMessage).toBe('Login failed. Please try again.');
    });
  });
});
