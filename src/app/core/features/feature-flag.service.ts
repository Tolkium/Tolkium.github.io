import { Injectable, inject } from '@angular/core';
import { MenuSection } from '../../models/menu-section';
import {
  FEATURE_FLAGS,
  FeatureFlagsConfig,
  FeatureKey,
  FeatureVisibility,
} from './features';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly flags: FeatureFlagsConfig = inject(FEATURE_FLAGS);

  public getVisibility(key: FeatureKey): FeatureVisibility {
    return this.flags[key];
  }

  /** Whether the real feature component should match and load on its route. */
  public isRoutable(key: FeatureKey): boolean {
    const visibility = this.flags[key];
    return visibility === 'enabled' || visibility === 'unlisted';
  }

  /** Whether the feature should render the Access Restricted view instead of its real component. */
  public isLocked(key: FeatureKey): boolean {
    return this.flags[key] === 'locked';
  }

  /** Whether the feature is fully active (and its internal content should be indexed in search). */
  public isEnabled(key: FeatureKey): boolean {
    return this.flags[key] === 'enabled';
  }

  /** Whether the feature should appear in the side navigation menu. */
  public isListed(key: FeatureKey): boolean {
    const visibility = this.flags[key];
    return visibility === 'enabled' || visibility === 'locked';
  }

  public filterMenuSections(sections: readonly MenuSection[]): MenuSection[] {
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => this.isListed(item.feature)),
      }))
      .filter((section) => section.items.length > 0);
  }
}
