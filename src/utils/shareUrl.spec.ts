import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { buildSharePageUrl } from '@/utils/shareUrl';

describe('buildSharePageUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('浏览器环境生成完整分享页 URL', () => {
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:3000' },
    } as Window);

    expect(buildSharePageUrl('abc-123')).toBe(
      'http://localhost:3000/share/abc-123',
    );
  });

  it('无 window 时返回相对路径', () => {
    vi.stubGlobal('window', undefined);

    expect(buildSharePageUrl('token/x')).toBe('/share/token/x');
  });
});
