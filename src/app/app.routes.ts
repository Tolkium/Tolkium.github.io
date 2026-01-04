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
  {
    path: 'gallery',
    loadComponent: () =>
      import('./features/gallery/gallery.component').then(m => m.GalleryComponent)
  },
  {
    path: 'todo',
    loadComponent: () =>
      import('./features/todo/todo.component').then(m => m.TodoComponent)
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'christmas-gift',
    loadComponent: () =>
      import('./features/christmas-gift/christmas-gift.component').then(m => m.ChristmasGiftComponent)
  },
  // Add other routes as needed
  { path: '**', redirectTo: 'about' }
];
