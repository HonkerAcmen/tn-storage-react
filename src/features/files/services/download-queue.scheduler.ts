export type DownloadQueueItemState = {
  id: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed' | 'cancelled';
};

export function countActiveDownloads(items: DownloadQueueItemState[]): number {
  return items.filter((item) => item.status === 'downloading').length;
}

export function hasQueuedDownloads(items: DownloadQueueItemState[]): boolean {
  return items.some((item) => item.status === 'queued');
}

export function shouldStartAnotherDownloadWorker(
  items: DownloadQueueItemState[],
  maxConcurrency: number,
): boolean {
  const concurrency = Math.max(1, maxConcurrency);
  return (
    countActiveDownloads(items) < concurrency && hasQueuedDownloads(items)
  );
}

export function claimNextDownloadItem<T extends DownloadQueueItemState>(
  items: T[],
): { items: T[]; claimed: T | null } {
  const index = items.findIndex((item) => item.status === 'queued');
  if (index < 0) {
    return { items, claimed: null };
  }
  const claimed = items[index];
  const next = items.map((item, itemIndex) =>
    itemIndex === index
      ? { ...item, status: 'downloading' as T['status'] }
      : item,
  );
  return { items: next, claimed };
}
