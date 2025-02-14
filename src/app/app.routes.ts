import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'about', pathMatch: 'full' },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about-me/about-me.component').then(m => m.AboutMeComponent)
  },
  // Add other routes as needed
  { path: '**', redirectTo: 'about' }
];
