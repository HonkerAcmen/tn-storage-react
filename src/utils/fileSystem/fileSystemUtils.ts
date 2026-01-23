import {
  FileSystemTreeNode,
  FileSystemTreeResponse,
} from '@/network/types/Response/file';

/**
 * 文件系统树操作工具函数
 */

/**
 * 递归获取所有文件（仅文件，不包括文件夹）
 */
// export function getAllFiles(node: FileSystemNode): FileSystemNode[] {
//   const files: FileSystemNode[] = [];

//   if (node.type === 'file') {
//     files.push(node);
//   } else if (node.type === 'folder' && node.children) {
//     node.children.forEach((child) => {
//       files.push(...getAllFiles(child));
//     });
//   }

//   return files;
// }

/**
 * 递归获取所有节点（文件和文件夹，排除根节点）
 * 用于处理 API 返回的文件树结构
 */
export function getAllNodes(
  node: FileSystemTreeResponse | FileSystemTreeNode
): FileSystemTreeNode[] {
  const nodes: FileSystemTreeNode[] = [];

  // 跳过根节点
  if (node.name !== 'root') {
    // FileSystemTreeResponse 是文件夹类型，可以安全转换为 FileSystemTreeNode
    nodes.push(node as FileSystemTreeNode);
  }

  // 处理子节点：children 可能是 FileSystemTreeNode[]（在 FileSystemTreeResponse 中）或 FileSystemTreeNode[]（在 FileSystemTreeNode 中）
  const children = 'children' in node ? node.children : undefined;
  if (node.type === 'folder' && children) {
    children.forEach((child) => {
      // child 是 FileSystemTreeNode，递归调用 getAllNodes
      nodes.push(...getAllNodes(child));
    });
  }

  return nodes;
}

/**
 * 递归获取所有节点（文件和文件夹，排除根节点）
 * 用于处理前端 FileSystemNode 类型
 */
// export function getAllNodesFromFileSystemNode(
//   node: FileSystemNode
// ): FileSystemNode[] {
//   const nodes: FileSystemNode[] = [];

//   // 跳过根节点
//   if (node.name !== 'root') {
//     nodes.push(node);
//   }

//   if (node.type === 'folder' && node.children) {
//     node.children.forEach((child) => {
//       nodes.push(...getAllNodesFromFileSystemNode(child));
//     });
//   }

//   return nodes;
// }

/**
 * 搜索文件和文件夹
 */
// export function searchNodes(
//   root: FileSystemNode,
//   keyword: string
// ): FileSystemNode[] {
//   if (!keyword.trim()) {
//     return [];
//   }

//   const allNodes = getAllNodesFromFileSystemNode(root);
//   const lowerKeyword = keyword.toLowerCase();

//   return allNodes.filter((node) => {
//     const displayName =
//       node.type === 'file' && node.ext ? `${node.name}.${node.ext}` : node.name;
//     return displayName.toLowerCase().includes(lowerKeyword);
//   });
// }

/**
 * 根据ID查找节点
 */
export function findNodeById(
  node: FileSystemTreeResponse | FileSystemTreeNode,
  targetId: string
): FileSystemTreeResponse | FileSystemTreeNode | null {
  if (node.id === targetId) {
    return node;
  }

  if (node.type === 'folder') {
    const children = 'children' in node ? node.children : undefined;
    if (children) {
      for (const child of children) {
        const found = findNodeById(child, targetId);
        if (found) {
          return found;
        }
      }
    }
  }

  return null;
}

/**
 * 根据父节点 ID 查找其下的所有子节点
 * 用于处理 API 返回的文件树结构
 */
