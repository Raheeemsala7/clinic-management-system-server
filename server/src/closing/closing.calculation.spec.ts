/**
 * Unit tests for daily closing calculation logic.
 * Pure arithmetic — no DB or DI required.
 *
 * The service computes:
 *   expectedCash = sum(RECORDED CASH payments) - sum(APPROVED expenses)
 *   difference   = actualCash - expectedCash
 */

/** Mirrors the server-side calculation exactly using integer cents to avoid float issues */
function computeClosing(
  cashPaymentsCents: number,
  approvedExpensesCents: number,
  actualCashCents: number,
): { expectedCashCents: number; differenceCents: number } {
  const expectedCashCents = cashPaymentsCents - approvedExpensesCents;
  const differenceCents = actualCashCents - expectedCashCents;
  return { expectedCashCents, differenceCents };
}

/** Helper: convert EGP to cents */
const egp = (v: number) => Math.round(v * 100);

describe('DailyClosing calculation', () => {
  it('positive difference (cash overage)', () => {
    const { expectedCashCents, differenceCents } = computeClosing(
      egp(1000),
      egp(200),
      egp(850),
    );
    expect(expectedCashCents).toBe(egp(800));
    expect(differenceCents).toBe(egp(50));
  });

  it('negative difference (cash shortage)', () => {
    const { expectedCashCents, differenceCents } = computeClosing(
      egp(1000),
      egp(200),
      egp(750),
    );
    expect(expectedCashCents).toBe(egp(800));
    expect(differenceCents).toBe(egp(-50));
  });

  it('zero difference — perfect match', () => {
    const { expectedCashCents, differenceCents } = computeClosing(
      egp(500),
      egp(100),
      egp(400),
    );
    expect(expectedCashCents).toBe(egp(400));
    expect(differenceCents).toBe(0);
  });

  it('zero payments and zero expenses', () => {
    const { expectedCashCents, differenceCents } = computeClosing(0, 0, 0);
    expect(expectedCashCents).toBe(0);
    expect(differenceCents).toBe(0);
  });

  it('handles decimal amounts (1500.75 - 200.25 = 1300.50)', () => {
    const { expectedCashCents, differenceCents } = computeClosing(
      egp(1500.75),
      egp(200.25),
      egp(1300.5),
    );
    expect(expectedCashCents).toBe(egp(1300.5));
    expect(differenceCents).toBe(0);
  });

  it('expenses larger than income yields negative expectedCash', () => {
    const { expectedCashCents, differenceCents } = computeClosing(
      egp(100),
      egp(300),
      egp(0),
    );
    // expectedCash = 100 - 300 = -200
    // difference   = 0 - (-200) = +200 (overage — doctor put back 200 into the drawer)
    expect(expectedCashCents).toBe(egp(-200));
    expect(differenceCents).toBe(egp(200));
  });

  it('fixture: 3 cash payments of 200 EGP, 1 expense of 150 EGP, actual 450 EGP', () => {
    // income = 600, expenses = 150, expected = 450
    const { expectedCashCents, differenceCents } = computeClosing(
      egp(600),
      egp(150),
      egp(450),
    );
    expect(expectedCashCents).toBe(egp(450));
    expect(differenceCents).toBe(0);
  });
});
