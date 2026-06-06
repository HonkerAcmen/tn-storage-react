import http from '@/network/http';
import { UPLOAD_REQUEST_TIMEOUT_MS } from '@/network/uploadTimeout';
import {
  initMultipartUploadPath,
  uploadChunkPath,
} from '@/network/resPath';
import {
  InitMultipartUploadApiResponse,
  MultipartUploadInitResponse,
  UploadChunkApiResponse,
} from '@/network/types/Response/file';
import { cancelUploadTask } from './uploadApi';
import { computeFileMd5 } from './fileHash';
import { normalizeUploadFilename } from './uploadFilename';

/** 默认 3MB；可通过 NEXT_PUBLIC_UPLOAD_CHUNK_SIZE 与后端 MAX_CHUNK_SIZE 对齐 */
export const DEFAULT_CHUNK_SIZE =
  Number(process.env.NEXT_PUBLIC_UPLOAD_CHUNK_SIZE) > 0
    ? Number(process.env.NEXT_PUBLIC_UPLOAD_CHUNK_SIZE)
    : 3 * 1024 * 1024;

export class UploadCancelledError extends Error {
  constructor() {
    super('上传已取消');
    this.name = 'UploadCancelledError';
  }
}

export type UploadProgressPhase = 'hashing' | 'uploading';

export interface UploadProgressSnapshot {
  fileName: string;
  fileIndex: number;
  fileProgress: number;
  totalProgress: number;
  uploadedBytes: number;
  totalBytes: number;
  speed: number;
  taskId?: string;
  phase?: UploadProgressPhase;
  isInstant?: boolean;
}

interface UploadFilesInChunksParams {
  bucket: string;
  parentid: number;
  files: File[];
  chunkSize?: number;
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgressSnapshot) => void;
  /** 续传：与 files 一一对应，有 taskId 则跳过 init */
  resumeTasks?: Array<{
    taskId: string;
    receivedChunkIndexes: number[];
  } | null>;
}

interface MultipartInitPayload {
  filename: string;
  mimetype: string;
  size: number;
  totalChunks: number;
  md5: string;
}

export interface UploadFileResult {
  taskId: string;
  isInstant: boolean;
}

function isInstantInitResponse(
  result?: MultipartUploadInitResponse | null,
): boolean {
  if (!result) {
    return false;
  }
  return (
    result.mode === 'instant' ||
    Boolean(result.instantMode) ||
    (result as { instant?: boolean }).instant === true
  );
}

interface UploadSingleFileParams {
  bucket: string;
  parentid: number;
  file: File;
  fileIndex: number;
  chunkSize: number;
  totalBytes: number;
  uploadedBytesBefore: number;
  signal?: AbortSignal;
  taskId?: string;
  receivedChunkIndexes?: number[];
  onProgress?: (progress: UploadProgressSnapshot) => void;
  speedTracker: { lastTime: number; lastBytes: number; speed: number };
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new UploadCancelledError();
  }
}

function updateSpeed(
  tracker: { lastTime: number; lastBytes: number; speed: number },
  uploadedBytes: number,
) {
  const now = Date.now();
  const elapsed = (now - tracker.lastTime) / 1000;
  if (elapsed >= 0.5) {
    tracker.speed = Math.max(
      0,
      (uploadedBytes - tracker.lastBytes) / elapsed,
    );
    tracker.lastTime = now;
    tracker.lastBytes = uploadedBytes;
  }
  return tracker.speed;
}

async function initMultipartUpload(
  bucket: string,
  parentid: number,
  payload: MultipartInitPayload,
  signal?: AbortSignal,
) {
  const res = await http.post<InitMultipartUploadApiResponse>(
    `${initMultipartUploadPath}/${bucket}/${parentid}`,
    payload,
    { signal },
  );
  return res.data.data;
}

async function uploadChunk(params: {
  taskId: string;
  file: File;
  chunk: Blob;
  chunkIndex: number;
  signal?: AbortSignal;
  onProgress?: (loadedBytes: number) => void;
}) {
  const formData = new FormData();
  formData.append('chunk', params.chunk, params.file.name);

  return http.post<UploadChunkApiResponse>(
    `${uploadChunkPath}/${params.taskId}/${params.chunkIndex}`,
    formData,
    {
      timeout: UPLOAD_REQUEST_TIMEOUT_MS,
      signal: params.signal,
      onUploadProgress: (event) => {
        params.onProgress?.(event.loaded ?? 0);
      },
    },
  );
}

