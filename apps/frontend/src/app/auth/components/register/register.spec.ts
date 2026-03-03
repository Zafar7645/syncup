import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from '@/app/auth/components/register/register';
import { Auth } from '@/app/auth/services/auth';
import { of, throwError } from 'rxjs';
import { UserResponseDto } from '@shared/dtos/user/user-response.dto';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authService: jasmine.SpyObj<Auth>;

  const authServiceSpyObj = jasmine.createSpyObj<Auth>('Auth', ['register']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        {
          provide: Auth,
          useValue: authServiceSpyObj,
        },
      ],
    }).compileComponents();

    authService = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required form controls', () => {
    expect(component.registerForm.valid).toBeFalse();
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
    it('should call markAllAsTouched on registerForm and return when form is invalid', () => {
      // Arrange
      component.registerForm.setValue({
        name: '',
        email: '',
        password: '',
      });
      spyOn(component.registerForm, 'markAllAsTouched');

      // Act
      component.onSubmit();

      // Assert
      expect(component.registerForm.invalid).toBeTrue();
      expect(component.registerForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should call register method of Auth service when form is valid', () => {
      // Arrange
      const mockUserData = {
        name: 'Test',
        email: 'email@test.com',
        password: 'TestPassword@123',
      };
      component.registerForm.setValue(mockUserData);
      const mockResponse: UserResponseDto = {
        id: 1,
        name: 'Test',
        email: 'email@test.com',
        access_token: 'access_token',
      };
      authService.register.and.returnValue(of(mockResponse));

      // Act
      component.onSubmit();

      // Assert
      expect(authService.register).toHaveBeenCalledWith(mockUserData);
      expect(component.errorMessage).toBe(null);
    });

    it('should set the error message received from server on failure', () => {
      // Arrange
      const mockUserData = {
        name: 'Test',
        email: 'email@test.com',
        password: 'TestPassword@123',
      };
      component.registerForm.setValue(mockUserData);
      const errorResponse = {
        error: {
          message: 'Unable to complete registration.',
        },
      };
      authService.register.and.returnValue(throwError(() => errorResponse));

      // Act
      component.onSubmit();

      // Assert
      expect(authService.register).toHaveBeenCalledWith(mockUserData);
      expect(component.errorMessage).toBe('Unable to complete registration.');
    });

    it('should set the default error message on empty response from server', () => {
      // Arrange
      const mockUserData = {
        name: 'Test',
        email: 'email@test.com',
        password: 'TestPassword@123',
      };
      component.registerForm.setValue(mockUserData);
      const emptyResponse = {};
      authService.register.and.returnValue(throwError(() => emptyResponse));

      // Act
      component.onSubmit();

      // Assert
      expect(authService.register).toHaveBeenCalledWith(mockUserData);
      expect(component.errorMessage).toBe('Registration failed. Please try again.');
    });
  });
});
