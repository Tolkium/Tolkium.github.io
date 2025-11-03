import type { SearchResult, SearchResultTree, SearchableItem } from './search.models';
import { SEARCH_CONFIG } from './search.config';

/**
 * Processes and groups search results
 */
export class SearchResultProcessor {
  /**
   * Converts searchable items with match info into search results
   */
  convertToResults(
    items: SearchableItem[],
    matchInfoMap: Map<SearchableItem, any>,
    seenIds: Set<string>
  ): SearchResult[] {
    const results: SearchResult[] = [];

    items.forEach((item) => {
      if (seenIds.has(item.id)) {
        return;
      }

      const matchInfo = matchInfoMap.get(item);
      if (!matchInfo) {
        return;
      }

      seenIds.add(item.id);

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
        matchScore: matchInfo.score,
        highlightRanges: matchInfo.highlightRanges,
        descriptionHighlightRanges: matchInfo.descriptionHighlightRanges,
        matchLocation: matchInfo.matchLocation,
        category: item.category,
        type: item.type,
        iconName: item.iconName,
        parent: item.parent,
        path
      });
    });

    return results;
  }

  /**
   * Sorts results by relevance
   */
  sortResults(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
      // Primary sort: by score (highest first)
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Secondary sort: by title length (shorter titles preferred for same score)
      return a.title.length - b.title.length;
    });
  }

  /**
   * Limits results to top N
   */
  limitResults(results: SearchResult[], limit: number = SEARCH_CONFIG.limits.maxResults): SearchResult[] {
    return results.slice(0, limit);
  }

  /**
   * Groups results by category while preserving sort order
   */
  groupByCategory(results: SearchResult[]): SearchResultTree[] {
    interface ResultWithIndex {
      result: SearchResult;
      globalIndex: number;
    }

    const categoryMap = new Map<string, ResultWithIndex[]>();

    // Group by category
    results.forEach((result, globalIndex) => {
      if (!categoryMap.has(result.category)) {
        categoryMap.set(result.category, []);
      }
      categoryMap.get(result.category)!.push({
        result,
        globalIndex
      });
    });

    // Sort categories by their best item's score
    const categoryScores = Array.from(categoryMap.entries()).map(([category, items]) => {
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

    // Sort categories by highest score first, then earliest position
    categoryScores.sort((a, b) => {
      if (b.maxScore !== a.maxScore) {
        return b.maxScore - a.maxScore;
      }
      return a.bestPosition - b.bestPosition;
    });

    // Convert to tree structure
    const trees: SearchResultTree[] = [];
    categoryScores.forEach(({ category, items }) => {
      trees.push({
        category,
        items: items
          .sort((a, b) => {
            if (b.result.matchScore !== a.result.matchScore) {
              return b.result.matchScore - a.result.matchScore;
            }
            return a.globalIndex - b.globalIndex;
          })
          .slice(0, SEARCH_CONFIG.limits.maxResultsPerCategory)
          .map(({ result }) => result)
      });
    });

    return trees;
  }
}

