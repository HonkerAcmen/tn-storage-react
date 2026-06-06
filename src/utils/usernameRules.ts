export const USERNAME_MAX_LENGTH = 10;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export const USERNAME_HINT =
  '昵称只能由英文、数字和下划线组成，不能超过10个字符';

export function validateUsername(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return '请输入昵称';
  }
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return '昵称不能超过10个字符';
  }
  if (!USERNAME_PATTERN.test(trimmed)) {
    return '昵称只能由英文、数字和下划线组成';
  }
  return null;
}

export function usernameFormRule() {
  return {
    validator(_: unknown, value: string) {
      const message = validateUsername(value ?? '');
      if (message) {
        return Promise.reject(new Error(message));
      }
      return Promise.resolve();
    },
  };
}
