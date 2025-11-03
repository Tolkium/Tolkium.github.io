/**
 * Search-related type definitions and interfaces
 */

export type SearchableItemType = 'route' | 'menu-item' | 'feature' | 'setting';

export type MatchLocation = 'title' | 'description' | 'keyword';

/**
 * Represents an item that can be searched
 */
export interface SearchableItem {
  id: string;
  type: SearchableItemType;
  title: string;
  description?: string;
  route?: string;
  keywords: string[];
  category: string;
  parent?: string;
  iconName?: string;
}

/**
 * Represents a search result with match information
 */
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  route: string;
  matchScore: number;
  highlightRanges: [number, number][];
  descriptionHighlightRanges?: [number, number][];
  matchLocation: MatchLocation;
  category: string;
  type: SearchableItemType;
  iconName?: string;
  parent?: string;
  path?: string[];
}

/**
 * Grouped search results by category
 */
export interface SearchResultTree {
  category: string;
  items: SearchResult[];
  children?: SearchResultTree[];
}

/**
 * Internal search index structure
 */
export interface SearchIndex {
  items: SearchableItem[];
  keywordMap: Map<string, Set<string>>;
  itemMap: Map<string, SearchableItem>;
  categoryMap: Map<string, Set<string>>;
}

/**
 * Match information extracted from Fuse.js result
 */
export interface MatchInfo {
  score: number;
  highlightRanges: [number, number][];
  descriptionHighlightRanges?: [number, number][];
  matchLocation: MatchLocation;
}

