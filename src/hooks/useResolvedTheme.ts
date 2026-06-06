import { useEffect, useState } from 'react';
import type { ResolvedTheme } from '@/utils/theme';

function readResolvedTheme(): ResolvedTheme {
  if (typeof document === 'undefined') {
    return 'light';
  }
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** 订阅 `document.documentElement[data-theme]` 变化 */
export function useResolvedTheme(): ResolvedTheme {
  const [theme, setTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    setTheme(readResolvedTheme());

    const observer = new MutationObserver(() => {
      setTheme(readResolvedTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
