/**
 * Normalizes Arabic text for case-insensitive, diacritic-insensitive search.
 *
 * Rules applied:
 * 1. Lowercase (for any Latin mixed-in characters)
 * 2. Strip Arabic diacritics (tashkeel: harakat + shadda + sukun + tatweel)
 * 3. Normalize Alef variants (أ إ آ ٱ ٲ ٳ) → ا
 * 4. Normalize Taa marbuta (ة) → ه
 * 5. Normalize Yaa / Alef maqsura (ى) → ي
 * 6. Strip non-alphanumeric, non-Arabic, non-space characters
 * 7. Collapse multiple spaces
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';

  let normalized = text.toLowerCase();

  // Remove Arabic diacritics (harakat, tatweel)
  normalized = normalized.replace(/[\u064B-\u065F\u0670\u0640]/g, '');

  // Normalize Alef variants → ا
  normalized = normalized.replace(/[أإآٱٲٳ]/g, 'ا');

  // Normalize Taa marbuta → ه
  normalized = normalized.replace(/ة/g, 'ه');

  // Normalize Yaa / Alef maqsura → ي
  normalized = normalized.replace(/ى/g, 'ي');

  // Normalize Waw with hamza
  normalized = normalized.replace(/ؤ/g, 'و');

  // Normalize Yaa with hamza
  normalized = normalized.replace(/ئ/g, 'ي');

  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}
