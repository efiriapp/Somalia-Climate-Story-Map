import { useEffect, useState } from 'react';

/**
 * Loads JSON from Open-Meteo. Responses are kept for 30 minutes per URL so
 * moving between pages does not spend the free tier's call allowance
 * (10,000 calls a day per visitor IP, non-commercial use).
 */
const TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string };

export function useOpenMeteo<T>(url: string | null): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>(() => {
    const hit = url ? cache.get(url) : undefined;
    return hit && Date.now() - hit.at < TTL_MS ? { status: 'ready', data: hit.data as T } : { status: 'loading' };
  });

  useEffect(() => {
    if (!url) return;
    const hit = cache.get(url);
    if (hit && Date.now() - hit.at < TTL_MS) {
      setState({ status: 'ready', data: hit.data as T });
      return;
    }
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 429 ? 'rate-limited' : `HTTP ${res.status}`);
        }
        return res.json() as Promise<T>;
      })
      .then((data) => {
        cache.set(url, { at: Date.now(), data });
        setState({ status: 'ready', data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => controller.abort();
  }, [url]);

  return state;
}

/** Today's date in Somalia (UTC+3), as YYYY-MM-DD. */
export const somaliaToday = (now: Date = new Date()): string =>
  new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
