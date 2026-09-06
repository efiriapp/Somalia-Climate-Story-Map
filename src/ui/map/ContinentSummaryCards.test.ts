import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'ContinentSummaryCards.tsx'),
  'utf8',
);

describe('ContinentSummaryCards', () => {
  it('shows a Total visit count inside the continent cards', () => {
    expect(source).toContain('continent-summary-card total');
    expect(source).toContain('{copy.total}');
    expect(source).toContain('{total}');
    expect(source).not.toContain('Total travel');
    expect(source).not.toContain(' km');
  });
});
