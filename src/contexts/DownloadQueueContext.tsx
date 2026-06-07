import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchFileBlob } from '@/features/files/services/fileOperations';
import { createDownloadRateLimiter } from '@/features/files/services/download-rate-limiter';
import {
  claimNextDownloadItem,
  shouldStartAnotherDownloadWorker,
} from '@/features/files/services/download-queue.scheduler';
import {
  clampDownloadConcurrency,
  clampDownloadRateLimitKbps,
  DEFAULT_DOWNLOAD_CONCURRENCY,
  DEFAULT_DOWNLOAD_RATE_LIMIT_KBPS,
} from '@/features/files/services/download-settings';
import { useGetMySettings } from '@/network/hooks/user';
import { FileSystemTreeNode } from '@/network/types/Response/file';

export type DownloadItemStatus =
  | 'queued'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface DownloadQueueItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: DownloadItemStatus;
  error?: string;
  speed?: number;
}

interface DownloadQueueContextValue {
  items: DownloadQueueItem[];
  activeCount: number;
  enqueueDownloads: (files: FileSystemTreeNode[]) => void;
  cancelItem: (id: string) => void;
  clearCompleted: () => void;
}

const DownloadQueueContext = createContext<DownloadQueueContextValue | null>(
  null,
);

function createId() {
  return `dl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function DownloadQueueProvider({ children }: { children: ReactNode }) {
  const { data: settingsResponse } = useGetMySettings();
  const settings = settingsResponse?.data?.data;

  const [items, setItems] = useState<DownloadQueueItem[]>([]);
  const itemsRef = useRef<DownloadQueueItem[]>([]);
  const filesRef = useRef<Map<string, FileSystemTreeNode>>(new Map());
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const activeWorkersRef = useRef(0);
  const concurrencyRef = useRef(DEFAULT_DOWNLOAD_CONCURRENCY);
  const rateLimiterRef = useRef(
    createDownloadRateLimiter(DEFAULT_DOWNLOAD_RATE_LIMIT_KBPS),
  );
  const speedTrackRef = useRef(
    new Map<string, { loadedBytes: number; startedAt: number; lastTickAt: number }>(),
  );

  useEffect(() => {
    concurrencyRef.current = clampDownloadConcurrency(
      settings?.download_concurrency ?? DEFAULT_DOWNLOAD_CONCURRENCY,
    );
    const nextLimit = clampDownloadRateLimitKbps(
      settings?.download_rate_limit_kbps ?? DEFAULT_DOWNLOAD_RATE_LIMIT_KBPS,
    );
    rateLimiterRef.current.setLimit(nextLimit);
  }, [settings?.download_concurrency, settings?.download_rate_limit_kbps]);

  const updateItems = useCallback(
    (updater: (prev: DownloadQueueItem[]) => DownloadQueueItem[]) => {
      setItems((prev) => {
        const next = updater(prev);
        itemsRef.current = next;
        return next;
      });
    },
    [],
  );

  const pumpQueue = useCallback(() => {
    while (
      shouldStartAnotherDownloadWorker(
        itemsRef.current,
        concurrencyRef.current,
      )
    ) {
      const claimedResult = claimNextDownloadItem(itemsRef.current);
      if (!claimedResult.claimed) {
        break;
      }

      itemsRef.current = claimedResult.items;
      setItems(claimedResult.items);

      const nextItem = claimedResult.claimed;
      const file = filesRef.current.get(nextItem.id);
      if (!file) {
        continue;
      }

      activeWorkersRef.current += 1;
      const controller = new AbortController();
      controllersRef.current.set(nextItem.id, controller);
      speedTrackRef.current.set(nextItem.id, {
        loadedBytes: 0,
        startedAt: Date.now(),
        lastTickAt: Date.now(),
      });

      void (async () => {
        try {
          const { blob, filename } = await fetchFileBlob(file, {
            signal: controller.signal,
            throttle: (bytes) => rateLimiterRef.current.throttle(bytes),
            onProgress: (progress, loadedBytes) => {
              const tracker = speedTrackRef.current.get(nextItem.id);
              let speed = 0;
              if (tracker) {
                tracker.loadedBytes = loadedBytes;
                const elapsedSec = Math.max(
                  (Date.now() - tracker.startedAt) / 1000,
                  0.001,
                );
                speed = Math.round(tracker.loadedBytes / elapsedSec);
              }
              updateItems((prev) =>
                prev.map((item) =>
                  item.id === nextItem.id
                    ? { ...item, progress, speed, error: undefined }
                    : item,
                ),
              );
            },
          });

          triggerBrowserDownload(blob, filename);
          updateItems((prev) =>
            prev.map((item) =>
              item.id === nextItem.id
                ? { ...item, status: 'completed', progress: 100 }
                : item,
            ),
          );
          filesRef.current.delete(nextItem.id);
        } catch (error) {
          const aborted =
            controller.signal.aborted ||
            (error as { name?: string }).name === 'AbortError' ||
            (error as { code?: string }).code === 'ERR_CANCELED';
          if (aborted) {
            updateItems((prev) =>
              prev.map((item) =>
                item.id === nextItem.id
                  ? { ...item, status: 'cancelled', progress: 0, speed: 0 }
                  : item,
              ),
            );
          } else {
            const err = error as { message?: string };
            updateItems((prev) =>
              prev.map((item) =>
                item.id === nextItem.id
                  ? {
                      ...item,
                      status: 'failed',
                      error: err.message || '下载失败',
                      speed: 0,
                    }
                  : item,
              ),
            );
          }
          filesRef.current.delete(nextItem.id);
        } finally {
          controllersRef.current.delete(nextItem.id);
          speedTrackRef.current.delete(nextItem.id);
          activeWorkersRef.current = Math.max(0, activeWorkersRef.current - 1);
          pumpQueue();
        }
      })();
    }
  }, [updateItems]);

  const enqueueDownloads = useCallback(
    (files: FileSystemTreeNode[]) => {
      const downloadable = files.filter((file) => file.type === 'file');
      if (downloadable.length === 0) {
        return;
      }

      const newItems: DownloadQueueItem[] = downloadable.map((file) => {
        const id = createId();
        filesRef.current.set(id, file);
        return {
          id,
          fileName: file.filename,
          fileSize: Number(file.size) || 0,
          progress: 0,
          status: 'queued',
        };
      });

      updateItems((prev) => {
        const next = [...prev, ...newItems];
        itemsRef.current = next;
        return next;
      });
      pumpQueue();
    },
    [pumpQueue, updateItems],
  );

  const cancelItem = useCallback(
    (id: string) => {
      controllersRef.current.get(id)?.abort();
      controllersRef.current.delete(id);
      filesRef.current.delete(id);
      speedTrackRef.current.delete(id);
      updateItems((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'cancelled' as DownloadItemStatus,
                progress: 0,
                speed: 0,
              }
            : item,
        );
        itemsRef.current = next;
        return next;
      });
    },
    [updateItems],
  );

  const clearCompleted = useCallback(() => {
    updateItems((prev) => {
      const next = prev.filter(
        (item) => item.status !== 'completed' && item.status !== 'cancelled',
      );
      itemsRef.current = next;
      return next;
    });
  }, [updateItems]);

  const value = useMemo<DownloadQueueContextValue>(
    () => ({
      items,
      activeCount: items.filter(
        (item) => item.status === 'queued' || item.status === 'downloading',
      ).length,
      enqueueDownloads,
      cancelItem,
      clearCompleted,
    }),
    [items, enqueueDownloads, cancelItem, clearCompleted],
  );

  return (
    <DownloadQueueContext.Provider value={value}>
      {children}
    </DownloadQueueContext.Provider>
  );
}

export function useDownloadQueue() {
  const context = useContext(DownloadQueueContext);
  if (!context) {
    throw new Error('useDownloadQueue must be used within DownloadQueueProvider');
  }
  return context;
}
