import { useEffect, useState } from 'react';
import type { WatchManifest } from '../application/flood-history';

/**
 * Loads the prepared map layers in public/data/watch (same origin, cached by
 * the browser). Each file is fetched once per visit and shared.
 */
const cache = new Map<string, Promise<unknown>>();

const load = (file: string): Promise<unknown> => {
  let request = cache.get(file);
  if (!request) {
    request = fetch(`${import.meta.env.BASE_URL}data/watch/${file}`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
    request.catch(() => cache.delete(file));
    cache.set(file, request);
  }
  return request;
};

export function useWatchFile<T>(file: string | null): { data: T | null; error: boolean } {
  const [state, setState] = useState<{ file: string | null; data: T | null; error: boolean }>({
    file: null,
    data: null,
    error: false,
  });
  useEffect(() => {
    if (!file) return;
    let alive = true;
    load(file)
      .then((data) => alive && setState({ file, data: data as T, error: false }))
      .catch(() => alive && setState({ file, data: null, error: true }));
    return () => {
      alive = false;
    };
  }, [file]);
  return state.file === file ? { data: state.data, error: state.error } : { data: null, error: false };
}

/** Loads several layer files; returns those ready so far, keyed by file name. */
export function useWatchFiles<T>(files: string[]): { ready: Record<string, T>; loading: boolean } {
  const key = files.join('|');
  const [ready, setReady] = useState<Record<string, T>>({});
  useEffect(() => {
    let alive = true;
    for (const file of files) {
      load(file)
        .then((data) => alive && setReady((prev) => (prev[file] ? prev : { ...prev, [file]: data as T })))
        .catch(() => undefined);
    }
    return () => {
      alive = false;
    };
    // `key` captures the file list.
  }, [key]);
  const subset = Object.fromEntries(files.filter((f) => ready[f]).map((f) => [f, ready[f]!]));
  return { ready: subset, loading: files.some((f) => !ready[f]) };
}

export const useWatchManifest = () => useWatchFile<WatchManifest>('index.json');
