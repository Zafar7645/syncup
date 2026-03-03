import { environment } from '@/environments/environment.development';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface UserProfile {
  userId: number;
  email: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  profileData: UserProfile | null = null;

  ngOnInit() {
    this.httpClient.get<UserProfile>(`${environment.apiUrl}/auth/profile`).subscribe({
      next: (data) => {
        console.log('Profile Data received:', data);
        this.profileData = data;
      },
      error: (err) => {
        console.error('Error fetching profile data:', err);
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
