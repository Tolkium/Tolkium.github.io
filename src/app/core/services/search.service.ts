import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MENU_SECTIONS } from '../../models/menu-data';
import { MenuSection, MenuItem } from '../../models/menu-section';
import { routes } from '../../app.routes';
import { MOCK_PROJECTS } from '../../models/project.model';

export interface SearchableItem {
  id: string;
  type: 'route' | 'menu-item' | 'feature' | 'setting';
  title: string;
  description?: string;
  route?: string;
  keywords: string[];
  category: string;
  parent?: string;
  iconName?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  route: string;
  matchScore: number;
  highlightRanges: [number, number][]; // For title highlighting
  descriptionHighlightRanges?: [number, number][]; // For description highlighting when match is in description
  matchLocation: 'title' | 'description' | 'keyword'; // Where the match was found
  category: string;
  type: SearchableItem['type'];
  iconName?: string;
  parent?: string;
  path?: string[]; // Breadcrumb path (e.g., ['Navigation', 'Projects'])
}

export interface SearchResultTree {
  category: string;
  items: SearchResult[];
  children?: SearchResultTree[];
}

interface SearchIndex {
  items: SearchableItem[];
  keywordMap: Map<string, Set<string>>;
  itemMap: Map<string, SearchableItem>; // Fast lookup by ID for incremental updates
  categoryMap: Map<string, Set<string>>; // Category -> Set of item IDs for efficient category updates
}

