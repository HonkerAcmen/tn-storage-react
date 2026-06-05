import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/network/http', () => ({
  default: { post: vi.fn() },
}));

vi.mock('@/network/queryClient', () => ({
  queryClient: { invalidateQueries: vi.fn() },
}));

import http from '@/network/http';
import { queryClient } from '@/network/queryClient';
import { copyShareLinkForFile } from '@/features/files/services/fileOperations';

describe('copyShareLinkForFile', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockResolvedValue({
      data: { data: { token: 'abc-token' } },
    } as never);
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('创建分享并复制链接', async () => {
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:3000' },
    } as Window);

    const url = await copyShareLinkForFile({
      UUID: 'file-1',
      type: 'file',
    } as never);

    expect(url).toBe('http://localhost:3000/share/abc-token');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
    expect(queryClient.invalidateQueries).toHaveBeenCalled();
  });

  it('文件夹分享抛出错误', async () => {
    await expect(
      copyShareLinkForFile({ UUID: 'f', type: 'folder' } as never),
    ).rejects.toThrow('当前仅支持分享文件');
  });
});
