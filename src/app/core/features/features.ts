import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

export type FeatureVisibility = 'enabled' | 'locked' | 'unlisted' | 'disabled';

/**
 * Default visibility registry for all site features.
 *
 * - 'enabled':  Visible in navigation, indexed in search, and loads the real feature.
 * - 'locked':   Visible in navigation with original icon/label; navigating loads the
 *               Access Restricted view instead of the underlying feature.
 * - 'unlisted': Hidden from navigation and search, but reachable via direct URL.
 * - 'disabled': Hidden from navigation and search; route does not match and redirects to /about.
 */
export const DEFAULT_FEATURE_FLAGS = {
  about: 'enabled',
  settings: 'enabled',

  // Working tools
  designViewer: 'unlisted',
  snippetVault: 'locked',
  todo: 'locked',

  // Pages with example/mock data
  projects: 'locked',
  gallery: 'locked',
  calendar: 'locked',

  // Personal gift pages (completely hidden from public portfolio)
  christmasGift: 'disabled',
  norbertGift: 'disabled',

  // Planned / Coming Soon modules
  dockerDashboard: 'locked',
  regex: 'locked',
  colorPalette: 'locked',
  githubExplorer: 'locked',
  packageChecker: 'locked',
  skillMatrix: 'locked',
  localStorageViewer: 'locked',
  serverAnalytics: 'locked',
  cvDownload: 'locked',
  userManagement: 'locked',
} as const satisfies Record<string, FeatureVisibility>;

export type FeatureKey = keyof typeof DEFAULT_FEATURE_FLAGS;

export type FeatureFlagsConfig = Record<FeatureKey, FeatureVisibility>;

export const FEATURE_FLAGS = new InjectionToken<FeatureFlagsConfig>('FEATURE_FLAGS', {
  providedIn: 'root',
  factory: () => DEFAULT_FEATURE_FLAGS,
});

export function provideFeatureFlags(
  overrides: Partial<FeatureFlagsConfig> = {}
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FEATURE_FLAGS,
      useValue: { ...DEFAULT_FEATURE_FLAGS, ...overrides },
    },
  ]);
}

export function isFeatureKey(value: unknown): value is FeatureKey {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(DEFAULT_FEATURE_FLAGS, value)
  );
}
