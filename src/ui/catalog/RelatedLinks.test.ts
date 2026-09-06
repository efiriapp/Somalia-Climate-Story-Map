import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const relatedLinks = readFileSync(join(here, 'RelatedLinks.tsx'), 'utf8');
const relatedCard = readFileSync(join(here, 'RelatedClimateLink.tsx'), 'utf8');

describe('RelatedLinks', () => {
  it('renders related targets as image cards with a label, not plain text buttons alone', () => {
    expect(relatedLinks).toContain('imageForRelatedTarget');
    expect(relatedLinks).toContain('related-link-cards');
    expect(relatedLinks).toContain('RelatedClimateLink');
    expect(relatedCard).toContain('related-link-card');
    expect(relatedCard).toContain('<img');
    expect(relatedCard).toContain('image');
    expect(relatedCard).toContain('label');
    expect(relatedCard).toContain('onClick');
  });
});