export function getChildrenByParentId(
  root: FileSystemTreeResponse | FileSystemTreeNode,
  parentId: string
): FileSystemTreeNode[] {
  function dfs(
    node: FileSystemTreeResponse | FileSystemTreeNode,
    id: string
  ): FileSystemTreeResponse | FileSystemTreeNode | null {
    if (node.id === id) return node;

    if (node.type === 'folder') {
      const children = 'children' in node ? node.children : undefined;
      if (children) {
        for (const child of children) {
          const found = dfs(child, id);
          if (found) return found;
        }
      }
    }

    return null;
  }

  const result = dfs(root, parentId);
  if (result && result.type === 'folder') {
    const children = 'children' in result ? result.children : undefined;
    return children || [];
  }
  return [];
}

/**
 * 查找从根节点到目标节点的路径 (用于面包屑)
 * 用于处理 API 返回的文件树结构
 */
export function findPathToNode(
  root: FileSystemTreeResponse | FileSystemTreeNode,
  targetId: string
): (FileSystemTreeResponse | FileSystemTreeNode)[] {
  const path: (FileSystemTreeResponse | FileSystemTreeNode)[] = [];

  function dfs(node: FileSystemTreeResponse | FileSystemTreeNode): boolean {
    path.push(node); // 将当前节点加入路径

    if (node.id === targetId) {
      return true; // 找到目标，停止递归
    }

    if (node.type === 'folder') {
      const children = 'children' in node ? node.children : undefined;
      if (children) {
        for (const child of children) {
          if (dfs(child)) return true; // 如果在子节点中找到了，直接返回 true
        }
      }
    }

    path.pop(); // 回溯：如果该节点及其子节点都不是目标，将其移出路径
    return false;
  }

  dfs(root);
  return path;
}

/**
 * 在树中更新节点
 */
export function updateNodeInTree(
  node: FileSystemTreeResponse | FileSystemTreeNode,
  targetId: string,
  updates: Partial<{
    id?: string;
    name?: string;
    type?: 'file' | 'folder';
    size?: string;
    ext?: string;
    createdAt?: string;
    updatedAt?: string;
  }>
): FileSystemTreeResponse | FileSystemTreeNode | null {
  if (node.id === targetId) {
    // 根据节点类型分别处理，确保类型安全
    if (node.type === 'folder') {
      // 如果是根节点 (FileSystemTreeResponse)
      if (node.name === 'root' && 'children' in node) {
        return {
          ...node,
          ...updates,
          type: 'folder' as const,
          children: node.children || [],
        } as FileSystemTreeResponse;
      }
      // 如果是文件夹节点 (FileSystemTreeNode)
      return {
        ...node,
        ...updates,
        type: 'folder' as const,
        children: (node as FileSystemTreeNode).children,
      } as FileSystemTreeNode;
    } else {
      // 文件节点
      return {
        ...node,
        ...updates,
        type: 'file' as const,
      } as FileSystemTreeNode;
    }
  }

  // 递归处理子节点
  if (node.type === 'folder') {
    const children = 'children' in node ? node.children : undefined;
    if (children) {
      const updatedChildren = children
        .map((child) => updateNodeInTree(child, targetId, updates))
        .filter((child): child is FileSystemTreeNode => child !== null);

      // 如果是根节点，返回 FileSystemTreeResponse
      if (node.name === 'root' && 'children' in node) {
        return {
          ...node,
          children: updatedChildren,
        } as FileSystemTreeResponse;
      }
      // 如果是文件夹节点，返回 FileSystemTreeNode
      return {
        ...node,
        children: updatedChildren,
      } as FileSystemTreeNode;
    }
  }

  return node;
}

/**
 * 在树中删除节点
 */
// export function deleteNodeFromTree(
//   node: FileSystemNode,
//   targetId: string
// ): FileSystemNode | null {
//   if (node.id === targetId) {
//     return null;
//   }

//   if (node.type === 'folder' && node.children) {
//     const filteredChildren = node.children
//       .map((child) => deleteNodeFromTree(child, targetId))
//       .filter((child): child is FileSystemNode => child !== null);

//     return {
//       ...node,
//       children: filteredChildren,
//     };
//   }

//   return node;
// }
