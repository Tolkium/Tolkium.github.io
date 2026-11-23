import { inject } from '@angular/core';
import { CanMatchFn, Route } from '@angular/router';
import { FeatureFlagService } from './feature-flag.service';
import { isFeatureKey } from './features';

/**
 * Matches a feature's real route only when the feature is routable ('enabled' | 'unlisted').
 * Returning `false` skips loading the real lazy chunk so a locked fallback or wildcard can match.
 */
export const featureFlagGuard: CanMatchFn = (route: Route): boolean => {
  const feature = route.data?.['feature'];
  if (!isFeatureKey(feature)) {
    return false;
  }

  return inject(FeatureFlagService).isRoutable(feature);
};

/**
 * Matches the Access Restricted fallback route only when the feature is set to 'locked'.
 */
export const featureLockedGuard: CanMatchFn = (route: Route): boolean => {
  const feature = route.data?.['feature'];
  if (!isFeatureKey(feature)) {
    return false;
  }

  return inject(FeatureFlagService).isLocked(feature);
};
