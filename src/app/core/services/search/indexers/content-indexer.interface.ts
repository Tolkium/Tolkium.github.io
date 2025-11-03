import type { SearchableItem } from '../search.models';

/**
 * Interface for content indexers
 * Each indexer is responsible for indexing a specific type of content
 */
export interface IContentIndexer {
  index(): SearchableItem[];
}

