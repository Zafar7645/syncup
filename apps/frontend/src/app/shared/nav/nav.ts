import { Component, ElementRef, HostListener, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@/app/auth/services/auth';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  @Input() title?: string;

  private authService = inject(Auth);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  menuOpen = false;
  readonly userInitial: string;

  constructor() {
    const email = this.authService.getUserEmail();
    this.userInitial = email ? email[0].toUpperCase() : '?';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
