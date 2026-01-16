/**
 * 文件扩展名（可扩展）
 */
export type FileExtension =
  | 'txt'
  | 'pdf'
  | 'jpg'
  | 'png'
  | 'mp4'
  | 'mp3'
  | 'json'
  | 'zip'
  | 'doc'
  | 'docx'
  | 'wav'
  | 'tar'
  | 'xlsx'
  | 'log'
  | 'other';

/**
 * 基础文件信息
 */
export interface BaseNode {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 文件（FileNode）
 */
export interface FileNode extends BaseNode {
  type: 'file';
  size: number; // 单位：字节
  ext: FileExtension;
}

/**
 * 文件夹（FolderNode）
 */
export interface FolderNode extends BaseNode {
  type: 'folder';
  children: FileSystemNode[]; // 递归
}

/**
 * 文件系统节点 = 文件 或 文件夹
 */
export type FileSystemNode = FileNode | FolderNode;

/**
 * @function getChildrenByParentId 根据父节点 ID 查找其下的所有子节点
 * @param root 根节点
 * @param parentId 父节点ID
 * @returns 返回该父节点下的所有子节点
 */
export function getChildrenByParentId(
  root: FileSystemNode,
  parentId: string
): FileSystemNode[] {
  function dfs(node: FileSystemNode, id: string): FileSystemNode | null {
    if (node.id === id) return node;

    if (node.type === 'folder' && node.children) {
      for (const child of node.children) {
        const found = dfs(child, id);
        if (found) return found;
      }
    }

    return null;
  }

  const result = dfs(root, parentId);
  return result?.type === 'folder' ? result.children : [];
}

// 查找从根节点到目标节点的路径 (用于面包屑)
export function findPathToNode(
  root: FileSystemNode,
  targetId: string
): FileSystemNode[] {
  const path: FileSystemNode[] = [];

  function dfs(node: FileSystemNode): boolean {
    path.push(node); // 将当前节点加入路径

    if (node.id === targetId) {
      return true; // 找到目标，停止递归
    }

    if (node.type === 'folder' && node.children) {
      for (const child of node.children) {
        if (dfs(child)) return true; // 如果在子节点中找到了，直接返回 true
      }
    }

    path.pop(); // 回溯：如果该节点及其子节点都不是目标，将其移出路径
    return false;
  }

  dfs(root);
  return path;
}

/**
 * API 返回类型（可用于 React Query）
 */
export interface GetFolderResponse {
  currentFolder: FolderNode;
  path: FolderNode[]; // 面包屑路径
}

export interface UploadFileRequest {
  folderId: string;
  file: File;
}

export interface UploadFileResponse {
  uploaded: FileNode;
}

export interface CreateFolderRequest {
  parentId: string;
  name: string;
}

export interface CreateFolderResponse {
  folder: FolderNode;
}

/**
 * React 组件类型
 */
export interface FileListProps {
  nodes: FileSystemNode[];
  onOpenFolder: (folderId: string) => void;
  onPreviewFile: (fileId: string) => void;
}

export interface FileItemProps {
  node: FileSystemNode;
  onClick: () => void;
}
