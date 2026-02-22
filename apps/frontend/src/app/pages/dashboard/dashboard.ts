import { environment } from '@/environments/environment.development';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private httpClient = inject(HttpClient);
  profileData: any = null;

  ngOnInit() {
    this.httpClient.get(`${environment.apiUrl}/auth/profile`).subscribe({
      next: (data) => {
        console.log('Profile Data received:', data);
        this.profileData = data;
      },
      error: (err) => {
        console.error('Error fetching profile data:', err);
      },
    });
  }
}
