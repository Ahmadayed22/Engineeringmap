import { createContext, useContext } from 'react';
import { en, type MessageKey } from './strings';

export type Lang = 'ar' | 'en';

export type I18n = {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  /** BCP-47 locale for dates and numbers. */
  locale: string;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  tMaybe: (text: string | undefined) => string | undefined;
};

const fallback: I18n = {
  lang: 'en',
  dir: 'ltr',
  locale: 'en',
  setLang: () => {},
  toggle: () => {},
  t: (key, params) =>
    params
      ? en[key].replace(/\{(\w+)\}/g, (m, k) =>
          k in params ? String(params[k]) : m
        )
      : en[key],
  tMaybe: (text) => text,
};

export const I18nContext = createContext<I18n>(fallback);

/** Interface language, direction and the translate function. */
export const useI18n = () => useContext(I18nContext);
