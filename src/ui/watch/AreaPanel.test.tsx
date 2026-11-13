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
