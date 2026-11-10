import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY, htaccess } from '../../deploy/headers.mjs';
import { satelliteSource, streetsStyle, terrainDemSource } from './tile-sources';

const origin = (url: string) => new URL(url.replace(/\{[a-z]\}/g, '0')).origin;

describe('live-site headers', () => {
  it('allows every default map source through the security policy', () => {
    const connect = CONTENT_SECURITY_POLICY.split('; ').find((rule) => rule.startsWith('connect-src'))!;
    for (const url of [streetsStyle({}).url, satelliteSource({}).url, terrainDemSource({}).url]) {
      expect(connect, url).toContain(origin(url));
    }
  });

  it('allows only the privacy-enhanced YouTube and Facebook video frames', () => {
    expect(CONTENT_SECURITY_POLICY).toContain('frame-src https://www.youtube-nocookie.com https://www.facebook.com');
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
  });

  it('serves the MapLibre worker as JavaScript and caches hashed files for a year', () => {
    const config = htaccess();
    expect(config).toContain('AddType text/javascript .js .mjs');
    expect(config).toContain('max-age=31536000, immutable');
    expect(config).toContain('Header always set Content-Security-Policy');
    expect(config).toContain('Options -Indexes');
  });
});
