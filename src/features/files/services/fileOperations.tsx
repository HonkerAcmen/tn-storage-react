import { message, Modal } from 'antd';
import type { FileSystemNode } from '@/types/fileSystem';

/**
 * 文件操作服务
 * 统一处理文件的各种操作（下载、分享、重命名等）
 */

/**
 * 下载文件
 */
export function downloadFile(file: FileSystemNode): void {
  if (file.type === 'folder') {
    message.warning('文件夹暂不支持下载');
    return;
  }

  // TODO: 实现真实的下载逻辑
  message.info(`正在下载 ${file.name}...`);
  
  // 示例：创建下载链接
  // const url = `/api/files/${file.id}/download`;
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = file.type === 'file' && file.ext ? `${file.name}.${file.ext}` : file.name;
  // link.click();
}

/**
 * 分享文件
 */
export function shareFile(file: FileSystemNode): void {
  // TODO: 实现真实的分享逻辑
  message.info(`正在分享 ${file.name}...`);
  
  // 示例：生成分享链接
  // const shareUrl = `${window.location.origin}/share/${file.id}`;
  // navigator.clipboard.writeText(shareUrl);
  // message.success('分享链接已复制到剪贴板');
}

/**
 * 重命名文件
 */
export function renameFile(
  file: FileSystemNode,
  onUpdate: (fileId: string, updates: Partial<FileSystemNode>) => Promise<void>
): void {
  Modal.confirm({
    title: '重命名',
    content: (
      <div className="mt-4">
        <input
          type="text"
          id="rename-input"
          defaultValue={file.name}
          className="w-full rounded border border-gray-300 px-3 py-2"
          autoFocus
        />
      </div>
    ),
    onOk: async () => {
      const input = document.getElementById('rename-input') as HTMLInputElement;
      const newName = input?.value.trim();
      
      if (!newName || newName === file.name) {
        return;
      }

      try {
        await onUpdate(file.id, { name: newName });
        message.success('重命名成功');
      } catch (error) {
        message.error('重命名失败');
      }
    },
  });
}

/**
 * 预览文件
 */
export function previewFile(file: FileSystemNode): void {
  if (file.type === 'folder') {
    message.info('文件夹无法预览');
    return;
  }

  // TODO: 根据文件类型实现不同的预览方式
  message.info(`预览 ${file.name}...`);
  
  // 示例：打开预览窗口
  // const previewUrl = `/api/files/${file.id}/preview`;
  // window.open(previewUrl, '_blank');
}

