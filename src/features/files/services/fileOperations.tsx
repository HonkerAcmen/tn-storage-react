import { Modal } from 'antd';
import { FileSystemTreeNode } from '@/network/types/Response/file';

/**
 * 文件操作服务
 * 统一处理文件的各种操作（下载、分享、重命名等）
 * 注意：消息提示由调用方处理
 */

/**
 * 下载文件
 */
export function downloadFile(file: FileSystemTreeNode): void {
  if (file.type === 'folder') {
    // 消息提示由调用方处理
    return;
  }

  // TODO: 实现真实的下载逻辑
  // 消息提示由调用方处理

  // 示例：创建下载链接
  // const url = `/api/files/${file.id}/download`;
  // const link = document.createElement('a');
  // link.href = url;
  // link.download =
  //   file.type === 'file' && file.ext
  //     ? `${file.filename}.${file.ext}`
  //     : file.filename;
  // link.click();
}

/**
 * 分享文件
 */
export function shareFile(_file: FileSystemTreeNode): void {
  void _file;
  // TODO: 实现真实的分享逻辑
  // 消息提示由调用方处理
  // 示例：生成分享链接
  // const shareUrl = `${window.location.origin}/share/${file.id}`;
  // navigator.clipboard.writeText(shareUrl);
  // message.success('分享链接已复制到剪贴板');
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
