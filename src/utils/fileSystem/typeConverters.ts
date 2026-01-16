import type { FileSystemNode, FileExtension } from '@/types/fileSystem';
import type { FileSystemTreeNode } from '@/network/types/Response/file';

/**
 * 类型转换工具函数
 * 用于在 API 类型和前端类型之间进行转换
 */

/**
 * 获取文件扩展名（用于类型转换）
 */
function getFileExtension(ext: string): FileExtension {
  const validExtensions: readonly FileExtension[] = [
    'txt',
    'pdf',
    'jpg',
    'png',
    'mp4',
    'mp3',
    'json',
    'zip',
    'doc',
    'docx',
    'wav',
    'tar',
    'xlsx',
    'log',
    'other',
  ];

  return (
    validExtensions.includes(ext as FileExtension)
      ? (ext as FileExtension)
      : 'other'
  ) as FileExtension;
}

/**
 * 将 FileSystemTreeNode 转换为 FileSystemNode
 */
export function convertTreeNodeToFileSystemNode(
  node: FileSystemTreeNode
): FileSystemNode {
  if (node.type === 'file') {
    return {
      id: node.id,
      name: node.name,
      type: 'file',
      size: parseInt(node.size, 10) || 0,
      ext: getFileExtension(node.ext),
      createdAt: new Date(node.createdAt),
      updatedAt: new Date(node.updatedAt),
    };
  } else {
    return {
      id: node.id,
      name: node.name,
      type: 'folder',
      children: node.children.map(convertTreeNodeToFileSystemNode),
      createdAt: new Date(node.createdAt),
      updatedAt: new Date(node.updatedAt),
    };
  }
}
