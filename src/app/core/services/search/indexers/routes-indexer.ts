import { Injectable } from '@angular/core';
import { routes } from '../../../../app.routes';
import type { IContentIndexer } from './content-indexer.interface';
import type { SearchableItem } from '../search.models';
import { extractKeywords, formatRouteName } from '../search.utils';

/**
 * Indexer for application routes
 */
@Injectable({ providedIn: 'root' })
export class RoutesIndexer implements IContentIndexer {
  index(): SearchableItem[] {
    const items: SearchableItem[] = [];

    routes.forEach((route) => {
      if (route.path && route.path !== '' && route.path !== '**') {
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

