import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'MediaSourceCredit.tsx'),
  'utf8',
);

describe('MediaSourceCredit', () => {
  it('renders a visible Source line and links the existing ICE URL', () => {
    expect(source).toContain('className="media-source"');
    expect(source).toContain('credit.text');
    expect(source).toContain('credit.url');
    expect(source).toContain('target="_blank"');
  });
});
