// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LocaleProvider } from '../chrome/LocaleContext';
import { AreaPanel } from './AreaPanel';

afterEach(cleanup);

const panel = (rows: { id: string; name: string; ha: number; b?: number }[], compare?: { a: string; b: string }) =>
  render(
    <LocaleProvider locale="en" setLocale={() => undefined}>
      <AreaPanel title="Areas" level="state" onLevel={() => undefined} rows={rows} subtitle="" compare={compare} />
    </LocaleProvider>,
  );

const ranks = () => [...document.querySelectorAll('.flood-state-rank')].map((el) => el.textContent);
const names = () => [...document.querySelectorAll('.flood-state-name strong')].map((el) => el.textContent);

describe('AreaPanel ranking', () => {
  it('numbers the places by size, largest first', () => {
    panel([
      { id: 'a', name: 'Small', ha: 100 },
      { id: 'b', name: 'Big', ha: 900 },
      { id: 'c', name: 'Middle', ha: 500 },
    ]);
    expect(names()).toEqual(['Big', 'Middle', 'Small']);
    expect(ranks()).toEqual(['1', '2', '3']);
  });

  it('ranks two-bar rows (e.g. export and local) by their total', () => {
    panel(
      [
        { id: 'a', name: 'Export only', ha: 300, b: 0 },
        { id: 'b', name: 'Both', ha: 200, b: 200 },
      ],
      { a: 'Export', b: 'Local' },
    );
    expect(names()).toEqual(['Both', 'Export only']);
    expect(ranks()).toEqual(['1', '2']);
  });
});

describe('AreaPanel sections', () => {
  it('shows each section (e.g. export and local charcoal) as its own ranked list', () => {
    render(
      <LocaleProvider locale="en" setLocale={() => undefined}>
        <AreaPanel
          title="Charcoal"
          level="state"
          onLevel={() => undefined}
          subtitle=""
          sections={[
            { title: 'Export', color: '#b3261e', rows: [{ id: 'a', name: 'A', ha: 100 }, { id: 'b', name: 'B', ha: 900 }] },
            { title: 'Local', color: '#f07a6a', rows: [{ id: 'c', name: 'C', ha: 50 }] },
          ]}
        />
      </LocaleProvider>,
    );
    const sections = [...document.querySelectorAll('.area-section')];
    expect(sections.map((s) => s.querySelector('h4')?.textContent)).toEqual(['Export10 km²', 'Local0.5 km²']);
    const listed = (s: Element) =>
      [...s.querySelectorAll('li')].map((li) => `${li.querySelector('.flood-state-rank')?.textContent}. ${li.querySelector('strong')?.textContent}`);
    expect(listed(sections[0]!)).toEqual(['1. B', '2. A']);
    expect(listed(sections[1]!)).toEqual(['1. C']);
  });
});
