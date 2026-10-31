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
import axios from 'axios';
import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import {
  UploadCancelledError,
  cancelServerUploadTask,
  uploadFilesInChunks,
  type UploadProgressPhase,
} from '@/features/files/services/chunkUpload';
import {
  fetchUploadTasks,
} from '@/features/files/services/uploadApi';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { useAuthed } from '@/utils/auth';

const STORAGE_KEY = 'tn_upload_queue_v1';

export type UploadItemStatus =
  | 'queued'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'interrupted';

export interface UploadQueueItem {
  id: string;
  taskId?: string;
  fileName: string;
  fileSize: number;
  parentId: number;
  bucket: string;
  progress: number;
  speed: number;
  status: UploadItemStatus;
  phase?: UploadProgressPhase;
  isInstant?: boolean;
  receivedChunkIndexes: number[];
  error?: string;
}

interface PersistedUploadItem {
  id: string;
  taskId?: string;
  fileName: string;
  fileSize: number;
  parentId: number;
  bucket: string;
  progress: number;
  status: UploadItemStatus;
  receivedChunkIndexes: number[];
}

interface UploadQueueContextValue {
  items: UploadQueueItem[];
  activeCount: number;
  enqueueFiles: (files: File[], parentId: number, bucket?: string) => void;
  resumeItem: (id: string, file: File) => void;
  cancelItem: (id: string) => Promise<void>;
  clearCompleted: () => void;
}

