import { describe, expect, it } from 'vitest';
import {
  claimNextDownloadItem,
  countActiveDownloads,
  shouldStartAnotherDownloadWorker,
} from './download-queue.scheduler';

describe('download-queue.scheduler', () => {
  it('应统计进行中的下载数', () => {
    expect(
      countActiveDownloads([
        { id: '1', status: 'queued' },
        { id: '2', status: 'downloading' },
        { id: '3', status: 'downloading' },
      ]),
    ).toBe(2);
  });

  it('并发未满时应继续启动 worker', () => {
    expect(
      shouldStartAnotherDownloadWorker(
        [
          { id: '1', status: 'downloading' },
          { id: '2', status: 'queued' },
        ],
        2,
      ),
    ).toBe(true);
    expect(
      shouldStartAnotherDownloadWorker(
        [
          { id: '1', status: 'downloading' },
          { id: '2', status: 'downloading' },
          { id: '3', status: 'queued' },
        ],
        2,
      ),
    ).toBe(false);
  });

  it('应原子认领下一个 queued 项', () => {
    const { items, claimed } = claimNextDownloadItem([
      { id: '1', status: 'downloading' },
      { id: '2', status: 'queued' },
      { id: '3', status: 'queued' },
    ]);
    expect(claimed?.id).toBe('2');
    expect(items[1].status).toBe('downloading');
    expect(items[2].status).toBe('queued');
  });
});
