import { message } from 'antd';
import http from '@/network/http';
import { getFilePath } from '@/network/resPath';
import {
  FileSystemTreeNode,
  GetFileChunkManifestApiResponse,
} from '@/network/types/Response/file';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { queryClient } from '@/network/queryClient';
import { buildSharePageUrl } from '@/utils/shareUrl';

/**
 * 文件操作服务
 * 统一处理文件的各种操作（下载、分享、重命名等）
 * 分享复制提示由调用方通过 App.useApp().message 展示
 */

async function writeClipboard(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('当前浏览器不支持自动复制，请手动复制链接');
  }
  await navigator.clipboard.writeText(text);
}

/** 创建分享并复制链接到剪贴板，返回分享页 URL */
export async function copyShareLinkForFile(
  file: FileSystemTreeNode,
): Promise<string> {
  if (file.type === 'folder') {
    throw new Error('当前仅支持分享文件');
  }

  const res = await http.post(`/file/share/${file.UUID}`);
  const shareToken = res.data.data.token;
  const shareUrl = buildSharePageUrl(shareToken);
  await writeClipboard(shareUrl);
  await queryClient.invalidateQueries({ queryKey: ['file', 'share'] });
  return shareUrl;
}

export async function fetchFileBlob(
  file: FileSystemTreeNode,
): Promise<{ blob: Blob; filename: string; mimetype: string }> {
  const manifestRes = await http.get<GetFileChunkManifestApiResponse>(
    `${getFilePath}/${DEFAULT_BUCKET}/${file.UUID}/chunks`,
  );
  const manifest = manifestRes.data.data;
  const chunkBuffers: BlobPart[] = [];

  for (let chunkIndex = 1; chunkIndex <= manifest.totalChunks; chunkIndex++) {
    const chunkRes = await http.get<Blob>(
      `${getFilePath}/${DEFAULT_BUCKET}/${file.UUID}/chunk/${chunkIndex}`,
      {
        responseType: 'blob',
      },
    );
    chunkBuffers.push(chunkRes.data);
  }

  return {
    blob: new Blob(chunkBuffers, { type: manifest.mimetype }),
    filename: manifest.filename,
    mimetype: manifest.mimetype,
  };
}

export async function downloadFile(file: FileSystemTreeNode): Promise<void> {
  if (file.type === 'folder') {
    return;
  }

  try {
    const { blob, filename } = await fetchFileBlob(file);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('下载分片失败:', err);
    message.error('后端服务器不可用');
  }
}

/** @deprecated 请使用 copyShareLinkForFile */
export async function shareFile(
  file: FileSystemTreeNode,
  _shouldNotify = true,
): Promise<string> {
  return copyShareLinkForFile(file);
}

export function previewFile(file: FileSystemTreeNode): void {
  if (file.type === 'folder') {
    return;
  }
}
