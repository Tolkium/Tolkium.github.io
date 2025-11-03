import { Injectable } from '@angular/core';
import { MENU_SECTIONS } from '../../../../models/menu-data';
import type { MenuSection, MenuItem } from '../../../../models/menu-section';
import type { IContentIndexer } from './content-indexer.interface';
import type { SearchableItem } from '../search.models';
import { extractKeywords } from '../search.utils';

/**
 * Indexer for menu navigation items
 */
@Injectable({ providedIn: 'root' })
export class MenuIndexer implements IContentIndexer {
  index(): SearchableItem[] {
    const items: SearchableItem[] = [];

    MENU_SECTIONS.forEach((section: MenuSection) => {
      section.items.forEach((item: MenuItem) => {
        const keywords = [
          item.label.toLowerCase(),
          ...extractKeywords(item.label)
        ];

        items.push({
          id: `menu-${section.title}-${item.label}`,
          type: 'menu-item',
          title: item.label,
          description: `${section.title} - ${item.label}`,
          route: item.route,
          keywords,
          category: section.title,
          iconName: item.iconName
        });
      });
    });

    return items;
  }
}

