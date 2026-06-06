import { messages, type MessageKey } from './messages';
import { AppLanguage, DEFAULT_LANGUAGE } from './types';

export function translate(
  language: AppLanguage,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const catalog = messages[language] ?? messages[DEFAULT_LANGUAGE];
  let text = catalog[key] ?? messages[DEFAULT_LANGUAGE][key] ?? key;

  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }

  return text;
}
