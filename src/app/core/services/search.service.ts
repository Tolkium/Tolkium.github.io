import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type {
  SearchableItem,
  SearchResultTree,
  SearchIndex,
  SearchResult
} from './search/search.models';
import { SearchEngine } from './search/search-engine';
import { SearchResultProcessor } from './search/search-result-processor';
import { MenuIndexer } from './search/indexers/menu-indexer';
import { RoutesIndexer } from './search/indexers/routes-indexer';
import { ProjectsIndexer } from './search/indexers/projects-indexer';
import { SkillsIndexer } from './search/indexers/skills-indexer';
import {
  TodosIndexer,
  GalleryIndexer,
  CalendarIndexer
} from './search/indexers/local-storage-indexer';

/**
 * Main search service that orchestrates indexing and searching
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly searchEngine = new SearchEngine();
  private readonly resultProcessor = new SearchResultProcessor();
  
  // Indexers
  private readonly menuIndexer = inject(MenuIndexer);
  private readonly routesIndexer = inject(RoutesIndexer);
  private readonly projectsIndexer = inject(ProjectsIndexer);
  private readonly skillsIndexer = inject(SkillsIndexer);
  private readonly todosIndexer = inject(TodosIndexer);
  private readonly galleryIndexer = inject(GalleryIndexer);
  private readonly calendarIndexer = inject(CalendarIndexer);

  private readonly index = signal<SearchIndex | null>(null);
  private readonly searchQuery = signal<string>('');

  /**
   * Computed signal that returns search results
   */
  public readonly searchResults = computed(() => {
    const query = this.searchQuery();
    const idx = this.index();

    if (!query || query.trim().length === 0 || !idx) {
      return [];
    }

    return this.performSearch(query.trim().toLowerCase(), idx);
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeIndex();
      this.setupStorageListeners();
    }
  }

  /**
   * Sets the search query
   */
  public setQuery(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Clears the search query
   */
  public clearQuery(): void {
    this.searchQuery.set('');
  }

  /**
   * Rebuilds the entire index from scratch
   */
  public rebuildIndex(): void {
    this.initializeIndex();
  }

  /**
   * Updates todos in the index incrementally
   */
  public updateTodos(): void {
    this.updateIndexSection('todo-', () => this.todosIndexer.index());
  }

  /**
   * Updates gallery items in the index incrementally
   */
  public updateGallery(): void {
    this.updateIndexSection('gallery-', () => this.galleryIndexer.index());
  }

  /**
   * Updates calendar events in the index incrementally
   */
  public updateCalendar(): void {
    this.updateIndexSection('calendar-', () => this.calendarIndexer.index());
  }

  /**
   * Updates projects in the index incrementally
   */
  public updateProjects(): void {
    this.updateIndexSection('project-', () => this.projectsIndexer.index());
  }

  /**
   * Removes a specific item from the index by ID
   */
  public removeItem(itemId: string): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    const items = currentIndex.items.filter(item => item.id !== itemId);
    this.buildIndexStructure(items);
  }

  /**
   * Adds or updates a single item in the index
   */
  public upsertItem(item: SearchableItem): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    const items = currentIndex.items.filter(i => i.id !== item.id);
    items.push(item);
    this.buildIndexStructure(items);
  }

  /**
   * Returns index statistics for debugging/monitoring
   */
  public getIndexStats(): { totalItems: number; categories: number; keywords: number } {
    const idx = this.index();
    if (!idx) {
      return { totalItems: 0, categories: 0, keywords: 0 };
    }

    return {
      totalItems: idx.items.length,
      categories: idx.categoryMap.size,
      keywords: idx.keywordMap.size
    };
  }

  /**
   * Initializes the search index with all content
   */
  private initializeIndex(): void {
    const items = this.collectAllItems();
    this.buildIndexStructure(items);
    this.searchEngine.initialize(items);
  }

  /**
   * Collects items from all indexers
   */
  private collectAllItems(): SearchableItem[] {
    const items: SearchableItem[] = [];

    // Static content
    items.push(...this.menuIndexer.index());
    items.push(...this.routesIndexer.index());
    items.push(...this.projectsIndexer.index());
    items.push(...this.skillsIndexer.index());

    // Dynamic content (localStorage-based)
    items.push(...this.todosIndexer.index());
    items.push(...this.galleryIndexer.index());
    items.push(...this.calendarIndexer.index());

    return items;
  }

  /**
   * Builds the index structure with maps for efficient lookups
   */
  private buildIndexStructure(items: SearchableItem[]): void {
    const keywordMap = new Map<string, Set<string>>();
    const itemMap = new Map<string, SearchableItem>();
    const categoryMap = new Map<string, Set<string>>();

    items.forEach((item) => {
      itemMap.set(item.id, item);

      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, new Set());
      }
      categoryMap.get(item.category)!.add(item.id);

      item.keywords.forEach((keyword) => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, new Set());
        }
        keywordMap.get(keyword)!.add(item.id);
      });
    });

    this.index.set({ items, keywordMap, itemMap, categoryMap });
    
    // Reinitialize search engine with new items
    this.searchEngine.initialize(items);
  }

  /**
   * Updates a specific section of the index
   */
  private updateIndexSection(prefix: string, indexerFn: () => SearchableItem[]): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    const itemsWithoutSection = currentIndex.items.filter(item => !item.id.startsWith(prefix));
    const newItems = indexerFn();
    const allItems = [...itemsWithoutSection, ...newItems];

    this.buildIndexStructure(allItems);
  }

  /**
   * Sets up localStorage change listeners for dynamic content
   */
  private setupStorageListeners(): void {
    if (typeof window === 'undefined' || !window.addEventListener) {
      return;
    }

    window.addEventListener('storage', (e: StorageEvent) => {
      switch (e.key) {
        case 'todos':
          this.updateTodos();
          break;
        case 'gallery':
          this.updateGallery();
          break;
        case 'calendarEvents':
          this.updateCalendar();
          break;
      }
    });
  }

  /**
   * Performs the actual search operation
   */
  private performSearch(query: string, index: SearchIndex): SearchResultTree[] {
    const fuseResults = this.searchEngine.search(query);
    const matchInfoMap = new Map<SearchableItem, any>();
    const seenIds = new Set<string>();

    // Process each Fuse.js result
    fuseResults.forEach((fuseResult) => {
      const item = fuseResult.item;
      const matchInfo = this.searchEngine.extractMatchInfo(fuseResult, item);

      if (this.searchEngine.shouldIncludeMatch(matchInfo)) {
        matchInfoMap.set(item, matchInfo);
      }
    });

    // Convert to search results
    const results = this.resultProcessor.convertToResults(
      Array.from(matchInfoMap.keys()),
      matchInfoMap,
      seenIds
    );

    // Sort and limit
    const sortedResults = this.resultProcessor.sortResults(results);
    const limitedResults = this.resultProcessor.limitResults(sortedResults);

    // Group by category
    return this.resultProcessor.groupByCategory(limitedResults);
  }
}

// Re-export types for backward compatibility
export type { SearchResult, SearchResultTree, SearchableItem } from './search/search.models';
