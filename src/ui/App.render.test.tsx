// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CHROME } from '../application/locale';
import { stories } from '../content/stories';
import App from './App';

/**
 * Behaviour tests: render the real app and drive it like a visitor, checking
 * what appears on screen and in the address bar rather than source text.
 */
const setHash = (hash: string) => {
  window.history.replaceState(null, '', `/${hash}`);
};

const goBack = async () => {
  await act(async () => {
    window.history.back();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
};

beforeEach(() => {
  window.localStorage.clear();
  setHash('');
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterEach(cleanup);

const nav = () => screen.getByRole('navigation', { name: 'Primary' });
const navButton = (label: string) =>
  [...nav().querySelectorAll('button')].find((button) => button.textContent === label)!;

describe('App routing', () => {
  it('opens on the Stories catalog and writes a canonical address', () => {
    render(<App />);
    expect(window.location.hash).toBe('#/en/stories');
    expect(screen.getByRole('heading', { name: CHROME.en.latestStories })).toBeTruthy();
  });

  it('puts the chosen page in the address and supports Back', async () => {
    render(<App />);
    await act(async () => {
      fireEvent.click(navButton(CHROME.en.about));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(window.location.hash).toBe('#/en/about');
    expect(screen.getByRole('heading', { level: 1, name: CHROME.en.about })).toBeTruthy();

    await goBack();
    expect(window.location.hash).toBe('#/en/stories');
    expect(screen.getByRole('heading', { name: CHROME.en.latestStories })).toBeTruthy();
  });

  it('opens a shared Climate Impact hazard link directly', () => {
    setHash('#/en/climate-impact/floods');
    render(<App />);
    expect(navButton(CHROME.en.climateImpact).className).toBe('active');
    expect(document.title).toContain(CHROME.en.platform);
  });

  it('opens a shared story link and titles the tab with the story', async () => {
    const story = stories.find((item) => item.type === 'ice-story')!;
    setHash(`#/en/stories/${story.id}`);
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: story.title }, { timeout: 5000 })).toBeTruthy();
    expect(document.title).toBe(`${story.title} | ${CHROME.en.platform}`);
  });
});

describe('App language', () => {
  it('switches to Arabic right-to-left, keeps the page, and remembers the choice', async () => {
    setHash('#/en/about');
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: CHROME.en.languageArabic }));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(window.location.hash).toBe('#/ar/about');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(window.localStorage.getItem('ice-story-map:locale')).toBe('ar');
  });

  it('uses the remembered language when the address has none', () => {
    window.localStorage.setItem('ice-story-map:locale', 'so');
    render(<App />);
    expect(window.location.hash).toBe('#/so/stories');
    expect(navButton(CHROME.so.stories)).toBeTruthy();
  });
});

describe('App catalog search', () => {
  it('filters story cards as the visitor types', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(CHROME.en.searchPlaceholder);
    const before = document.querySelectorAll('.story-card').length;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'zzzz-no-such-story' } });
    });
    const after = document.querySelectorAll('.story-card').length;
    expect(before).toBeGreaterThan(0);
    expect(after).toBe(0);
    expect(document.querySelector('.empty')).toBeTruthy();
  });
});