const UploadQueueContext = createContext<UploadQueueContextValue | null>(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadPersistedItems(): PersistedUploadItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as PersistedUploadItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePersistedItems(items: UploadQueueItem[]) {
  if (typeof window === 'undefined') {
    return;
  }
  const persistable: PersistedUploadItem[] = items
    .filter((item) => item.status !== 'completed' && item.status !== 'cancelled')
    .map((item) => ({
      id: item.id,
      taskId: item.taskId,
      fileName: item.fileName,
      fileSize: item.fileSize,
      parentId: item.parentId,
      bucket: item.bucket,
      progress: item.progress,
      status: item.status === 'uploading' ? 'interrupted' : item.status,
      receivedChunkIndexes: item.receivedChunkIndexes,
    }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
}

export function UploadQueueProvider({ children }: { children: ReactNode }) {
  const authed = useAuthed();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const itemsRef = useRef<UploadQueueItem[]>([]);
  const filesRef = useRef<Map<string, File>>(new Map());
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const processingRef = useRef(false);
  const hydratedRef = useRef(false);

  const updateItems = useCallback((updater: (prev: UploadQueueItem[]) => UploadQueueItem[]) => {
    setItems((prev) => {
      const next = updater(prev);
      itemsRef.current = next;
      savePersistedItems(next);
      return next;
    });
  }, []);

  const refreshFileQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['file', 'data', 'tree'] });
    await queryClient.invalidateQueries({ queryKey: ['file', 'recent'] });
    await queryClient.refetchQueries({
      queryKey: ['file', 'data', 'tree'],
      type: 'active',
    });
    await queryClient.refetchQueries({
      queryKey: ['file', 'recent'],
      type: 'active',
    });
  }, [queryClient]);

  const processQueue = useCallback(async () => {
    if (processingRef.current) {
      return;
    }
    processingRef.current = true;

    try {
      while (true) {
        const nextItem = itemsRef.current.find(
          (item) =>
            item.status === 'queued' &&
            filesRef.current.has(item.id),
        );
        if (!nextItem) {
          break;
        }

        const file = filesRef.current.get(nextItem.id);
        if (!file) {
          break;
        }

        const controller = new AbortController();
        controllersRef.current.set(nextItem.id, controller);

        const isResume = Boolean(nextItem.taskId);
        updateItems((prev) =>
          prev.map((item) =>
            item.id === nextItem.id
              ? {
                  ...item,
                  status: 'uploading',
                  phase: isResume ? 'uploading' : 'hashing',
                  error: undefined,
                  isInstant: false,
                }
              : item,
          ),
        );

        try {
          const uploadResults = await uploadFilesInChunks({
            bucket: nextItem.bucket,
            parentid: nextItem.parentId,
            files: [file],
            signal: controller.signal,
            resumeTasks: nextItem.taskId
              ? [
                  {
                    taskId: nextItem.taskId,
                    receivedChunkIndexes: nextItem.receivedChunkIndexes,
                  },
                ]
              : undefined,
            onProgress: ({ fileProgress, speed, taskId, phase, isInstant }) => {
              updateItems((prev) =>
                prev.map((item) =>
                  item.id === nextItem.id
                    ? {
                        ...item,
                        progress: fileProgress,
                        speed,
                        taskId: taskId ?? item.taskId,
                        phase: phase ?? item.phase,
                        isInstant: isInstant === true ? true : item.isInstant,
                      }
                    : item,
                ),
              );
            },
          });

          const isInstant = uploadResults[0]?.isInstant === true;
          updateItems((prev) =>
            prev.map((item) =>
              item.id === nextItem.id
                ? {
                    ...item,
                    status: 'completed',
                    progress: 100,
                    speed: 0,
                    phase: undefined,
                    isInstant,
                  }
                : item,
            ),
          );
          if (isInstant) {
            message.success(`${nextItem.fileName} 秒传成功`);
          }
          filesRef.current.delete(nextItem.id);
          controllersRef.current.delete(nextItem.id);
          await refreshFileQueries();
        } catch (error) {
          const isCancelled =
            error instanceof UploadCancelledError ||
            axios.isCancel(error) ||
            (error as { code?: string }).code === 'ERR_CANCELED';
          if (isCancelled) {
            updateItems((prev) =>
              prev.map((item) =>
                item.id === nextItem.id
                  ? {
                      ...item,
                      status: 'cancelled',
                      speed: 0,
                    }
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
                      speed: 0,
                      error: err.message || '上传失败',
                    }
                  : item,
              ),
            );
          }
          filesRef.current.delete(nextItem.id);
          controllersRef.current.delete(nextItem.id);
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, [refreshFileQueries, updateItems]);

  const enqueueFiles = useCallback(
    (files: File[], parentId: number, bucket = DEFAULT_BUCKET) => {
      const newItems: UploadQueueItem[] = files.map((file) => ({
        id: createId(),
        fileName: file.name,
        fileSize: file.size,
        parentId,
        bucket,
        progress: 0,
        speed: 0,
        status: 'queued',
        receivedChunkIndexes: [],
      }));

      newItems.forEach((item, index) => {
        filesRef.current.set(item.id, files[index]);
      });

      updateItems((prev) => [...prev, ...newItems]);
      void processQueue();
    },
    [processQueue, updateItems],
  );

  const resumeItem = useCallback(
    (id: string, file: File) => {
      const target = itemsRef.current.find((item) => item.id === id);
      if (!target) {
        return;
      }
      if (
        file.name !== target.fileName ||
        file.size !== target.fileSize
      ) {
        return;
      }
      filesRef.current.set(id, file);
      updateItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'queued', error: undefined }
            : item,
        ),
      );
      void processQueue();
    },
    [processQueue, updateItems],
  );

  const cancelItem = useCallback(
    async (id: string) => {
      const target = itemsRef.current.find((item) => item.id === id);
      const controller = controllersRef.current.get(id);
      controller?.abort();
      await cancelServerUploadTask(target?.taskId);
      filesRef.current.delete(id);
      controllersRef.current.delete(id);
      updateItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'cancelled', speed: 0 }
            : item,
        ),
      );
    },
    [updateItems],
  );

  const clearCompleted = useCallback(() => {
    updateItems((prev) =>
      prev.filter(
        (item) =>
          item.status !== 'completed' && item.status !== 'cancelled',
      ),
    );
  }, [updateItems]);

  useEffect(() => {
    if (!authed || hydratedRef.current) {
      return;
    }
    hydratedRef.current = true;

    const restore = async () => {
      const persisted = loadPersistedItems();
      let serverTasks: Awaited<ReturnType<typeof fetchUploadTasks>> = [];
      try {
        serverTasks = await fetchUploadTasks();
      } catch {
        serverTasks = [];
      }

      const restored: UploadQueueItem[] = [];
      const seenTaskIds = new Set<string>();

      for (const task of serverTasks) {
        seenTaskIds.add(task.taskId);
        const matched = persisted.find((item) => item.taskId === task.taskId);
        restored.push({
          id: matched?.id ?? createId(),
          taskId: task.taskId,
          fileName: task.filename ?? matched?.fileName ?? '未知文件',
          fileSize: task.size ?? matched?.fileSize ?? 0,
          parentId: task.parentId ?? matched?.parentId ?? 0,
          bucket: task.bucket ?? matched?.bucket ?? DEFAULT_BUCKET,
          progress: task.size
            ? Math.round((task.uploadedFiles / task.fileNum) * 100)
            : matched?.progress ?? 0,
          speed: 0,
          status: 'interrupted',
          receivedChunkIndexes: task.receivedChunkIndexes ?? [],
        });
      }

      for (const item of persisted) {
        if (item.taskId && seenTaskIds.has(item.taskId)) {
          continue;
        }
        if (item.status === 'completed' || item.status === 'cancelled') {
          continue;
        }
        restored.push({
          id: item.id,
          taskId: item.taskId,
          fileName: item.fileName,
          fileSize: item.fileSize,
          parentId: item.parentId,
          bucket: item.bucket,
          progress: item.progress,
          speed: 0,
          status: item.status === 'uploading' ? 'interrupted' : item.status,
          receivedChunkIndexes: item.receivedChunkIndexes,
        });
      }

      if (restored.length > 0) {
        itemsRef.current = restored;
        setItems(restored);
        savePersistedItems(restored);
      }
    };

    void restore();
  }, [authed]);

  useEffect(() => {
    if (!authed) {
      hydratedRef.current = false;
      itemsRef.current = [];
      setItems([]);
      filesRef.current.clear();
      controllersRef.current.forEach((controller) => controller.abort());
      controllersRef.current.clear();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [authed]);

  const value = useMemo<UploadQueueContextValue>(
    () => ({
      items,
      activeCount: items.filter(
        (item) =>
          item.status === 'queued' ||
          item.status === 'uploading' ||
          item.status === 'interrupted',
      ).length,
      enqueueFiles,
      resumeItem,
      cancelItem,
      clearCompleted,
    }),
    [items, enqueueFiles, resumeItem, cancelItem, clearCompleted],
  );

  return (
    <UploadQueueContext.Provider value={value}>
      {children}
    </UploadQueueContext.Provider>
  );
}

export function useUploadQueue() {
  const context = useContext(UploadQueueContext);
  if (!context) {
    throw new Error('useUploadQueue must be used within UploadQueueProvider');
  }
  return context;
}