type IndexSource = 'menu' | 'routes' | 'projects' | 'todos' | 'gallery' | 'calendar' | 'skills';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly platformId = inject(PLATFORM_ID);
  
  private readonly index = signal<SearchIndex | null>(null);
  private readonly searchQuery = signal<string>('');

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
      
      // In development, listen for localStorage changes to auto-update dynamic content
      // This handles todos, gallery, and calendar updates automatically
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('storage', (e: StorageEvent) => {
          if (e.key === 'todos') {
            this.updateTodos();
          } else if (e.key === 'gallery') {
            this.updateGallery();
          } else if (e.key === 'calendarEvents') {
            this.updateCalendar();
          }
        });
      }
    }
  }

  public setQuery(query: string): void {
    this.searchQuery.set(query);
  }

  public clearQuery(): void {
    this.searchQuery.set('');
  }

  /**
   * Initialize the search index with all static and dynamic content.
   * This creates the full index on first load.
   */
  private initializeIndex(): void {
    const items: SearchableItem[] = [];
    
    // Index static content (menu, routes, projects, skills)
    this.indexMenuItems(items);
    this.indexRoutes(items);
    this.indexProjects(items);
    this.indexSkills(items);
    
    // Index dynamic content (localStorage-based)
    this.indexTodos(items);
    this.indexGallery(items);
    this.indexCalendar(items);
    
    // Build the index structure
    this.buildIndexStructure(items);
  }

  /**
   * Rebuild index structure from items array.
   * This updates keywordMap, itemMap, and categoryMap.
   */
  private buildIndexStructure(items: SearchableItem[]): void {
    const keywordMap = new Map<string, Set<string>>();
    const itemMap = new Map<string, SearchableItem>();
    const categoryMap = new Map<string, Set<string>>();

    items.forEach((item) => {
      // Add to item map for fast lookup
      itemMap.set(item.id, item);
      
      // Add to category map
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, new Set());
      }
      categoryMap.get(item.category)!.add(item.id);
      
      // Build keyword map
      item.keywords.forEach((keyword) => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, new Set());
        }
        keywordMap.get(keyword)!.add(item.id);
      });
    });

    this.index.set({ items, keywordMap, itemMap, categoryMap });
  }

  /**
   * Index menu items (static content).
   */
  private indexMenuItems(items: SearchableItem[]): void {

    MENU_SECTIONS.forEach((section: MenuSection) => {
      section.items.forEach((item: MenuItem) => {
        const keywords: string[] = [
          item.label.toLowerCase(),
          ...this.extractKeywords(item.label)
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
  }

  /**
   * Index routes (static content).
   */
  private indexRoutes(items: SearchableItem[]): void {
    routes.forEach((route) => {
      if (route.path && route.path !== '' && route.path !== '**') {
        const routeName = this.formatRouteName(route.path);
        const keywords: string[] = [
          routeName.toLowerCase(),
          route.path.toLowerCase(),
          ...this.extractKeywords(routeName)
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

  }

  /**
   * Index projects (static content).
   */
  private indexProjects(items: SearchableItem[]): void {
    MOCK_PROJECTS.forEach((project) => {
      // Extract all words and phrases from description for better searchability
      const descriptionLower = project.description.toLowerCase();
      const descriptionWords = descriptionLower
        .split(/\s+/)
        .filter(word => word.length > 2); // Only meaningful words
      
      // Extract bigrams (2-word phrases) from description for phrase matching
      const bigrams: string[] = [];
      for (let i = 0; i < descriptionWords.length - 1; i++) {
        bigrams.push(`${descriptionWords[i]} ${descriptionWords[i + 1]}`);
      }
      
      const keywords: string[] = [
        project.title.toLowerCase(),
        descriptionLower, // Full description as keyword
        project.category.toLowerCase(),
        project.status.toLowerCase(),
        ...project.technologies.map(t => t.toLowerCase()),
        ...this.extractKeywords(project.title),
        ...this.extractKeywords(project.description),
        ...descriptionWords, // Individual words
        ...bigrams // Two-word phrases for better phrase matching
      ];

      items.push({
        id: `project-${project.id}`,
        type: 'feature',
        title: project.title,
        description: `${project.category} - ${project.description}`,
        route: '/projects',
        keywords,
        category: 'Projects',
        parent: 'Features'
      });
    });

  }

  /**
   * Index todos from localStorage (dynamic content).
   */
  private indexTodos(items: SearchableItem[]): void {
    try {
      const todosJson = localStorage.getItem('todos');
      if (todosJson) {
        const todos = JSON.parse(todosJson) as Array<{
          id: string;
          title: string;
          description?: string;
          priority: string;
        }>;
        todos.forEach((todo) => {
          const keywords: string[] = [
            todo.title.toLowerCase(),
            ...(todo.description ? [todo.description.toLowerCase()] : []),
            todo.priority.toLowerCase(),
            ...this.extractKeywords(todo.title)
          ];

          items.push({
            id: `todo-${todo.id}`,
            type: 'feature',
            title: todo.title,
            description: todo.description || `Todo item: ${todo.title}`,
            route: '/todo',
            keywords,
            category: 'Todo Items',
            parent: 'Features'
          });
        });
      }
    } catch (e) {
      // Silently fail if localStorage todos are invalid
    }

  }

  /**
   * Index gallery images from localStorage (dynamic content).
   */
  private indexGallery(items: SearchableItem[]): void {
    try {
      const galleryJson = localStorage.getItem('gallery');
      if (galleryJson) {
        const images = JSON.parse(galleryJson) as Array<{
          id: string;
          title: string;
          description?: string;
          category: string;
        }>;
        images.forEach((image) => {
          const keywords: string[] = [
            image.title.toLowerCase(),
            ...(image.description ? [image.description.toLowerCase()] : []),
            image.category.toLowerCase(),
            ...this.extractKeywords(image.title)
          ];

          items.push({
            id: `gallery-${image.id}`,
            type: 'feature',
            title: image.title,
            description: image.description || `Gallery image: ${image.title}`,
            route: '/gallery',
            keywords,
            category: 'Gallery',
            parent: 'Features'
          });
        });
      }
    } catch (e) {
      // Silently fail if localStorage gallery is invalid
    }

  }

  /**
   * Index calendar events from localStorage (dynamic content).
   */
  private indexCalendar(items: SearchableItem[]): void {
    try {
      const eventsJson = localStorage.getItem('calendarEvents');
      if (eventsJson) {
        const events = JSON.parse(eventsJson) as Array<{
          id: string;
          title: string;
          description?: string;
        }>;
        events.forEach((event) => {
          const keywords: string[] = [
            event.title.toLowerCase(),
            ...(event.description ? [event.description.toLowerCase()] : []),
            ...this.extractKeywords(event.title)
          ];

          items.push({
            id: `calendar-${event.id}`,
            type: 'feature',
            title: event.title,
            description: event.description || `Calendar event: ${event.title}`,
            route: '/calendar',
            keywords,
            category: 'Calendar Events',
            parent: 'Features'
          });
        });
      }
    } catch (e) {
      // Silently fail if localStorage events are invalid
    }

  }

  /**
   * Index skills (static content).
   */
  private indexSkills(items: SearchableItem[]): void {
    const technicalSkills = [
      'Angular', 'JavaScript', 'TypeScript', 'HTML', 'SCSS', 'Web Development',
      'Software Design Patterns', 'SOLID', 'Bootstrap', 'Git', 'Azure DevOps',
      'Docker', 'Nx', 'Unit Testing', 'RXJS', 'NodeJS', 'NestJS', 'OpenAI API', 'Python'
    ];
    
    const softSkills = [
      'Problem Solving', 'Fast Learner', 'Agile', 'Team Player', 'Creativity', 'Solution Design'
    ];

    [...technicalSkills, ...softSkills].forEach((skill) => {
      const keywords: string[] = [
        skill.toLowerCase(),
        ...this.extractKeywords(skill),
        'skill', 'about', 'experience'
      ];

      items.push({
        id: `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'feature',
        title: skill,
        description: `Technical skill: ${skill}`,
        route: '/about',
        keywords,
        category: 'Skills',
        parent: 'About'
      });
    });
  }

  /**
   * Rebuild the entire index from scratch.
   * Use this when static content (projects, menu, routes) changes or for debugging.
   */
  public rebuildIndex(): void {
    this.initializeIndex();
  }

  /**
   * Update projects in the index incrementally.
   * Note: Projects are typically static (MOCK_PROJECTS), but this method allows
   * refreshing them if they're modified at runtime (e.g., via admin panel).
   */
  public updateProjects(): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    const itemsWithoutProjects = currentIndex.items.filter(item => !item.id.startsWith('project-'));
    const items: SearchableItem[] = [...itemsWithoutProjects];
    this.indexProjects(items);
    this.buildIndexStructure(items);
  }

  /**
   * Update todos in the index incrementally.
   * Call this after todos are added, updated, or deleted from localStorage.
   */
  public updateTodos(): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    // Remove all existing todos
    const itemsWithoutTodos = currentIndex.items.filter(item => !item.id.startsWith('todo-'));
    
    // Add fresh todos
    const items: SearchableItem[] = [...itemsWithoutTodos];
    this.indexTodos(items);
    
    // Rebuild index structure
    this.buildIndexStructure(items);
  }

  /**
   * Update gallery items in the index incrementally.
   */
  public updateGallery(): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    const itemsWithoutGallery = currentIndex.items.filter(item => !item.id.startsWith('gallery-'));
    const items: SearchableItem[] = [...itemsWithoutGallery];
    this.indexGallery(items);
    this.buildIndexStructure(items);
  }

  /**
   * Update calendar events in the index incrementally.
   */
  public updateCalendar(): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    const itemsWithoutCalendar = currentIndex.items.filter(item => !item.id.startsWith('calendar-'));
    const items: SearchableItem[] = [...itemsWithoutCalendar];
    this.indexCalendar(items);
    this.buildIndexStructure(items);
  }

  /**
   * Remove a specific item from the index by ID.
   */
  public removeItem(itemId: string): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    const items = currentIndex.items.filter(item => item.id !== itemId);
    this.buildIndexStructure(items);
  }

  /**
   * Add or update a single item in the index.
   * Useful for individual updates without rebuilding entire sections.
   */
  public upsertItem(item: SearchableItem): void {
    const currentIndex = this.index();
    if (!currentIndex) return;

    // Remove existing item if present
    const items = currentIndex.items.filter(i => i.id !== item.id);
    // Add new/updated item
    items.push(item);
    this.buildIndexStructure(items);
  }

  /**
   * Get the current index size (for debugging/monitoring).
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

  private performSearch(query: string, index: SearchIndex): SearchResultTree[] {
    const results: SearchResult[] = [];
    const seenIds = new Set<string>();

    // Search through all items
    index.items.forEach((item) => {
      const match = this.fuzzyMatch(query, item);
      if (match.score > 0 && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        // Build breadcrumb path
        const path: string[] = [];
        if (item.parent) {
          path.push(item.parent);
        }
        path.push(item.category);
        
        results.push({
          id: item.id,
          title: item.title,
          description: item.description,
          route: item.route || '',
          matchScore: match.score,
          highlightRanges: match.highlightRanges,
          descriptionHighlightRanges: match.descriptionHighlightRanges,
          matchLocation: match.matchLocation,
          category: item.category,
          type: item.type,
          iconName: item.iconName,
          parent: item.parent,
          path
        });
      }
    });

    // Sort by score (highest first) - best results first
    results.sort((a, b) => {
      // Primary sort: by score (highest first)
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Secondary sort: by title length (shorter titles preferred for same score)
      return a.title.length - b.title.length;
    });

    // Limit to top 50 results before grouping (to get best from each category)
    const topResults = results.slice(0, 50);

    // Group by category while preserving best-first order
    return this.groupResultsByCategory(topResults);
  }

  private fuzzyMatch(query: string, item: SearchableItem): {
    score: number;
    highlightRanges: [number, number][];
    descriptionHighlightRanges?: [number, number][];
    matchLocation: 'title' | 'description' | 'keyword';
  } {
    let bestScore = 0;
    let bestRanges: [number, number][] = [];
    let descRanges: [number, number][] | undefined;
    let matchLocation: 'title' | 'description' | 'keyword' = 'keyword';

    // Match on title first
    const titleLower = item.title.toLowerCase();
    const queryLower = query.toLowerCase();
    const titleMatch = this.matchString(queryLower, titleLower);
    if (titleMatch.score > 0) {
      bestScore = titleMatch.score * 1.2; // Boost title matches
      bestRanges = titleMatch.ranges;
      matchLocation = 'title';
    }

    // Check description
    if (item.description) {
      const descLower = item.description.toLowerCase();
      const descMatch = this.matchString(queryLower, descLower);
      
      // If description match is better, prioritize it
      if (descMatch.score * 1.1 > bestScore) {
        bestScore = descMatch.score * 1.1;
        descRanges = descMatch.ranges; // Highlight description, not title
        bestRanges = []; // Clear title highlights
        matchLocation = 'description';
      } else if (descMatch.score > 0 && bestScore === 0) {
        // If no title match but description matches, use description
        bestScore = descMatch.score;
        descRanges = descMatch.ranges;
        matchLocation = 'description';
      }
    }

    // Check keywords (for scoring, but track if keyword match is best)
    let bestKeywordScore = 0;
    item.keywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const keywordMatch = this.matchString(queryLower, keywordLower);
      
      // Boost score for exact phrase matches
      if (keywordLower.includes(queryLower) && keywordLower.split(/\s+/).length >= queryLower.split(/\s+/).length) {
        const phraseBoost = keywordLower === queryLower ? 1.2 : 1.1;
        bestKeywordScore = Math.max(bestKeywordScore, keywordMatch.score * phraseBoost);
      } else if (keywordMatch.score > bestKeywordScore) {
        bestKeywordScore = keywordMatch.score * 0.9;
      }
    });
    
    // If keyword match is best and better than title/description, use keyword location
    if (bestKeywordScore > bestScore) {
      bestScore = bestKeywordScore;
      matchLocation = 'keyword';
      // Don't highlight title or description when match is only in keywords
      if (matchLocation === 'keyword' && bestRanges.length === 0 && !descRanges) {
        // Still show title, but no highlights
      }
    }

    return {
      score: bestScore,
      highlightRanges: bestRanges,
      descriptionHighlightRanges: descRanges,
      matchLocation
    };
  }

  private matchString(query: string, text: string): {
    score: number;
    ranges: [number, number][];
  } {
    // Exact match
    if (text === query) {
      return {
        score: 100,
        ranges: [[0, text.length]]
      };
    }

    // Starts with
    if (text.startsWith(query)) {
      return {
        score: 80,
        ranges: [[0, query.length]]
      };
    }

    // Contains (word boundary preferred)
    const containsIndex = text.indexOf(query);
    if (containsIndex !== -1) {
      const isWordBoundary = containsIndex === 0 || 
        /\s/.test(text[containsIndex - 1]);
      
      return {
        score: isWordBoundary ? 70 : 60,
        ranges: [[containsIndex, containsIndex + query.length]]
      };
    }

    // Fuzzy character sequence match
    return this.fuzzySequenceMatch(query, text);
  }

  private fuzzySequenceMatch(query: string, text: string): {
    score: number;
    ranges: [number, number][];
  } {
    let queryIndex = 0;
    let textIndex = 0;
    const ranges: [number, number][] = [];
    let rangeStart = -1;
    let consecutiveMatches = 0;
    let totalMatches = 0;

    while (textIndex < text.length && queryIndex < query.length) {
      if (text[textIndex] === query[queryIndex]) {
        if (rangeStart === -1) {
          rangeStart = textIndex;
        }
        consecutiveMatches++;
        totalMatches++;
        queryIndex++;
        
        // If we've matched all characters
        if (queryIndex === query.length) {
          ranges.push([rangeStart, textIndex + 1]);
          break;
        }
      } else {
        // End current range if exists
        if (rangeStart !== -1 && consecutiveMatches > 0) {
          ranges.push([rangeStart, textIndex]);
          rangeStart = -1;
          consecutiveMatches = 0;
        }
      }
      textIndex++;
    }

    // Calculate score based on match quality
    if (totalMatches === 0) {
      return { score: 0, ranges: [] };
    }

    const matchRatio = totalMatches / query.length;
    const positionPenalty = ranges.length > 0 ? 
      Math.max(0, 1 - (ranges[0][0] / text.length)) : 0;
    const continuityBonus = consecutiveMatches / query.length;

    // Score: 40-50 for fuzzy matches depending on quality
    const score = 40 + (matchRatio * 10) + (positionPenalty * 5) + (continuityBonus * 5);
    
    return {
      score: Math.min(score, 50),
      ranges: ranges.length > 0 ? ranges : []
    };
  }

  private groupResultsByCategory(results: SearchResult[]): SearchResultTree[] {
    // Group results while maintaining global sort order
    // This ensures best matches appear first regardless of category
    interface ResultWithIndex {
      result: SearchResult;
      globalIndex: number;
    }
    
    const categoryMap = new Map<string, ResultWithIndex[]>();
    
    // Keep track of global position for each result
    results.forEach((result, globalIndex) => {
      if (!categoryMap.has(result.category)) {
        categoryMap.set(result.category, []);
      }
      categoryMap.get(result.category)!.push({
        result,
        globalIndex // Store original position
      });
    });

    // Convert to tree structure
    const trees: SearchResultTree[] = [];
    
    // Sort categories by their best item's score AND position (best categories first)
    const categoryScores = Array.from(categoryMap.entries()).map(([category, items]) => {
      // Get the best item (highest score, earliest position)
      const bestItem = items.reduce((best, current) => {
        if (current.result.matchScore > best.result.matchScore) return current;
        if (current.result.matchScore === best.result.matchScore && current.globalIndex < best.globalIndex) return current;
        return best;
      });
      
      return {
        category,
        items,
        maxScore: bestItem.result.matchScore,
        bestPosition: bestItem.globalIndex
      };
    });

    // Sort categories by: highest score first, then earliest position for tie-breaking
    categoryScores.sort((a, b) => {
      if (b.maxScore !== a.maxScore) {
        return b.maxScore - a.maxScore;
      }
      return a.bestPosition - b.bestPosition;
    });

    categoryScores.forEach(({ category, items }) => {
      // Items within category maintain their global sort order
      // Limit items per category to top matches
      trees.push({
        category,
        items: items
          .sort((a, b) => {
            // Sort by score first
            if (b.result.matchScore !== a.result.matchScore) {
              return b.result.matchScore - a.result.matchScore;
            }
            // Then by global position to maintain original order
            return a.globalIndex - b.globalIndex;
          })
          .slice(0, 15)
          .map(({ result }) => result)
      });
    });

    return trees;
  }

  private extractKeywords(text: string): string[] {
    // Extract words and common abbreviations
    const words = text.toLowerCase().split(/\s+/);
    const keywords: string[] = [];

    words.forEach((word) => {
      if (word.length > 2) {
        keywords.push(word);
        // Add partial words (first 3, 4, 5 chars)
        if (word.length > 3) keywords.push(word.substring(0, 3));
        if (word.length > 4) keywords.push(word.substring(0, 4));
        if (word.length > 5) keywords.push(word.substring(0, 5));
      }
    });

    return keywords;
  }

  private formatRouteName(path: string): string {
    // Convert route path to readable name
    return path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

