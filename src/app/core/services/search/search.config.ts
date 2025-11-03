/**
 * Search configuration constants
 */
export const SEARCH_CONFIG = {
  /**
   * Fuse.js search configuration
   */
  fuse: {
    threshold: 0.3, // Lower = stricter matching (0.0 = perfect, 1.0 = match anything)
    minMatchCharLength: 2,
    fieldWeights: {
      title: 0.5,
      description: 0.3,
      keywords: 0.2
    }
  },

  /**
   * Score thresholds for filtering results
   */
  scoreThresholds: {
    titleOrDescription: 25, // Minimum score for title/description matches
    keywordOnly: 50, // Minimum score for keyword-only matches
    keywordOnlyWithoutHighlight: 60 // Stricter threshold for keyword matches without visible highlights
  },

  /**
   * Score multipliers based on match location
   */
  scoreMultipliers: {
    title: 1.3,
    description: 1.15,
    keyword: 0.7
  },

  /**
   * Result limits
   */
  limits: {
    maxResults: 50,
    maxResultsPerCategory: 15
  },

  /**
   * Debounce settings for search input
   */
  debounce: {
    query: 150 // milliseconds
  }
} as const;

