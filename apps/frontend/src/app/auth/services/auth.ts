import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment.development';
import { RegisterUserDto } from '@shared/dtos/auth/register-user.dto';
import { UserResponseDto } from '@shared/dtos/user/user-response.dto';
import { LoginUserDto } from '@shared/dtos/auth/login-user.dto';
import { AccessTokenDto } from '@shared/dtos/auth/access-token.dto';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'access_token';

  register(userData: RegisterUserDto): Observable<UserResponseDto> {
    return this.httpClient
      .post<UserResponseDto>(`${this.apiUrl}/register`, userData)
      .pipe(tap((response: UserResponseDto) => this.setSession(response)));
  }

  login(userData: LoginUserDto): Observable<AccessTokenDto> {
    return this.httpClient
      .post<AccessTokenDto>(`${this.apiUrl}/login`, userData)
      .pipe(tap((response: AccessTokenDto) => this.setSession(response)));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(authResult: UserResponseDto | AccessTokenDto) {
    if (authResult.access_token) {
      localStorage.setItem(this.TOKEN_KEY, authResult.access_token);
    }
  }
}
