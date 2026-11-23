import { Route, Routes } from '@angular/router';
import { featureFlagGuard, featureLockedGuard } from './core/features/feature-flag.guard';
import { FeatureKey } from './core/features/features';

interface FeatureRoute extends Route {
  path: string;
  data: {
    feature: FeatureKey;
    featureName?: string;
    subtitle?: string;
    statusNote?: string;
  };
}

const FEATURE_ROUTES: FeatureRoute[] = [
  {
    path: 'about',
    data: { feature: 'about', featureName: 'Home' },
    loadComponent: () =>
      import('./features/about-me/about-me.component').then(m => m.AboutMeComponent)
  },
  {
    path: 'projects',
    data: { feature: 'projects', featureName: 'Projects' },
    loadComponent: () =>
      import('./features/projects/projects.component').then(m => m.ProjectsComponent)
  },
  {
    path: 'settings',
    data: { feature: 'settings', featureName: 'Settings' },
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'gallery',
    data: { feature: 'gallery', featureName: 'Gallery' },
    loadComponent: () =>
      import('./features/gallery/gallery.component').then(m => m.GalleryComponent)
  },
  {
    path: 'todo',
    data: { feature: 'todo', featureName: 'TODO List' },
    loadComponent: () =>
      import('./features/todo/todo.component').then(m => m.TodoComponent)
  },
  {
    path: 'calendar',
    data: { feature: 'calendar', featureName: 'Personal Calendar' },
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'christmas-gift',
    data: { feature: 'christmasGift', featureName: 'Christmas Gift' },
    loadComponent: () =>
      import('./features/christmas-gift/christmas-gift.component').then(m => m.ChristmasGiftComponent)
  },
  {
    path: 'norbert-gift',
    data: { feature: 'norbertGift', featureName: "Norbert's Wishlist" },
    loadComponent: () =>
      import('./features/norbert-gift/norbert-gift.component').then(m => m.NorbertGiftComponent)
  },
  {
    path: 'snippet-vault',
    data: { feature: 'snippetVault', featureName: 'Snippet Vault' },
    loadComponent: () =>
      import('./features/snippet-vault/snippet-vault.component').then(m => m.SnippetVaultComponent)
  },
  {
    path: 'design-viewer',
    data: { feature: 'designViewer', featureName: 'Design Viewer' },
    loadComponent: () =>
      import('./features/design-viewer/design-viewer.component').then(m => m.DesignViewerComponent)
  },
  {
    path: 'DockerDashboard',
    data: {
      feature: 'dockerDashboard',
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
      feature: 'regex',
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
      feature: 'colorPalette',
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
      feature: 'githubExplorer',
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
      feature: 'packageChecker',
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
      feature: 'skillMatrix',
      featureName: 'Skill Matrix',
      subtitle: 'A simple view of strengths, growth areas, and priorities.',
      statusNote: 'Planned. Spreadsheet says easy, reality says ha.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'LocalStorageViewer',
    data: {
      feature: 'localStorageViewer',
      featureName: 'Local Storage Viewer',
      subtitle: 'Inspect, edit, and clear browser storage entries in one place.',
      statusNote: 'Planned. DevTools Application tab is safe for now.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'ServerAnalytics',
    data: {
      feature: 'serverAnalytics',
      featureName: 'Server Analytics',
      subtitle: 'Server health, traffic metrics, and uptime telemetry.',
      statusNote: 'Planned. Metrics pipeline not hooked up yet.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'roles',
    data: {
      feature: 'cvDownload',
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
      feature: 'userManagement',
      featureName: 'User Management',
      subtitle: 'Role and permission tools, built with clarity first.',
      statusNote: 'Planned. Permissions are simple until humans arrive.'
    },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
];

export const routes: Routes = [
  { path: '', redirectTo: 'about', pathMatch: 'full' },
  ...FEATURE_ROUTES.flatMap((route): Routes => [
    {
      ...route,
      canMatch: [featureFlagGuard],
    },
    {
      path: route.path,
      data: {
        feature: route.data.feature,
        featureName: route.data.featureName,
        isLockedFallback: true,
      },
      canMatch: [featureLockedGuard],
      loadComponent: () =>
        import('./features/access-restricted/access-restricted.component').then(
          m => m.AccessRestrictedComponent
        ),
    },
  ]),
  { path: '**', redirectTo: 'about' },
];
