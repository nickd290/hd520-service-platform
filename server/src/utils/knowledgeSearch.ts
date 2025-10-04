import { query } from '../config/database';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  error_codes: string;
  tags: string;
  source: string;
  confidence_score: number;
  usage_count: number;
  last_used: string | null;
}

interface SearchResult extends KnowledgeEntry {
  relevance_score: number;
  match_reason: string;
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Calculate fuzzy similarity (0 to 1)
function fuzzySimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Extract error codes from text
function extractErrorCodes(text: string): string[] {
  const matches = text.match(/E-\d{3}/gi) || [];
  return [...new Set(matches.map(m => m.toUpperCase()))];
}

// Extract technical keywords
function extractKeywords(text: string): string[] {
  const technicalTerms = [
    'ink', 'printhead', 'nozzle', 'calibration', 'alignment', 'maintenance',
    'cleaning', 'pressure', 'temperature', 'bulk', 'cartridge', 'pump',
    'valve', 'sensor', 'motor', 'belt', 'roller', 'head', 'chart',
    'density', 'quality', 'defect', 'streak', 'band', 'missing', 'error'
  ];

  const lowerText = text.toLowerCase();
  return technicalTerms.filter(term => lowerText.includes(term));
}

/**
 * Enhanced knowledge base search with fuzzy matching and weighted scoring
 *
 * Weight system:
 * - uploaded docs: 10x
 * - manual entries: 5x
 * - generic: 1x
 *
 * Plus confidence score multiplier
 */
export async function searchKnowledge(
  searchQuery: string,
  options: {
    limit?: number;
    minRelevance?: number;
    includeGeneric?: boolean;
  } = {}
): Promise<SearchResult[]> {
  const {
    limit = 5,
    minRelevance = 0.1,
    includeGeneric = true
  } = options;

  // Extract error codes from query
  const queryCodes = extractErrorCodes(searchQuery);

  // Extract keywords from query
  const queryKeywords = extractKeywords(searchQuery);

  // Get all knowledge base entries
  const result = query<KnowledgeEntry>(
    'SELECT * FROM knowledge_base ORDER BY confidence_score DESC, usage_count DESC'
  );

  const entries = result.rows;
  const scoredResults: SearchResult[] = [];

  for (const entry of entries) {
    let score = 0;
    let matchReasons: string[] = [];

    // Skip generic if not wanted
    if (!includeGeneric && entry.source === 'generic') {
      continue;
    }

    // Base source weight
    let sourceWeight = 1;
    if (entry.source === 'uploaded') sourceWeight = 10;
    else if (entry.source === 'manual') sourceWeight = 5;

    // 1. Exact error code match (highest priority)
    if (queryCodes.length > 0) {
      const entryCodes = JSON.parse(entry.error_codes || '[]');
      const codeMatches = queryCodes.filter(qc =>
        entryCodes.some((ec: string) => ec.toUpperCase() === qc)
      );

      if (codeMatches.length > 0) {
        score += codeMatches.length * 50 * sourceWeight;
        matchReasons.push(`Error code: ${codeMatches.join(', ')}`);
      }
    }

    // 2. Title fuzzy match
    const titleSimilarity = fuzzySimilarity(
      searchQuery.toLowerCase(),
      entry.title.toLowerCase()
    );
    if (titleSimilarity > 0.5) {
      score += titleSimilarity * 30 * sourceWeight;
      matchReasons.push(`Title match (${Math.round(titleSimilarity * 100)}%)`);
    }

    // 3. Keyword matches in content
    const matchedKeywords = queryKeywords.filter(kw =>
      entry.content.toLowerCase().includes(kw) ||
      entry.title.toLowerCase().includes(kw)
    );
    if (matchedKeywords.length > 0) {
      score += matchedKeywords.length * 10 * sourceWeight;
      matchReasons.push(`Keywords: ${matchedKeywords.join(', ')}`);
    }

    // 4. Tag matches
    const entryTags = JSON.parse(entry.tags || '[]');
    const tagMatches = queryKeywords.filter(kw =>
      entryTags.some((tag: string) => tag.toLowerCase().includes(kw))
    );
    if (tagMatches.length > 0) {
      score += tagMatches.length * 15 * sourceWeight;
      matchReasons.push(`Tags: ${tagMatches.join(', ')}`);
    }

    // 5. Category match
    const categoryMatch = queryKeywords.some(kw =>
      entry.category?.toLowerCase().includes(kw)
    );
    if (categoryMatch) {
      score += 20 * sourceWeight;
      matchReasons.push(`Category: ${entry.category}`);
    }

    // 6. Content fuzzy search (sample - check first 500 chars)
    const contentSample = entry.content.substring(0, 500).toLowerCase();
    const queryWords = searchQuery.toLowerCase().split(/\s+/);
    const contentMatches = queryWords.filter(word =>
      word.length > 3 && contentSample.includes(word)
    );
    if (contentMatches.length > 0) {
      score += contentMatches.length * 5 * sourceWeight;
    }

    // Apply confidence score multiplier
    score *= entry.confidence_score;

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, score);

    if (normalizedScore >= minRelevance && matchReasons.length > 0) {
      scoredResults.push({
        ...entry,
        relevance_score: normalizedScore,
        match_reason: matchReasons.join(' • ')
      });
    }
  }

  // Sort by relevance score
  scoredResults.sort((a, b) => b.relevance_score - a.relevance_score);

  // Update usage stats for top results
  const topResults = scoredResults.slice(0, limit);
  for (const result of topResults) {
    query(
      'UPDATE knowledge_base SET usage_count = usage_count + 1, last_used = CURRENT_TIMESTAMP WHERE id = ?',
      [result.id]
    );
  }

  return topResults;
}

/**
 * Simple cache for frequent searches
 */
const searchCache = new Map<string, { results: SearchResult[], timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export async function searchKnowledgeWithCache(
  searchQuery: string,
  options?: any
): Promise<SearchResult[]> {
  const cacheKey = `${searchQuery}_${JSON.stringify(options)}`;
  const cached = searchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }

  const results = await searchKnowledge(searchQuery, options);
  searchCache.set(cacheKey, { results, timestamp: Date.now() });

  // Clean old cache entries
  if (searchCache.size > 100) {
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }

  return results;
}
