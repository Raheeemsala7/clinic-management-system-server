import { validateFourPartName } from './arabic';

describe('validateFourPartName (Server Arabic Utility)', () => {
  it('should accept valid four-part names in Arabic', () => {
    const res1 = validateFourPartName('أحمد محمد علي حسن');
    expect(res1.isValid).toBe(true);
    expect(res1.partsCount).toBe(4);
    expect(res1.normalized).toBe('أحمد محمد علي حسن');

    const res2 = validateFourPartName('محمود عبد الرحمن إبراهيم خليل');
    expect(res2.isValid).toBe(true);
    expect(res2.partsCount).toBe(5);
  });

  it('should accept valid four-part names in English', () => {
    const res1 = validateFourPartName('Ahmed Mohamed Ali Hassan');
    expect(res1.isValid).toBe(true);
    expect(res1.partsCount).toBe(4);

    const res2 = validateFourPartName('John William Michael Smith');
    expect(res2.isValid).toBe(true);
    expect(res2.partsCount).toBe(4);
  });

  it('should accept valid five or more part names', () => {
    const res = validateFourPartName('أحمد محمد علي حسن عبد الله');
    expect(res.isValid).toBe(true);
    expect(res.partsCount).toBe(6);
  });

  it('should normalize leading, trailing, and multiple consecutive whitespace', () => {
    const res = validateFourPartName('   أحمد    محمد   علي    حسن   ');
    expect(res.isValid).toBe(true);
    expect(res.partsCount).toBe(4);
    expect(res.normalized).toBe('أحمد محمد علي حسن');
  });

  it('should reject three-part names', () => {
    const res = validateFourPartName('أحمد محمد علي');
    expect(res.isValid).toBe(false);
    expect(res.partsCount).toBe(3);
  });

  it('should reject two-part and single names', () => {
    expect(validateFourPartName('أحمد محمد').isValid).toBe(false);
    expect(validateFourPartName('أحمد').isValid).toBe(false);
    expect(validateFourPartName('Ahmed').isValid).toBe(false);
  });

  it('should reject empty or whitespace-only strings', () => {
    expect(validateFourPartName('').isValid).toBe(false);
    expect(validateFourPartName('   ').isValid).toBe(false);
  });
});
