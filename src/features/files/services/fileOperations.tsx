import { message, Modal } from 'antd';
import http from '@/network/http';
import { getFilePath } from '@/network/resPath';
import {
  FileSystemTreeNode,
  GetFileChunkManifestApiResponse,
} from '@/network/types/Response/file';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { queryClient } from '@/network/queryClient';

/**
 * 文件操作服务
 * 统一处理文件的各种操作（下载、分享、重命名等）
 * 注意：消息提示由调用方处理
 */

/**
 * 下载文件
 */
export async function downloadFile(file: FileSystemTreeNode): Promise<void> {
  if (file.type === 'folder') {
    return;
  }

  const chunkBuffers: BlobPart[] = [];

  try {
    const manifestRes = await http.get<GetFileChunkManifestApiResponse>(
      `${getFilePath}/${DEFAULT_BUCKET}/${file.UUID}/chunks`
    );
    const manifest = manifestRes.data.data;

    for (let chunkIndex = 1; chunkIndex <= manifest.totalChunks; chunkIndex++) {
      const chunkRes = await http.get<Blob>(
        `${getFilePath}/${DEFAULT_BUCKET}/${file.UUID}/chunk/${chunkIndex}`,
        {
          responseType: 'blob',
        }
      );
      chunkBuffers.push(chunkRes.data);
    }

    const blob = new Blob(chunkBuffers, { type: manifest.mimetype });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = manifest.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    chunkBuffers.length = 0;
    console.error('下载分片失败:', err);
    message.error('后端服务器不可用');
  }
}

/**
 * 分享文件
 */
export async function shareFile(
  file: FileSystemTreeNode,
  shouldNotify = true
): Promise<void> {
  if (file.type === 'folder') {
    message.error('当前仅支持分享文件');
    return;
  }

  const res = await http.post(`/file/share/${file.UUID}`);
  const shareUrl = res.data.data.url;
  await navigator.clipboard.writeText(shareUrl);
  await queryClient.invalidateQueries({ queryKey: ['file', 'share'] });
  if (shouldNotify) {
    message.success('已复制');
  }
}

/**
 * 重命名文件
 * @param messageApi - 用于显示消息的 API，由调用方传入
 */
export function renameFile(
  file: FileSystemTreeNode,
  onUpdate: (
    fileId: string,
    updates: Partial<FileSystemTreeNode>
  ) => Promise<void>,
  messageApi?: {
    success: (content: string) => void;
    error: (content: string) => void;
  }
): void {
  Modal.confirm({
    title: '重命名',
    content: (
      <div className="mt-4">
        <input
          type="text"
          id="rename-input"
          defaultValue={file.filename}
          className="w-full rounded border border-gray-300 px-3 py-2"
          autoFocus
        />
      </div>
    ),
    onOk: async () => {
      const input = document.getElementById('rename-input') as HTMLInputElement;
      const newName = input?.value.trim();

      if (!newName || newName === file.filename) {
        return;
      }

      try {
        await onUpdate(file.id, { filename: newName });
        messageApi?.success('重命名成功');
      } catch (error) {
        console.error(error);
        messageApi?.error('重命名失败');
      }
    },
  });
}

/**
 * 预览文件
 */
export function previewFile(file: FileSystemTreeNode): void {
  if (file.type === 'folder') {
    // 消息提示由调用方处理
    return;
  }

  // TODO: 根据文件类型实现不同的预览方式
  // 消息提示由调用方处理

  // 示例：打开预览窗口
  // const previewUrl = `/api/files/${file.id}/preview`;
  // window.open(previewUrl, '_blank');
}
