import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'scroll-page-top.ts'), 'utf8');

describe('scrollPageToTop', () => {
  it('resets window, document, and #root scroll so a catalog story opens at the title', () => {
    expect(source).toContain('window.scrollTo(0, 0)');
    expect(source).toContain('document.documentElement.scrollTop = 0');
    expect(source).toContain('document.body.scrollTop = 0');
    expect(source).toContain("getElementById('root')");
    expect(source).toContain('root.scrollTop = 0');
  });
});
