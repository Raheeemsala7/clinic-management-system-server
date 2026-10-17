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
