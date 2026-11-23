import { FeatureFlagsConfig } from '../app/core/features/features';

export interface AppEnvironment {
  production: boolean;
  /**
   * Override specific feature flags for an environment.
   * Leave empty to use DEFAULT_FEATURE_FLAGS.
   */
  featureFlags: Partial<FeatureFlagsConfig>;
}
