import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PASSWORD_REGEX_STRING,
  PASSWORD_VALIDATION_MESSAGE,
} from '@shared/validation/password.constants';
import { EMAIL_REGEX_STRING } from '@shared/validation/email.constants';
import { Auth } from '@/app/auth/services/auth';
import { RegisterUserDto } from '@shared/dtos/auth/register-user.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  registerForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(new RegExp(EMAIL_REGEX_STRING))]],
    password: ['', [Validators.required, Validators.pattern(new RegExp(PASSWORD_REGEX_STRING))]],
  });
  passwordValidationMessage = PASSWORD_VALIDATION_MESSAGE;

  errorMessage: string | null = null;

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const userData = this.registerForm.value as RegisterUserDto;
    this.authService.register(userData).subscribe({
      next: () => {
        this.errorMessage = null;
        this.registerForm.reset();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.errorMessage = Array.isArray(err.error.message)
            ? err.error.message[0]
            : err.error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
    });
  }
}
