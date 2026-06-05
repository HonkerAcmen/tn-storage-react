import http from '@/network/http';
import {
  InitAvatarUploadApiResponse,
  UploadAvatarChunkApiResponse,
} from '@/network/types/Response/user';

/** 头像默认 512KB/片（小于网关 4MB 限制，小文件通常 1 片） */
const DEFAULT_AVATAR_CHUNK_SIZE =
  Number(process.env.NEXT_PUBLIC_AVATAR_CHUNK_SIZE) > 0
    ? Number(process.env.NEXT_PUBLIC_AVATAR_CHUNK_SIZE)
    : 512 * 1024;

interface UploadAvatarInChunksParams {
  file: File;
  chunkSize?: number;
  onProgress?: (progress: number) => void;
}

async function initAvatarUpload(payload: {
  filename: string;
  mimetype: string;
  size: number;
  totalChunks: number;
}) {
  const res = await http.post<InitAvatarUploadApiResponse>(
    '/user/avatar/upload/init/me',
    payload
  );
  return res.data.data;
}

async function uploadAvatarChunk(params: {
  taskId: string;
  file: File;
  chunk: Blob;
  chunkIndex: number;
  onProgress?: (loadedBytes: number) => void;
}) {
  const formData = new FormData();
  formData.append('chunk', params.chunk, params.file.name);

  return http.post<UploadAvatarChunkApiResponse>(
    `/user/avatar/upload/chunk/${params.taskId}/${params.chunkIndex}`,
    formData,
    {
      onUploadProgress: (event) => {
        params.onProgress?.(event.loaded ?? 0);
      },
    }
  );
}

export async function uploadAvatarInChunks({
  file,
  chunkSize = DEFAULT_AVATAR_CHUNK_SIZE,
  onProgress,
}: UploadAvatarInChunksParams) {
  const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
  const init = await initAvatarUpload({
    filename: file.name,
    mimetype: file.type || 'application/octet-stream',
    size: file.size,
    totalChunks,
  });

  let uploadedBytes = 0;

  for (let chunkIndex = 1; chunkIndex <= totalChunks; chunkIndex++) {
    const start = (chunkIndex - 1) * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const currentChunkSize = end - start;

    await uploadAvatarChunk({
      taskId: init.taskId,
      file,
      chunk,
      chunkIndex,
      onProgress: (loaded) => {
        const safeLoaded = Math.min(loaded, currentChunkSize);
        const total = uploadedBytes + safeLoaded;
        onProgress?.(
          file.size === 0 ? 100 : Math.round((total / file.size) * 100)
        );
      },
    });

    uploadedBytes += currentChunkSize;
    onProgress?.(
      file.size === 0 ? 100 : Math.round((uploadedBytes / file.size) * 100)
    );
  }

  return init;
}
