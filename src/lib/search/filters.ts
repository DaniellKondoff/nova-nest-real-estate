/**
 * Regex-based extraction of structured search filters from Bulgarian natural
 * language queries. No LLM call — pure pattern matching, fast and deterministic.
 *
 * Example:
 *   extractFiltersFromQuery("двустаен под наем до 80000")
 *   // → { maxRooms: 2, operationType: 'rent', maxPriceEur: 80000 }
 */

export interface ExtractedFilters {
  operationType?: "sale" | "rent";
  minPriceEur?:   number;
  maxPriceEur?:   number;
  minAreaSqm?:    number;
  maxAreaSqm?:    number;
  minRooms?:      number;
  maxRooms?:      number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a number from a regex match group, normalising Bulgarian thousands separators. */
function parseNum(s: string): number {
  // remove spaces used as thousands separators (e.g. "80 000")
  return parseFloat(s.replace(/\s/g, "").replace(",", "."));
}

// ---------------------------------------------------------------------------
// Extraction rules
// ---------------------------------------------------------------------------

const RENT_PATTERN  = /\b(под\s+наем|наем|rent|rент)\b/i;
const SALE_PATTERN  = /\b(продажба|продава|купува|за\s+продан|sale)\b/i;

/**
 * Bulgarian room-count words → room count.
 * We set both minRooms and maxRooms to the same value so the filter is exact.
 */
const ROOM_WORDS: Array<[RegExp, number]> = [
  [/\bедностаен\b/i,    1],
  [/\bдвустаен\b/i,     2],
  [/\bтристаен\b/i,     3],
  [/\bчетиристаен\b/i,  4],
  [/\bпетстаен\b/i,     5],
];

/** "3 стаи", "3-стаен", "3 стайно" */
const ROOM_COUNT_PATTERN = /\b(\d+)\s*[-–]?\s*ста[ий]/i;

/** Price upper bound: "до 80000", "до 80 000", "под 100000", "max 50000" */
const MAX_PRICE_PATTERN = /\b(?:до|под|max)\s+([\d\s]{1,10}(?:[,.]\d{1,2})?)\b/i;

/** Price lower bound: "от 50000", "над 40000", "min 30000" */
const MIN_PRICE_PATTERN = /\b(?:от|над|min)\s+([\d\s]{1,10}(?:[,.]\d{1,2})?)\s*(?:евро|eur|лв|bgn)?\b/i;

/** Area upper bound: "до 120 кв", "до 90м²", "до 90 m2" */
const MAX_AREA_PATTERN = /\b(?:до|под|max)\s+([\d\s]{1,7}(?:[,.]\d{1,2})?)\s*(?:кв\.?\s*м?|м²|m²|m2|sqm)\b/i;

/** Area lower bound: "от 60 кв", "над 50м²" */
const MIN_AREA_PATTERN = /\b(?:от|над|min)\s+([\d\s]{1,7}(?:[,.]\d{1,2})?)\s*(?:кв\.?\s*м?|м²|m²|m2|sqm)\b/i;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function extractFiltersFromQuery(query: string): ExtractedFilters {
  const filters: ExtractedFilters = {};

  // --- operation type -------------------------------------------------------
  if (RENT_PATTERN.test(query)) {
    filters.operationType = "rent";
  } else if (SALE_PATTERN.test(query)) {
    filters.operationType = "sale";
  }

  // --- rooms ----------------------------------------------------------------
  let roomCount: number | undefined;

  for (const [pattern, count] of ROOM_WORDS) {
    if (pattern.test(query)) {
      roomCount = count;
      break;
    }
  }

  if (roomCount === undefined) {
    const m = ROOM_COUNT_PATTERN.exec(query);
    if (m) roomCount = parseInt(m[1], 10);
  }

  if (roomCount !== undefined) {
    filters.minRooms = roomCount;
    filters.maxRooms = roomCount;
  }

  // --- area (must be checked before price to avoid prefix conflicts) --------
  const maxAreaMatch = MAX_AREA_PATTERN.exec(query);
  if (maxAreaMatch) {
    filters.maxAreaSqm = parseNum(maxAreaMatch[1]);
  }

  const minAreaMatch = MIN_AREA_PATTERN.exec(query);
  if (minAreaMatch) {
    filters.minAreaSqm = parseNum(minAreaMatch[1]);
  }

  // --- price (after area so "до 120 кв" is consumed first) -----------------
  // Build a version of the query with area matches replaced so price regex
  // doesn't accidentally match area numbers.
  const queryForPrice = query
    .replace(MAX_AREA_PATTERN, "")
    .replace(MIN_AREA_PATTERN, "");

  const maxPriceMatch = MAX_PRICE_PATTERN.exec(queryForPrice);
  if (maxPriceMatch) {
    filters.maxPriceEur = parseNum(maxPriceMatch[1]);
  }

  const minPriceMatch = MIN_PRICE_PATTERN.exec(queryForPrice);
  if (minPriceMatch) {
    filters.minPriceEur = parseNum(minPriceMatch[1]);
  }

  return filters;
}
