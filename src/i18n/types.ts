export type AppLanguage = 'zh-CN' | 'en-US' | 'ja-JP';

export const DEFAULT_LANGUAGE: AppLanguage = 'zh-CN';

export const LANGUAGE_STORAGE_KEY = 'tn_app_language';

export function normalizeLanguage(value?: string | null): AppLanguage {
  if (value === 'en-US' || value === 'ja-JP') {
    return value;
  }
  return DEFAULT_LANGUAGE;
}
