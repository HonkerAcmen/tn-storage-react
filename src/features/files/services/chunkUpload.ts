import http from '@/network/http';
import {
  initMultipartUploadPath,
  uploadChunkPath,
} from '@/network/resPath';
import {
  InitMultipartUploadApiResponse,
  UploadChunkApiResponse,
} from '@/network/types/Response/file';

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

interface UploadFilesInChunksParams {
  bucket: string;
  parentid: number;
  files: File[];
  chunkSize?: number;
  onProgress?: (progress: {
    fileName: string;
    fileIndex: number;
    fileProgress: number;
    totalProgress: number;
    uploadedBytes: number;
    totalBytes: number;
  }) => void;
}

interface MultipartInitPayload {
  filename: string;
  mimetype: string;
  size: number;
  totalChunks: number;
}

async function initMultipartUpload(
  bucket: string,
  parentid: number,
  payload: MultipartInitPayload
) {
  const res = await http.post<InitMultipartUploadApiResponse>(
    `${initMultipartUploadPath}/${bucket}/${parentid}`,
    payload
  );
  return res.data.data;
}

async function uploadChunk(params: {
  taskId: string;
  file: File;
  chunk: Blob;
  chunkIndex: number;
  onProgress?: (loadedBytes: number) => void;
}) {
  const formData = new FormData();
  formData.append('chunk', params.chunk, params.file.name);

  return http.post<UploadChunkApiResponse>(
    `${uploadChunkPath}/${params.taskId}/${params.chunkIndex}`,
    formData,
    {
      onUploadProgress: (event) => {
        params.onProgress?.(event.loaded ?? 0);
      },
    }
  );
}

export async function uploadFilesInChunks({
  bucket,
  parentid,
  files,
  chunkSize = DEFAULT_CHUNK_SIZE,
  onProgress,
}: UploadFilesInChunksParams) {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  let uploadedBytes = 0;

  for (const [fileIndex, file] of files.entries()) {
    const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
    const initPayload: MultipartInitPayload = {
      filename: file.name,
      mimetype: file.type || 'application/octet-stream',
      size: file.size,
      totalChunks,
    };

    const initResult = await initMultipartUpload(bucket, parentid, initPayload);
    let uploadedBytesForCurrentFile = 0;

    for (let chunkIndex = 1; chunkIndex <= totalChunks; chunkIndex++) {
      const start = (chunkIndex - 1) * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const currentChunkSize = end - start;

      await uploadChunk({
        taskId: initResult.taskId,
        file,
        chunk,
        chunkIndex,
        onProgress: (loadedBytes) => {
          const safeLoadedBytes = Math.min(loadedBytes, currentChunkSize);
          const currentUploadedBytes =
            uploadedBytes + uploadedBytesForCurrentFile + safeLoadedBytes;

          onProgress?.({
            fileName: file.name,
            fileIndex,
            fileProgress:
              file.size === 0
                ? 100
                : Math.round(
                    ((uploadedBytesForCurrentFile + safeLoadedBytes) /
                      file.size) *
                      100
                  ),
            totalProgress:
              totalBytes === 0
                ? 100
                : Math.round((currentUploadedBytes / totalBytes) * 100),
            uploadedBytes: currentUploadedBytes,
            totalBytes,
          });
        },
      });

      uploadedBytesForCurrentFile += currentChunkSize;
      onProgress?.({
        fileName: file.name,
        fileIndex,
        fileProgress: 100,
        totalProgress:
          totalBytes === 0
            ? 100
            : Math.round(
                ((uploadedBytes + uploadedBytesForCurrentFile) / totalBytes) *
                  100
              ),
        uploadedBytes: uploadedBytes + uploadedBytesForCurrentFile,
        totalBytes,
      });
    }

    uploadedBytes += file.size;
  }
}
