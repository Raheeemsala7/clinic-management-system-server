import { normalizeArabic } from './arabic-normalize.util';

describe('normalizeArabic', () => {
  it('strips diacritics', () => {
    expect(normalizeArabic('مُحَمَّد')).toBe('محمد');
  });

  it('normalizes alef variants', () => {
    expect(normalizeArabic('أحمد')).toBe('احمد');
    expect(normalizeArabic('إبراهيم')).toBe('ابراهيم');
    expect(normalizeArabic('آية')).toBe('ايه');
  });

  it('normalizes taa marbuta to ha', () => {
    expect(normalizeArabic('فاطمة')).toBe('فاطمه');
  });

  it('normalizes alef maqsura to ya', () => {
    expect(normalizeArabic('مصطفى')).toBe('مصطفي');
  });

  it('handles empty string', () => {
    expect(normalizeArabic('')).toBe('');
  });

  it('handles mixed Arabic and Latin', () => {
    const result = normalizeArabic('Dr. أحمد');
    expect(result).toBe('dr. احمد');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeArabic('محمد   علي')).toBe('محمد علي');
  });
});
