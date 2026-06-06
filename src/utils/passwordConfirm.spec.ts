import { describe, expect, it } from 'vitest';
import { validatePasswordConfirm } from '@/utils/passwordConfirm';

describe('validatePasswordConfirm', () => {
  it('空确认密码提示再次输入', () => {
    expect(validatePasswordConfirm('Abc123456', '')).toBe('请再次输入新密码');
    expect(validatePasswordConfirm('Abc123456', '   ')).toBe('请再次输入新密码');
  });

  it('两次不一致返回固定文案', () => {
    expect(validatePasswordConfirm('Abc123456', 'Abc123457')).toBe(
      '两次密码不相同',
    );
  });

  it('一致时通过', () => {
    expect(validatePasswordConfirm('Abc123456', 'Abc123456')).toBeNull();
  });
});
