/**
 * Unit tests for prescription versioning logic.
 * Tests the pure versioning logic without database.
 */

interface PrescriptionVersion {
  id: string;
  versionNumber: number;
  supersedesId: string | null;
  notes: string | null;
}

function createNextVersion(existing: PrescriptionVersion[], notes: string): PrescriptionVersion {
  const latest = existing.reduce((max, p) => (p.versionNumber > max.versionNumber ? p : max), existing[0]);
  return {
    id: `v${existing.length + 1}`,
    versionNumber: latest.versionNumber + 1,
    supersedesId: latest.id,
    notes,
  };
}

describe('Prescription Versioning', () => {
  it('first prescription has version 1 and no supersedesId', () => {
    const versions: PrescriptionVersion[] = [
      { id: 'v1', versionNumber: 1, supersedesId: null, notes: 'Initial' },
    ];
    expect(versions[0].versionNumber).toBe(1);
    expect(versions[0].supersedesId).toBeNull();
  });

  it('editing creates a version 2 that points to version 1', () => {
    const versions: PrescriptionVersion[] = [
      { id: 'v1', versionNumber: 1, supersedesId: null, notes: 'Initial' },
    ];
    const v2 = createNextVersion(versions, 'Updated notes');
    expect(v2.versionNumber).toBe(2);
    expect(v2.supersedesId).toBe('v1');
  });

  it('version 1 is NOT modified when version 2 is created', () => {
    const versions: PrescriptionVersion[] = [
      { id: 'v1', versionNumber: 1, supersedesId: null, notes: 'Initial' },
    ];
    const original = { ...versions[0] };
    createNextVersion(versions, 'Updated');
    expect(versions[0]).toEqual(original); // v1 is untouched
  });

  it('version chain links correctly across multiple edits', () => {
    const versions: PrescriptionVersion[] = [
      { id: 'v1', versionNumber: 1, supersedesId: null, notes: 'Initial' },
    ];
    const v2 = createNextVersion(versions, 'Edit 1');
    versions.push(v2);
    const v3 = createNextVersion(versions, 'Edit 2');
    versions.push(v3);

    expect(v3.versionNumber).toBe(3);
    expect(v3.supersedesId).toBe('v2');
    expect(v2.supersedesId).toBe('v1');
    expect(versions[0].supersedesId).toBeNull();
  });

  it('three consecutive versions all have different IDs', () => {
    const versions: PrescriptionVersion[] = [
      { id: 'v1', versionNumber: 1, supersedesId: null, notes: 'v1' },
    ];
    const v2 = createNextVersion(versions, 'v2');
    versions.push(v2);
    const v3 = createNextVersion(versions, 'v3');
    versions.push(v3);

    const ids = versions.map((v) => v.id);
    expect(new Set(ids).size).toBe(3);
  });
});
