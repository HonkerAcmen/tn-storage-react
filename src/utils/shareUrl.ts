/** 可粘贴到新标签页打开的分享页地址（需登录后自动下载） */
export function buildSharePageUrl(token: string): string {
  if (typeof window === 'undefined') {
    return `/share/${token}`;
  }
  return `${window.location.origin}/share/${encodeURIComponent(token)}`;
}
