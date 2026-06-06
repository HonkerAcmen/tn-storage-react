export type ResolvedTheme = 'light' | 'dark';
export type ThemeSetting = ResolvedTheme;

/** 设置页可选主题（不含跟随系统） */
export function normalizeThemeSetting(setting?: string | null): ThemeSetting {
  return setting === 'dark' ? 'dark' : 'light';
}

export function resolveTheme(setting?: string | null): ResolvedTheme {
  return setting === 'dark' ? 'dark' : 'light';
}

/** 将用户主题偏好写入 `data-theme`（始终为 light | dark） */
export function applyThemeSetting(setting?: string | null): ResolvedTheme {
  const resolved = resolveTheme(setting);
  document.documentElement.dataset.theme = resolved;
  return resolved;
}
