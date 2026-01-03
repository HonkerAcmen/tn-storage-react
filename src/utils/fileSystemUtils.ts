import type { FileSystemNode } from '../types/fileSystem';

/**
 * 递归获取所有文件
 */
export function getAllFiles(node: FileSystemNode): FileSystemNode[] {
  const files: FileSystemNode[] = [];

  if (node.type === 'file') {
    files.push(node);
  } else if (node.type === 'folder' && node.children) {
    node.children.forEach((child) => {
      files.push(...getAllFiles(child));
    });
  }

  return files;
}

/**
 * 根据ID查找节点
 */
export function findNodeById(
  node: FileSystemNode,
  targetId: string
): FileSystemNode | null {
  if (node.id === targetId) {
    return node;
  }

  if (node.type === 'folder' && node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * 在树中更新节点
 */
export function updateNodeInTree(
  node: FileSystemNode,
  targetId: string,
  updates: Partial<FileSystemNode>
): FileSystemNode | null {
  if (node.id === targetId) {
    // 根据节点类型分别处理，确保类型安全
    if (node.type === 'folder') {
      return {
        ...node,
        ...updates,
        type: 'folder' as const,
        children: node.children,
      };
    } else {
      return {
        ...node,
        ...updates,
        type: 'file' as const,
      };
    }
  }

  if (node.type === 'folder' && node.children) {
    const updatedChildren = node.children
      .map((child) => updateNodeInTree(child, targetId, updates))
      .filter((child): child is FileSystemNode => child !== null);

    return {
      ...node,
      children: updatedChildren,
    };
  }

  return node;
}

/**
 * 在树中删除节点
 */
export function deleteNodeFromTree(
  node: FileSystemNode,
  targetId: string
): FileSystemNode | null {
  if (node.id === targetId) {
    return null;
  }

  if (node.type === 'folder' && node.children) {
    const filteredChildren = node.children
      .map((child) => deleteNodeFromTree(child, targetId))
      .filter((child): child is FileSystemNode => child !== null);

    return {
      ...node,
      children: filteredChildren,
    };
  }

  return node;
}
