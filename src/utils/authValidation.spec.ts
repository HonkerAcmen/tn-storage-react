import { describe, expect, it } from 'vitest';
import { validateUsername } from '@/utils/usernameRules';
import { getPasswordStrength } from '@/utils/passwordStrength';

describe('validateUsername', () => {
  it('接受合法昵称', () => {
    expect(validateUsername('user_01')).toBeNull();
    expect(validateUsername('A1')).toBeNull();
  });

  it('拒绝超长或非法字符', () => {
    expect(validateUsername('12345678901')).toContain('不能超过');
    expect(validateUsername('中文名')).toContain('英文');
  });
});

describe('getPasswordStrength', () => {
  it('空密码为弱', () => {
    expect(getPasswordStrength('').level).toBe('low');
  });

  it('简单密码为弱', () => {
    expect(getPasswordStrength('123456').level).toBe('low');
  });

  it('混合字符提升复杂度', () => {
    expect(getPasswordStrength('123456').level).toBe('low');
    expect(getPasswordStrength('Abc123!@').level).toBe('high');
    expect(getPasswordStrength('StrongPass123!').level).toBe('high');
  });
});
