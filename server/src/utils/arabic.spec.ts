import { validateFourPartName } from './arabic';

describe('validateFourPartName (Server Arabic Utility)', () => {
  it('should accept valid four-part names in Arabic', () => {
    expect(validateFourPartName('أحمد محمد علي حسن')).toBe(true);
    expect(validateFourPartName('محمود عبد الرحمن إبراهيم خليل')).toBe(true);
  });

  it('should accept valid four-part names in English', () => {
    expect(validateFourPartName('Ahmed Mohamed Ali Hassan')).toBe(true);
    expect(validateFourPartName('John William Michael Smith')).toBe(true);
  });

  it('should accept valid five or more part names', () => {
    expect(validateFourPartName('أحمد محمد علي حسن عبد الله')).toBe(true);
    expect(validateFourPartName('One Two Three Four Five')).toBe(true);
  });

  it('should normalize leading, trailing, and multiple consecutive whitespace', () => {
    expect(validateFourPartName('   أحمد    محمد   علي    حسن   ')).toBe(true);
    expect(validateFourPartName('  Ahmed   Mohamed   Ali   Hassan  ')).toBe(true);
  });

  it('should reject three-part names', () => {
    expect(validateFourPartName('أحمد محمد علي')).toBe(false);
    expect(validateFourPartName('Ahmed Mohamed Ali')).toBe(false);
  });

  it('should reject two-part and single names', () => {
    expect(validateFourPartName('أحمد محمد')).toBe(false);
    expect(validateFourPartName('أحمد')).toBe(false);
    expect(validateFourPartName('Ahmed')).toBe(false);
  });

  it('should reject empty or whitespace-only strings', () => {
    expect(validateFourPartName('')).toBe(false);
    expect(validateFourPartName('   ')).toBe(false);
  });
});
