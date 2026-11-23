import { Injectable, inject } from '@angular/core';
import { routes } from '../../../../app.routes';
import { FeatureFlagService } from '../../../features/feature-flag.service';
import { isFeatureKey } from '../../../features/features';
import type { IContentIndexer } from './content-indexer.interface';
import type { SearchableItem } from '../search.models';
import { extractKeywords, formatRouteName } from '../search.utils';

/**
 * Indexer for application routes
 */
@Injectable({ providedIn: 'root' })
export class RoutesIndexer implements IContentIndexer {
  private readonly featureFlags = inject(FeatureFlagService);

  public index(): SearchableItem[] {
    const items: SearchableItem[] = [];

    routes.forEach((route) => {
      if (route.path && route.path !== '' && route.path !== '**') {
        if (route.data?.['isLockedFallback']) {
          return;
        }
        const feature = route.data?.['feature'];
        if (isFeatureKey(feature) && !this.featureFlags.isEnabled(feature)) {
          return;
        }

        const routeName = formatRouteName(route.path);
        const keywords = [
          routeName.toLowerCase(),
          route.path.toLowerCase(),
          ...extractKeywords(routeName)
        ];

        items.push({
          id: `route-${route.path}`,
          type: 'route',
          title: routeName,
          description: `Navigate to ${routeName}`,
          route: `/${route.path}`,
          keywords,
          category: 'Routes',
          parent: 'Navigation'
        });
      }
    });

    return items;
  }
}

