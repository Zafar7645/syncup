/**
 * @file app.routes.ts
 * @description Top-level route definitions for the SyncUp SPA.
 * - /auth (lazy): Login and register pages loaded on demand.
 * - /dashboard (guarded): Project list for the authenticated user.
 * - /projects/:id (guarded): Kanban board for a specific project.
 * - / redirects to /dashboard.
 */
import { Routes } from '@angular/router';
import { Dashboard } from '@/app/pages/dashboard/dashboard';
import { Kanban } from '@/app/pages/kanban/kanban';
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
  {
    path: 'projects/:id',
    component: Kanban,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
