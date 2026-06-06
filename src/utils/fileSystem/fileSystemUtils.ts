import { FileSystemTreeNode } from '@/network/types/Response/file';

/** 前端合成的虚拟根目录（非数据库记录） */
export function isVirtualRoot(node: FileSystemTreeNode): boolean {
  return (
    node.filename === 'root' &&
    node.parent_id === 0 &&
    node.UUID === '0'
  );
}

/**
 * 将map转化为list
 */
export function mapToList(
  map: Map<string, FileSystemTreeNode>
): FileSystemTreeNode[] {
  const list: FileSystemTreeNode[] = [];
  map.forEach((v) => {
    if (isVirtualRoot(v)) return;
    list.push(v);
  });

  return list;
}

/**
 * 搜索文件和文件夹
 */
export function searchNodes(
  fileMap: Map<string, FileSystemTreeNode>,
  keyword: string
): FileSystemTreeNode[] {
  if (!keyword.trim()) {
    return [];
  }

  const allNodes = mapToList(fileMap);
  const lowerKeyword = keyword.toLowerCase();
  if (allNodes.length <= 0) {
    return [];
  }

  return allNodes.filter((node) => {
    const displayName =
      node.type === 'file' && node.ext
        ? `${node.filename}.${node.ext}`
        : node.filename;
    return displayName.toLowerCase().includes(lowerKeyword);
  });
}

/**
 * 根据ID查找节点
 */
export function findNodeById(
  node: FileSystemTreeNode,
  targetId: string
): FileSystemTreeNode | null {
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
  fileMap: Map<string, FileSystemTreeNode>,
  parentId: string
): FileSystemTreeNode[] {
  /**
   * 根据缓存表返回需要节点的数据，只需要构造一次缓存表即可（未实现）
   * @param id
   * @returns
   */
  function cacheMap(id: string): FileSystemTreeNode[] {
    const node = fileMap.get(id);
    if (node && node.type === 'folder' && node.children) {
      return node.children;
    }
    return [];
  }

  // 因为后端数据库表中使用邻接表进行组织文件和文件夹的结构
  // 所以每个文件都会有一个parent_id字段
  // 该字段的值是 存储该文件的文件夹的id
  const result = cacheMap(parentId);
  if (result) {
    return result;
  }
  return [];
}

/**
 * 查找从根节点到目标节点的路径 (用于面包屑)
 * 用于处理 API 返回的文件树结构
 */
export function findPathToNode(
  root: FileSystemTreeNode,
  targetId: string
): FileSystemTreeNode[] {
  const path: FileSystemTreeNode[] = [];

  function dfs(node: FileSystemTreeNode): boolean {
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
  node: FileSystemTreeNode,
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
): FileSystemTreeNode | null {
  if (node.id === targetId) {
    // 根据节点类型分别处理，确保类型安全
    if (node.type === 'folder') {
      // 如果是根节点 (FileSystemTreeResponse)
      if (
        node.filename === 'root' &&
        node.parent_id === 0 &&
        'children' in node
      ) {
        return {
          ...node,
          ...updates,
          type: 'folder' as const,
          children: node.children || [],
        } as FileSystemTreeNode;
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
      if (
        node.filename === 'root' &&
        node.parent_id === 0 &&
        'children' in node
      ) {
        return {
          ...node,
          children: updatedChildren,
        } as FileSystemTreeNode;
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
