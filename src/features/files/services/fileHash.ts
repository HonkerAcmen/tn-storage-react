import { IncrementalMd5 } from './md5';

const MD5_CHUNK_SIZE = 2 * 1024 * 1024;

/** 分块读取文件并计算 MD5，用于秒传校验 */
export async function computeFileMd5(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const hasher = new IncrementalMd5();
  let offset = 0;

  if (file.size === 0) {
    hasher.append(new ArrayBuffer(0));
    return hasher.end();
  }

  while (offset < file.size) {
    const end = Math.min(offset + MD5_CHUNK_SIZE, file.size);
    const buffer = await file.slice(offset, end).arrayBuffer();
    hasher.append(buffer);
    offset = end;
    onProgress?.(Math.round((offset / file.size) * 100));
  }

  return hasher.end();
}
