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
  {
    path: 'norbert-gift',
    loadComponent: () =>
      import('./features/norbert-gift/norbert-gift.component').then(m => m.NorbertGiftComponent)
  },
  {
    path: 'snippet-vault',
    loadComponent: () =>
      import('./features/snippet-vault/snippet-vault.component').then(m => m.SnippetVaultComponent)
  },
  {
    path: 'design-viewer',
    loadComponent: () =>
      import('./features/design-viewer/design-viewer.component').then(m => m.DesignViewerComponent)
  },
  {
    path: 'DockerDashboard',
    data: {
      featureName: 'Docker Dashboard',
      subtitle: 'Live container stats, logs, and health checks in one place.',
      statusNote: 'Planned. My containers are ready, my time is not.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'Regex',
    data: {
      featureName: 'Regex Tester',
      subtitle: 'Quick pattern testing without opening five browser tabs.',
      statusNote: 'Planned. Regex is waiting politely while I pretend I understand lookbehinds.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'ColorPaletteGenerator',
    data: {
      featureName: 'Color Palette Generator',
      subtitle: 'Generate practical color sets that actually work in UI.',
      statusNote: 'Planned. Current palette is fifty shades of TODO.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'GitHubRepoExplorer',
    data: {
      featureName: 'GitHub Repo Explorer',
      subtitle: 'Browse repos faster and get the useful bits first.',
      statusNote: 'Planned. GitHub API and I are currently in a long-distance relationship.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'PackageVersionChecker',
    data: {
      featureName: 'Package Version Checker',
      subtitle: 'Check dependency versions before they surprise you in prod.',
      statusNote: 'Planned. NPM still sends me emotional damage weekly.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'SkillMatrix',
    data: {
      featureName: 'Skill Matrix',
      subtitle: 'A simple view of strengths, growth areas, and priorities.',
      statusNote: 'Planned. Spreadsheet says easy, reality says ha.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'roles',
    data: {
      featureName: 'Download CV as PDF',
      subtitle: 'Clean export for sharing without layout surprises.',
      statusNote: 'Planned. PDF formatting and I are in couples therapy.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'User',
    data: {
      featureName: 'User Management',
      subtitle: 'Role and permission tools, built with clarity first.',
      statusNote: 'Planned. Permissions are simple until humans arrive.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  { path: '**', redirectTo: 'about' }
];
