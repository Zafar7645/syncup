import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '@/app/auth/services/auth';
import {
  PASSWORD_REGEX_STRING,
  PASSWORD_VALIDATION_MESSAGE,
} from '@shared/validation/password.constants';
import { EMAIL_REGEX_STRING } from '@shared/validation/email.constants';
import { LoginUserDto } from '@shared/dtos/auth/login-user.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(new RegExp(EMAIL_REGEX_STRING))]],
    password: ['', [Validators.required, Validators.pattern(new RegExp(PASSWORD_REGEX_STRING))]],
  });
  passwordValidationMessage = PASSWORD_VALIDATION_MESSAGE;

  errorMessage: string | null = null;

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const userData = this.loginForm.value as LoginUserDto;
    this.authService.login(userData).subscribe({
      next: (response) => {
        this.errorMessage = null;
        localStorage.setItem('access_token', response.access_token);
        console.log('Login successful!', response);
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.errorMessage = Array.isArray(err.error.message)
            ? err.error.message[0]
            : err.error.message;
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
    });
  }
}
