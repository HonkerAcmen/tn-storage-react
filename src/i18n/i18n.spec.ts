import { describe, expect, it } from 'vitest';
import { translate } from '@/i18n/translate';
import { normalizeLanguage } from '@/i18n/types';

describe('i18n', () => {
  it('normalizeLanguage 仅接受三种语言', () => {
    expect(normalizeLanguage('en-US')).toBe('en-US');
    expect(normalizeLanguage('ja-JP')).toBe('ja-JP');
    expect(normalizeLanguage('fr-FR')).toBe('zh-CN');
    expect(normalizeLanguage(undefined)).toBe('zh-CN');
  });

  it('translate 支持英文与日语', () => {
    expect(translate('zh-CN', 'nav.myCloud')).toBe('我的云');
    expect(translate('en-US', 'nav.myCloud')).toBe('My Cloud');
    expect(translate('ja-JP', 'nav.myCloud')).toBe('マイクラウド');
  });

  it('translate 支持参数替换', () => {
    expect(
      translate('en-US', 'settings.permissions.my.desc', { role: 'User' }),
    ).toContain('User');
  });
});