async function uploadSingleFileInChunks({
  bucket,
  parentid,
  file,
  fileIndex,
  chunkSize,
  totalBytes,
  uploadedBytesBefore,
  signal,
  taskId: existingTaskId,
  receivedChunkIndexes = [],
  onProgress,
  speedTracker,
}: UploadSingleFileParams): Promise<UploadFileResult> {
  const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
  const receivedSet = new Set(receivedChunkIndexes);
  let taskId = existingTaskId;

  if (!taskId) {
    const md5 = await computeFileMd5(file, (hashProgress) => {
      onProgress?.({
        fileName: file.name,
        fileIndex,
        fileProgress: Math.round(hashProgress * 0.1),
        totalProgress:
          totalBytes === 0
            ? 100
            : Math.round(
                ((uploadedBytesBefore + file.size * (hashProgress / 100) * 0.1) /
                  totalBytes) *
                  100,
              ),
        uploadedBytes: uploadedBytesBefore,
        totalBytes,
        speed: 0,
        phase: 'hashing',
      });
    });

    const initPayload: MultipartInitPayload = {
      filename: normalizeUploadFilename(file.name),
      mimetype: file.type || 'application/octet-stream',
      size: file.size,
      totalChunks,
      md5,
    };
    const initResult = await initMultipartUpload(
      bucket,
      parentid,
      initPayload,
      signal,
    );

    if (isInstantInitResponse(initResult)) {
      onProgress?.({
        fileName: file.name,
        fileIndex,
        fileProgress: 100,
        totalProgress:
          totalBytes === 0
            ? 100
            : Math.round(((uploadedBytesBefore + file.size) / totalBytes) * 100),
        uploadedBytes: uploadedBytesBefore + file.size,
        totalBytes,
        speed: 0,
        isInstant: true,
      });
      return {
        taskId: initResult!.UUID,
        isInstant: true,
      };
    }

    taskId = initResult!.taskId!;
    onProgress?.({
      fileName: file.name,
      fileIndex,
      fileProgress: 10,
      totalProgress:
        totalBytes === 0
          ? 100
          : Math.round(
              ((uploadedBytesBefore + file.size * 0.1) / totalBytes) * 100,
            ),
      uploadedBytes: uploadedBytesBefore,
      totalBytes,
      speed: speedTracker.speed,
      taskId,
      phase: 'uploading',
    });
  }

  let uploadedBytesForCurrentFile = 0;
  for (const index of receivedSet) {
    const start = (index - 1) * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    uploadedBytesForCurrentFile += end - start;
  }

  for (let chunkIndex = 1; chunkIndex <= totalChunks; chunkIndex++) {
    assertNotAborted(signal);
    if (receivedSet.has(chunkIndex)) {
      continue;
    }

    const start = (chunkIndex - 1) * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const currentChunkSize = end - start;

    await uploadChunk({
      taskId: taskId!,
      file,
      chunk,
      chunkIndex,
      signal,
      onProgress: (loadedBytes) => {
        const safeLoadedBytes = Math.min(loadedBytes, currentChunkSize);
        const currentUploadedBytes =
          uploadedBytesBefore +
          uploadedBytesForCurrentFile +
          safeLoadedBytes;
        const speed = updateSpeed(speedTracker, currentUploadedBytes);

        onProgress?.({
          fileName: file.name,
          fileIndex,
          fileProgress:
            file.size === 0
              ? 100
              : Math.round(
                  ((uploadedBytesForCurrentFile + safeLoadedBytes) /
                    file.size) *
                    100,
                ),
          totalProgress:
            totalBytes === 0
              ? 100
              : Math.round((currentUploadedBytes / totalBytes) * 100),
          uploadedBytes: currentUploadedBytes,
          totalBytes,
          speed,
          taskId,
          phase: 'uploading',
        });
      },
    });

    uploadedBytesForCurrentFile += currentChunkSize;
    const currentUploadedBytes = uploadedBytesBefore + uploadedBytesForCurrentFile;
    const speed = updateSpeed(speedTracker, currentUploadedBytes);
    receivedSet.add(chunkIndex);
    onProgress?.({
      fileName: file.name,
      fileIndex,
      fileProgress:
        file.size === 0
          ? 100
          : Math.round((uploadedBytesForCurrentFile / file.size) * 100),
      totalProgress:
        totalBytes === 0
          ? 100
          : Math.round((currentUploadedBytes / totalBytes) * 100),
      uploadedBytes: currentUploadedBytes,
      totalBytes,
      speed,
      taskId,
      phase: 'uploading',
    });
  }

  return {
    taskId: taskId!,
    isInstant: false,
  };
}

export async function uploadFilesInChunks({
  bucket,
  parentid,
  files,
  chunkSize = DEFAULT_CHUNK_SIZE,
  signal,
  onProgress,
  resumeTasks,
}: UploadFilesInChunksParams): Promise<UploadFileResult[]> {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  let uploadedBytes = 0;
  const speedTracker = {
    lastTime: Date.now(),
    lastBytes: 0,
    speed: 0,
  };
  const results: UploadFileResult[] = [];

  for (const [fileIndex, file] of files.entries()) {
    assertNotAborted(signal);
    const resume = resumeTasks?.[fileIndex];
    const result = await uploadSingleFileInChunks({
      bucket,
      parentid,
      file,
      fileIndex,
      chunkSize,
      totalBytes,
      uploadedBytesBefore: uploadedBytes,
      signal,
      taskId: resume?.taskId,
      receivedChunkIndexes: resume?.receivedChunkIndexes,
      onProgress,
      speedTracker,
    });
    results.push(result);
    uploadedBytes += file.size;
  }

  return results;
}

export async function cancelServerUploadTask(taskId?: string) {
  if (!taskId) {
    return;
  }
  try {
    await cancelUploadTask(taskId);
  } catch {
    // 任务可能已结束或超时，忽略
  }
}
