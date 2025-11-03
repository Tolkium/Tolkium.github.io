/**
 * Utility functions for search functionality
 */

/**
 * Extracts keywords from text for indexing
 */
export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const keywords: string[] = [];

  words.forEach((word) => {
    if (word.length > 2) {
      keywords.push(word);
      // Add partial words (first 3, 4, 5 chars) for partial matching
      if (word.length > 3) keywords.push(word.substring(0, 3));
      if (word.length > 4) keywords.push(word.substring(0, 4));
      if (word.length > 5) keywords.push(word.substring(0, 5));
    }
  });

  return keywords;
}

/**
 * Formats route path to readable name
 */
export function formatRouteName(path: string): string {
  return path
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extracts meaningful words from text (filters short words)
 */
export function extractMeaningfulWords(text: string, minLength = 2): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= minLength);
}

/**
 * Generates bigrams (2-word phrases) from word array
 */
export function generateBigrams(words: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  return bigrams;
}

