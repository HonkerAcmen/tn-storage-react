import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/network/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

import http from '@/network/http';
import { downloadSharedFileByToken } from '@/features/share/downloadSharedFile';

describe('downloadSharedFileByToken', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockResolvedValue({
      data: new Blob(['hello'], { type: 'application/pdf' }),
      headers: {
        'content-disposition': "attachment; filename*=UTF-8''demo.pdf",
        'content-type': 'application/pdf',
      },
      status: 200,
      statusText: 'OK',
      config: {},
    } as never);

    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:mock'),
    });
    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    const link = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(link as never);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => link as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('带登录态请求分享下载并触发浏览器保存', async () => {
    const filename = await downloadSharedFileByToken('share-token-xyz');

    expect(http.get).toHaveBeenCalledWith('/file/share/download/share-token-xyz', {
      responseType: 'blob',
    });
    expect(filename).toBe('demo.pdf');
  });
});
