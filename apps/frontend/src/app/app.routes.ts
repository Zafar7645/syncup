import { Routes } from '@angular/router';
import { Dashboard } from '@/app/pages/dashboard/dashboard';
import { authGuard } from '@/app/auth/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
];
