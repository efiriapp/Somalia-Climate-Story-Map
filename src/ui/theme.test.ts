import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const themePath = join(dirname(fileURLToPath(import.meta.url)), 'theme.css');

describe('ICE green brand', () => {
  it('uses forest green and never IOM blue', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toContain('#063D39');
    expect(css).toContain('#4CAF7D');
    expect(css).not.toMatch(/#003399|#0047AB|#0A3161|#1B4F9C|#0033cc/i);
  });

  it('keeps the airplane marker above country pins', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.tour-plane[\s\S]{0,220}z-index:\s*[2-9][0-9]\s*!important/);
  });

  it('places continent visit cards below the ICE calendar', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.tour-right-stack[\s\S]{0,80}right:\s*1rem/);
    expect(css).toMatch(/\.tour-right-stack[\s\S]{0,140}top:\s*50%/);
    expect(css).toMatch(/\.tour-right-stack[\s\S]{0,180}translateY\(-50%\)/);
    expect(css).toContain('.event-slider');
    expect(css).toContain('.event-card');
    expect(css).toContain('.event-card-close');
    expect(css).toMatch(/\.event-slider[\s\S]{0,120}background:\s*(transparent|#fff|#ffffff|var\(--white\))/);
    expect(css).toMatch(/\.event-card img[\s\S]{0,80}height:\s*2[0-4][0-9]px/);
    expect(css).toContain('.continent-board');
    expect(css).toContain('.continent-table');
    expect(css).toContain('.tour-filter-slide');
    expect(css).toContain('.continent-summary-cards');
    expect(css).toContain('.continent-summary-card');
    expect(css).toContain('.continent-summary-card.total');
  });

  it('places the ICE calendar in the top-right corner', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.date-reel[\s\S]{0,280}#063D39/);
    expect(css).toMatch(/\.tour-title[\s\S]{0,140}left:\s*50%/);
    expect(css).toMatch(/\.tour-title[\s\S]{0,280}background:\s*(#063D39|var\(--forest\))/);
    expect(css).toMatch(/\.tour-play-bar[\s\S]{0,140}border-radius:\s*999px/);
    expect(css).toMatch(/\.tour-play-bar \.play[\s\S]{0,180}border-radius:\s*50%/);
  });

  it('keeps the simple globe title, back button, and event jump controls', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.tour-title[\s\S]{0,140}left:\s*50%/);
    expect(css).toMatch(/\.tour-title[\s\S]{0,280}background:\s*(#063D39|var\(--forest\))/);
    expect(css).toContain('.tour-back.simple');
    expect(css).toContain('.tour-event-nav');
    expect(css).toContain('.tour-right-stack');
    expect(css).toMatch(/\.maplibregl-popup-content img[\s\S]{0,80}max-height:\s*[4-8][0-9]px/);
  });

  it('keeps Global Stage calendar text fully white', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.date-reel-kicker[\s\S]{0,140}color:\s*(#fff|#ffffff|var\(--white\))/i);
    expect(css).toMatch(/\.date-reel-label[\s\S]{0,180}color:\s*(#fff|#ffffff|var\(--white\))/i);
    expect(css).toMatch(/\.date-reel-item[\s\S]{0,200}color:\s*(#fff|#ffffff|var\(--white\))/i);
  });

  it('makes calendar title, dates, and labels large and bold', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.date-reel-kicker[\s\S]{0,160}font-size:\s*1[2-9]px/);
    expect(css).toMatch(/\.date-reel-kicker[\s\S]{0,180}font-weight:\s*(800|900)/);
    expect(css).toMatch(/\.date-reel-label[\s\S]{0,200}font-size:\s*1[1-9]px/);
    expect(css).toMatch(/\.date-reel-label[\s\S]{0,220}font-weight:\s*(800|900)/);
    expect(css).toMatch(/\.date-reel-item[\s\S]{0,220}font-size:\s*1\.45rem/);
    expect(css).toMatch(/\.date-reel-item[\s\S]{0,240}font-weight:\s*900/);
  });

  it('keeps the centered tour popup fully visible', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.tour-popup-card[\s\S]{0,120}left:\s*50%/);
    expect(css).toMatch(/\.tour-popup-card[\s\S]{0,140}top:\s*50%/);
    expect(css).toMatch(/\.tour-popup-card[\s\S]{0,180}translate\(-50%,\s*-50%/);
    expect(css).toContain('.tour-popup-close');
    expect(css).toContain('.date-reel-nav');
  });

  it('makes the platform logos large and the title bold white on forest green', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.topbar[\s\S]{0,220}background:\s*(#063D39|var\(--forest\))/);
    expect(css).toMatch(/\.topbar-logo[\s\S]{0,80}height:\s*(8[0-9]|9[0-9]|1[0-4][0-9])px/);
    expect(css).toMatch(/\.topbar-title[\s\S]{0,160}color:\s*(#fff|#ffffff|var\(--white\))/i);
    expect(css).toMatch(/\.topbar-title[\s\S]{0,180}font-weight:\s*900/);
    expect(css).toMatch(/\.topbar-title[\s\S]{0,240}font-size:\s*clamp\(/);
    expect(css).toMatch(/\.topbar[\s\S]{0,80}container-type:\s*inline-size/);
  });

  it('styles the standard site footer in forest green', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.site-footer[\s\S]{0,160}background:\s*(#063D39|var\(--forest\))/);
    expect(css).toContain('.site-footer-comment');
    expect(css).not.toContain('.global-stage .site-footer');
  });

  it('makes the SIMAD region tour full-screen with a pin marker on district names', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.region-map-tour-screen[\s\S]{0,280}height:\s*100vh/);
    expect(css).toMatch(/\.story-detail[\s\S]{0,80}overflow-anchor:\s*none/);
    expect(css).toMatch(/\.story-map-bleed[\s\S]{0,120}overflow-anchor:\s*none/);
    expect(css).toContain('.region-pin-marker');
    expect(css).toContain('.modern-pin');
    expect(css).toContain('.region-pin-popup');
    expect(css).toContain('.district-pin-label');
    expect(css).toMatch(/\.district-pin-label\.is-active[\s\S]{0,160}#C62828/);
    expect(css).not.toContain('.district-pin-marker');
    expect(css).not.toContain('.district-pin-icon');
    expect(css).not.toContain('region-slide-in');
  });

  it('styles the ICE story source card at the end of each story', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toContain('.story-source');
    expect(css).toMatch(/\.story-source[\s\S]{0,160}background:\s*(var\(--chip\)|#e8f5ee)/);
    expect(css).toContain('.media-source');
  });

  it('makes ICE story videos 3rem wider on each side', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.story-video[\s\S]{0,120}width:\s*calc\(100% \+ 6rem\)/);
    expect(css).toMatch(/\.story-video[\s\S]{0,180}max-width:\s*calc\(720px \+ 6rem\)/);
    expect(css).toMatch(/\.story-video[\s\S]{0,220}aspect-ratio:\s*16\s*\/\s*9/);
    expect(css).toMatch(/\.story-video[\s\S]{0,280}margin:\s*4\.5rem auto 1\.2rem/);
    expect(css).not.toMatch(/\.story-video[\s\S]{0,80}width:\s*100vw/);
    expect(css).toMatch(/\.story-video iframe[\s\S]{0,160}height:\s*100%/);
    expect(css).toMatch(/\.story-video \+ \.media-source/);
  });

  it('pins the Somali language toggle to the right of the primary nav', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.nav-language[\s\S]{0,80}margin-left:\s*auto/);
    expect(css).toContain('.nav-language-label');
    expect(css).toContain('.nav-language-track');
    expect(css).toContain('.nav-language-thumb');
    expect(css).toContain('.nav-language-flag');
    expect(css).toMatch(/\.nav-language[\s\S]{0,400}border-radius:\s*999px|\.nav-language-track[\s\S]{0,200}border-radius:\s*999px/);
    expect(css).toMatch(/\.nav-language\.is-so[\s\S]{0,280}\.nav-language-thumb|\.nav-language\.is-so[\s\S]{0,280}translate/);
    expect(css).toContain('.visually-hidden');
  });

  it('styles the Climate Impact hazard cards', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toContain('.climate-impact-grid');
    expect(css).toContain('.climate-impact-card');
    expect(css).toMatch(/\.climate-impact-card[\s\S]{0,220}background:\s*var\(--white\)/);
  });

  it('styles related see-also targets as compact image cards', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toContain('.related-link-cards');
    expect(css).toContain('.related-link-card');
    expect(css).toMatch(/\.related-link-cards[\s\S]{0,220}display:\s*grid/);
    expect(css).toMatch(/\.related-link-card[\s\S]{0,220}background:\s*var\(--white\)/);
    expect(css).toMatch(/\.related-link-card img[\s\S]{0,160}object-fit:\s*cover/);
    expect(css).toMatch(/\.related-link-card[\s\S]{0,280}(var\(--forest\)|#063D39)/);
  });

  it('lets three Climate Impact hub cards fill the screen with large photos', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.climate-impact-hub[\s\S]{0,120}max-width:\s*min\(1180px/);
    expect(css).toMatch(/\.climate-impact-grid[\s\S]{0,160}repeat\(3,\s*1fr\)/);
    expect(css).toMatch(/\.climate-impact-card img[\s\S]{0,120}height:\s*2[6-9][0-9]px/);
  });

  it('spreads Climate Impact photos as full-width or small rows, not one packed top gallery', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toContain('.story-spread');
    expect(css).toContain('.story-spread-first');
    expect(css).toContain('.story-spread-middle');
    expect(css).toContain('.story-spread-end');
    expect(css).toMatch(/\.story-spread-first[\s\S]{0,220}grid-template-columns:\s*1fr/);
    expect(css).toMatch(/\.story-spread-single[\s\S]{0,180}grid-template-columns:\s*1fr/);
    expect(css).toMatch(/\.story-spread img[\s\S]{0,120}object-fit:\s*cover/);
  });

  it('places a date label above the Global Stage pin without replacing the marker', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toContain('.pin-date-label');
    expect(css).toContain('.pin-flag-icon');
    expect(css).toMatch(/\.pin-date-label[\s\S]{0,220}bottom:\s*100%/);
    expect(css).toMatch(/\.pin-date-label[\s\S]{0,280}pointer-events:\s*none/);
    expect(css).toMatch(/\.pin-date-label[\s\S]{0,220}inline-flex/);
    expect(css).toContain('.ice-office-label');
    expect(css).toMatch(/\.ice-office-label[\s\S]{0,220}bottom:\s*100%/);
    expect(css).toContain('.ice-office-logo');
  });
});
