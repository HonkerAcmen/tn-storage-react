import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import zhCN from 'antd/locale/zh_CN';
import type { Locale } from 'antd/es/locale';
import { useGetMySettings } from '@/network/hooks/user';
import { translate } from '@/i18n/translate';
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
} from '@/i18n/types';
import type { MessageKey } from '@/i18n/messages';

const antdLocales: Record<AppLanguage, Locale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
};

type LocaleContextValue = {
  language: AppLanguage;
  antdLocale: Locale;
  setLanguage: (language: AppLanguage) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLanguage(): AppLanguage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

function persistLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export function LocaleProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const { data } = useGetMySettings();
  const settingsLanguage = enabled ? data?.data?.data?.language : undefined;
  const [overrideLanguage, setOverrideLanguage] = useState<AppLanguage | null>(
    null,
  );

  const language = useMemo(() => {
    if (overrideLanguage) {
      return overrideLanguage;
    }
    if (enabled && settingsLanguage) {
      return normalizeLanguage(settingsLanguage);
    }
    return readStoredLanguage() ?? DEFAULT_LANGUAGE;
  }, [enabled, overrideLanguage, settingsLanguage]);

  useEffect(() => {
    if (enabled && settingsLanguage) {
      setOverrideLanguage(null);
    }
  }, [enabled, settingsLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
    persistLanguage(language);
  }, [language]);

  const setLanguage = useCallback((next: AppLanguage) => {
    setOverrideLanguage(normalizeLanguage(next));
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      antdLocale: antdLocales[language],
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

/** 未登录页等无 Provider 时的兜底 */
export function useOptionalLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    const language = readStoredLanguage() ?? DEFAULT_LANGUAGE;
    return {
      language,
      antdLocale: antdLocales[language],
      setLanguage: (next: AppLanguage) => persistLanguage(normalizeLanguage(next)),
      t: (key: MessageKey, params?: Record<string, string | number>) =>
        translate(language, key, params),
    };
  }
  return context;
}

export function formatDateTimeByLanguage(
  value: Date | string,
  language: AppLanguage,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString(language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
