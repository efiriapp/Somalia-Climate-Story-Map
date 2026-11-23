import { useCallback, useEffect, useState } from 'react';
import {
  formatRoute,
  parseRoute,
  readStoredLocale,
  storeLocale,
  type Route,
} from '../application/route';

const currentRoute = (): Route => parseRoute(window.location.hash, readStoredLocale() ?? 'en');

/**
 * Keeps the visible page in the URL hash so pages can be shared, bookmarked
 * and reached with the browser Back and Forward buttons. Hash URLs work on
 * any static host without server rewrite rules.
 */
export function useHashRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    // Read the address now, not the route captured at first render, in case
    // it changed in between.
    const latest = currentRoute();
    const canonical = formatRoute(latest);
    if (window.location.hash !== canonical) {
      window.history.replaceState(null, '', canonical);
    }
    setRoute(latest);
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
    // Normalise the address once on load; later changes go through navigate.
  }, []);

  useEffect(() => {
    storeLocale(route.locale);
  }, [route.locale]);

  const navigate = useCallback((next: Route) => {
    const hash = formatRoute(next);
    if (window.location.hash === hash) return;
    // Assigning the hash adds a history entry; the hashchange listener updates state.
    window.location.hash = hash;
  }, []);

  return [route, navigate];
}
