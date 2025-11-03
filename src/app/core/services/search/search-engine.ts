import Fuse, { FuseResult, IFuseOptions } from 'fuse.js';
import { SEARCH_CONFIG } from './search.config';
import type { SearchableItem, MatchInfo } from './search.models';

/**
 * Wrapper around Fuse.js that handles search logic and match extraction
 */
export class SearchEngine {
  private fuse: Fuse<SearchableItem> | null = null;

  /**
   * Initializes the search engine with items to search
   */
  initialize(items: SearchableItem[]): void {
    const options: IFuseOptions<SearchableItem> = {
      keys: [
        { name: 'title', weight: SEARCH_CONFIG.fuse.fieldWeights.title },
        { name: 'description', weight: SEARCH_CONFIG.fuse.fieldWeights.description },
        { name: 'keywords', weight: SEARCH_CONFIG.fuse.fieldWeights.keywords }
      ],
      threshold: SEARCH_CONFIG.fuse.threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: SEARCH_CONFIG.fuse.minMatchCharLength,
      ignoreLocation: false,
      findAllMatches: true,
      shouldSort: true
    };

    this.fuse = new Fuse(items, options);
  }

  /**
   * Performs search and returns Fuse.js results
   */
  search(query: string): FuseResult<SearchableItem>[] {
    if (!this.fuse) {
      return [];
    }
    return this.fuse.search(query);
  }

  /**
   * Extracts match information from Fuse.js result
   */
  extractMatchInfo(fuseResult: FuseResult<SearchableItem>, item: SearchableItem): MatchInfo {
    const fuseScore = fuseResult.score ?? 1;
    const clampedScore = Math.max(0, Math.min(1, fuseScore));
    const normalizedScore = (1 - clampedScore) * 100;

    let bestRanges: [number, number][] = [];
    let descRanges: [number, number][] | undefined;
    let matchLocation: MatchInfo['matchLocation'] = 'keyword';

    // Extract matches prioritizing title > description > keywords
    if (fuseResult.matches && fuseResult.matches.length > 0) {
      const sortedMatches = [...fuseResult.matches].sort((a, b) => {
        const order: Record<string, number> = { 'title': 0, 'description': 1, 'keywords': 2 };
        return (order[a.key || ''] ?? 3) - (order[b.key || ''] ?? 3);
      });

      for (const match of sortedMatches) {
        const key = match.key || '';

        if (key === 'title') {
          if (match.indices && match.indices.length > 0) {
            bestRanges = match.indices.map(
              ([start, end]: readonly [number, number]) => [start, end + 1] as [number, number]
            );
            matchLocation = 'title';
            break; // Title match is most important, stop here
          }
        } else if (key === 'description' && item.description) {
          if (match.indices && match.indices.length > 0 && bestRanges.length === 0) {
            descRanges = match.indices.map(
              ([start, end]: readonly [number, number]) => [start, end + 1] as [number, number]
            );
            matchLocation = 'description';
          }
        } else if (key === 'keywords') {
          if (bestRanges.length === 0 && !descRanges) {
            matchLocation = 'keyword';
          }
        }
      }
    }

    // Apply score multipliers based on match location
    let finalScore = normalizedScore;
    const multiplier = SEARCH_CONFIG.scoreMultipliers[matchLocation];
    finalScore = Math.min(100, normalizedScore * multiplier);

    return {
      score: finalScore,
      highlightRanges: bestRanges,
      descriptionHighlightRanges: descRanges,
      matchLocation
    };
  }

  /**
   * Checks if a match should be included in results based on quality thresholds
   */
  shouldIncludeMatch(matchInfo: MatchInfo): boolean {
    const hasTitleMatch = matchInfo.highlightRanges.length > 0;
    const hasDescriptionMatch = matchInfo.descriptionHighlightRanges !== undefined &&
      matchInfo.descriptionHighlightRanges.length > 0;
    const hasActualMatches = hasTitleMatch || hasDescriptionMatch;

    // Determine minimum score threshold
    const minScore = hasActualMatches
      ? SEARCH_CONFIG.scoreThresholds.titleOrDescription
      : SEARCH_CONFIG.scoreThresholds.keywordOnly;

    if (matchInfo.score < minScore) {
      return false;
    }

    // Stricter check for keyword-only matches without visible highlights
    if (
      matchInfo.matchLocation === 'keyword' &&
      !hasActualMatches &&
      matchInfo.score < SEARCH_CONFIG.scoreThresholds.keywordOnlyWithoutHighlight
    ) {
      return false;
    }

    return true;
  }
}

