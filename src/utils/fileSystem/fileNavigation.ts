import type { FileSystemNode } from '../../types/fileSystem';
import { findPathToNode, getChildrenByParentId } from '../../types/fileSystem';

/**
 * 文件导航工具函数
 */

/**
 * 获取当前文件夹的子节点
 */
export function getCurrentFolderChildren(
  fileTree: FileSystemNode,
  folderId: string | undefined
): FileSystemNode[] {
  if (!folderId) {
    // 如果没有 folderId，返回所有节点（排除根节点）
    const allNodes: FileSystemNode[] = [];
    if (fileTree.type === 'folder' && fileTree.children) {
      return fileTree.children;
    }
    return allNodes;
  }
  return getChildrenByParentId(fileTree, folderId);
}

/**
 * 获取面包屑路径
 */
export function getBreadcrumbPath(
  fileTree: FileSystemNode,
  folderId: string | undefined
): FileSystemNode[] {
  if (!folderId) return [];
  return findPathToNode(fileTree, folderId);
}

