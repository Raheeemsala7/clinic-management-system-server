import { Decimal } from 'decimal.js';

/**
 * Unit tests for daily closing calculation logic.
 * Pure arithmetic — no DB or DI required.
 */

function computeClosing(cashPayments: number, approvedExpenses: number, actualCash: number) {
  const expectedCash = new Decimal(cashPayments).minus(approvedExpenses);
  const difference = new Decimal(actualCash).minus(expectedCash);
  return { expectedCash, actualCash: new Decimal(actualCash), difference };
}

describe('Closing calculation', () => {
  it('positive difference (overage)', () => {
    const { expectedCash, difference } = computeClosing(1000, 200, 850);
    expect(expectedCash.toNumber()).toBe(800);
    expect(difference.toNumber()).toBe(50);
  });

  it('negative difference (shortage)', () => {
    const { expectedCash, difference } = computeClosing(1000, 200, 750);
    expect(expectedCash.toNumber()).toBe(800);
    expect(difference.toNumber()).toBe(-50);
  });

  it('zero difference (perfect match)', () => {
    const { expectedCash, difference } = computeClosing(500, 100, 400);
    expect(expectedCash.toNumber()).toBe(400);
    expect(difference.toNumber()).toBe(0);
  });

  it('zero payments and zero expenses', () => {
    const { expectedCash, difference } = computeClosing(0, 0, 0);
    expect(expectedCash.toNumber()).toBe(0);
    expect(difference.toNumber()).toBe(0);
  });

  it('handles decimal amounts correctly', () => {
    const { expectedCash, difference } = computeClosing(1500.75, 200.25, 1300.50);
    expect(expectedCash.toNumber()).toBe(1300.50);
    expect(difference.toNumber()).toBe(0);
  });
});
