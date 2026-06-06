import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchFileBlob } from '@/features/files/services/fileOperations';
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
  const [items, setItems] = useState<DownloadQueueItem[]>([]);
  const itemsRef = useRef<DownloadQueueItem[]>([]);
  const filesRef = useRef<Map<string, FileSystemTreeNode>>(new Map());
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const processingRef = useRef(false);

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

  const processQueue = useCallback(async () => {
    if (processingRef.current) {
      return;
    }
    processingRef.current = true;

    try {
      while (true) {
        const nextItem = itemsRef.current.find((item) => item.status === 'queued');
        if (!nextItem) {
          break;
        }

        const file = filesRef.current.get(nextItem.id);
        if (!file) {
          break;
        }

        const controller = new AbortController();
        controllersRef.current.set(nextItem.id, controller);

        updateItems((prev) =>
          prev.map((item) =>
            item.id === nextItem.id
              ? { ...item, status: 'downloading', progress: 0, error: undefined }
              : item,
          ),
        );

        try {
          const { blob, filename } = await fetchFileBlob(
            file,
            (progress) => {
              updateItems((prev) =>
                prev.map((item) =>
                  item.id === nextItem.id ? { ...item, progress } : item,
                ),
              );
            },
            controller.signal,
          );

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
                  ? { ...item, status: 'cancelled', progress: 0 }
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
                    }
                  : item,
              ),
            );
          }
          filesRef.current.delete(nextItem.id);
        }

        controllersRef.current.delete(nextItem.id);
      }
    } finally {
      processingRef.current = false;
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

      updateItems((prev) => [...prev, ...newItems]);
      void processQueue();
    },
    [processQueue, updateItems],
  );

  const cancelItem = useCallback(
    (id: string) => {
      controllersRef.current.get(id)?.abort();
      controllersRef.current.delete(id);
      filesRef.current.delete(id);
      updateItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'cancelled', progress: 0 } : item,
        ),
      );
    },
    [updateItems],
  );

  const clearCompleted = useCallback(() => {
    updateItems((prev) =>
      prev.filter(
        (item) => item.status !== 'completed' && item.status !== 'cancelled',
      ),
    );
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
