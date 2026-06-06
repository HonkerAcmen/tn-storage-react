export type PasswordStrengthLevel = 'low' | 'medium' | 'high';

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  label: string;
  score: number;
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { level: 'low', label: '弱', score: 0 };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { level: 'low', label: '弱', score };
  }
  if (score <= 4) {
    return { level: 'medium', label: '中', score };
  }
  return { level: 'high', label: '强', score };
}
