import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { IContentIndexer } from './content-indexer.interface';
import type { SearchableItem } from '../search.models';
import { extractKeywords } from '../search.utils';

/**
 * Base class for localStorage-based indexers
 */
@Injectable({ providedIn: 'root' })
export abstract class LocalStorageIndexer implements IContentIndexer {
  protected readonly platformId = inject(PLATFORM_ID);

  abstract index(): SearchableItem[];
  abstract getStorageKey(): string;
  abstract getItemIdPrefix(): string;
  abstract getCategory(): string;
  abstract getRoute(): string;
  abstract getParent(): string;

  protected isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  protected parseStorage<T>(key: string): T[] | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T[]) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Indexer for todo items from localStorage
 */
@Injectable({ providedIn: 'root' })
export class TodosIndexer extends LocalStorageIndexer {
  getStorageKey(): string {
    return 'todos';
  }

  getItemIdPrefix(): string {
    return 'todo';
  }

  getCategory(): string {
    return 'Todo Items';
  }

  getRoute(): string {
    return '/todo';
  }

  getParent(): string {
    return 'Features';
  }

  index(): SearchableItem[] {
    const items: SearchableItem[] = [];
    const todos = this.parseStorage<{
      id: string;
      title: string;
      description?: string;
      priority: string;
    }>(this.getStorageKey());

    if (!todos) {
      return items;
    }

    todos.forEach((todo) => {
      const keywords = [
        todo.title.toLowerCase(),
        ...(todo.description ? [todo.description.toLowerCase()] : []),
        todo.priority.toLowerCase(),
        ...extractKeywords(todo.title)
      ];

      items.push({
        id: `${this.getItemIdPrefix()}-${todo.id}`,
        type: 'feature',
        title: todo.title,
        description: todo.description || `Todo item: ${todo.title}`,
        route: this.getRoute(),
        keywords,
        category: this.getCategory(),
        parent: this.getParent()
      });
    });

    return items;
  }
}

/**
 * Indexer for gallery items from localStorage
 */
@Injectable({ providedIn: 'root' })
export class GalleryIndexer extends LocalStorageIndexer {
  getStorageKey(): string {
    return 'gallery';
  }

  getItemIdPrefix(): string {
    return 'gallery';
  }

  getCategory(): string {
    return 'Gallery';
  }

  getRoute(): string {
    return '/gallery';
  }

  getParent(): string {
    return 'Features';
  }

  index(): SearchableItem[] {
    const items: SearchableItem[] = [];
    const images = this.parseStorage<{
      id: string;
      title: string;
      description?: string;
      category: string;
    }>(this.getStorageKey());

    if (!images) {
      return items;
    }

    images.forEach((image) => {
      const keywords = [
        image.title.toLowerCase(),
        ...(image.description ? [image.description.toLowerCase()] : []),
        image.category.toLowerCase(),
        ...extractKeywords(image.title)
      ];

      items.push({
        id: `${this.getItemIdPrefix()}-${image.id}`,
        type: 'feature',
        title: image.title,
        description: image.description || `Gallery image: ${image.title}`,
        route: this.getRoute(),
        keywords,
        category: this.getCategory(),
        parent: this.getParent()
      });
    });

    return items;
  }
}

/**
 * Indexer for calendar events from localStorage
 */
@Injectable({ providedIn: 'root' })
export class CalendarIndexer extends LocalStorageIndexer {
  getStorageKey(): string {
    return 'calendarEvents';
  }

  getItemIdPrefix(): string {
    return 'calendar';
  }

  getCategory(): string {
    return 'Calendar Events';
  }

  getRoute(): string {
    return '/calendar';
  }

  getParent(): string {
    return 'Features';
  }

  index(): SearchableItem[] {
    const items: SearchableItem[] = [];
    const events = this.parseStorage<{
      id: string;
      title: string;
      description?: string;
    }>(this.getStorageKey());

    if (!events) {
      return items;
    }

    events.forEach((event) => {
      const keywords = [
        event.title.toLowerCase(),
        ...(event.description ? [event.description.toLowerCase()] : []),
        ...extractKeywords(event.title)
      ];

      items.push({
        id: `${this.getItemIdPrefix()}-${event.id}`,
        type: 'feature',
        title: event.title,
        description: event.description || `Calendar event: ${event.title}`,
        route: this.getRoute(),
        keywords,
        category: this.getCategory(),
        parent: this.getParent()
      });
    });

    return items;
  }
}

