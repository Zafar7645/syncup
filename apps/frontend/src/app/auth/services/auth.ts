import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterUserDto } from '@shared/dtos/auth/register-user.dto';
import { UserResponseDto } from '@shared/dtos/user/user-response.dto';
import { LoginUserDto } from '@shared/dtos/auth/login-user.dto';
import { AccessTokenDto } from '@shared/dtos/auth/access-token.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private httpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/auth';

  register(userData: RegisterUserDto): Observable<UserResponseDto> {
    return this.httpClient.post<UserResponseDto>(`${this.apiUrl}/register`, userData);
  }

  login(userData: LoginUserDto): Observable<AccessTokenDto> {
    return this.httpClient.post<AccessTokenDto>(`${this.apiUrl}/login`, userData);
  }
}
