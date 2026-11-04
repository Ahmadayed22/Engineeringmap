import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ar, en, type MessageKey } from './strings';
import { I18nContext, type Lang } from './context';
import { setServerMessageLang } from './serverMessages';

const STORAGE_KEY = 'engmap.lang';
const dictionaries: Record<Lang, Record<MessageKey, string>> = { en, ar };

const readLang = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ar') return saved;
  } catch {
    // storage unavailable: use the default
  }
  // Most students use the site in Arabic.
  return 'ar';
};

export const format = (
  template: string,
  params?: Record<string, string | number>
) =>
  params
    ? template.replace(/\{(\w+)\}/g, (m, k) =>
        k in params ? String(params[k]) : m
      )
    : template;

/** Holds the interface language and keeps <html lang dir> in sync (RTL for Arabic). */
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(readLang);
  setServerMessageLang(lang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore: the choice just won't be remembered
    }
  }, []);

  const value = useMemo(() => {
    const dict = dictionaries[lang];
    const t = (key: MessageKey, params?: Record<string, string | number>) =>
      format(dict[key] ?? en[key] ?? key, params);
    /** Translates strings that may be message keys (e.g. zod error messages); others pass through. */
    const tMaybe = (text: string | undefined) =>
      text && text in dict ? t(text as MessageKey) : text;
    return {
      lang,
      dir: dir as 'rtl' | 'ltr',
      locale: lang === 'ar' ? 'ar' : 'en',
      setLang,
      toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      t,
      tMaybe,
    };
  }, [lang, dir, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
