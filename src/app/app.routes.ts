import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'about', pathMatch: 'full' },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about-me/about-me.component').then(m => m.AboutMeComponent)
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects.component').then(m => m.ProjectsComponent)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  // Add other routes as needed
  { path: '**', redirectTo: 'about' }
];
