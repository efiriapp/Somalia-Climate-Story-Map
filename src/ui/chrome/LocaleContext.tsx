import { createContext, useContext, type ReactNode } from 'react';
import { CHROME, type Locale } from '../../application/locale';

type LocaleContextValue = {
  locale: Locale;
  copy: (typeof CHROME)[Locale];
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  setLocale,
  children,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, copy: CHROME[locale], setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error('useLocale requires LocaleProvider');
  }
  return value;
}
