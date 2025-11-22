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

// /**
//  * @function traverse 递归遍历目录函数
//  * @param nodes 需要递归的节点
//  */
// export function traverse(nodes: FileSystemNode[]) {
//   for (const node of nodes) {
//   }
// }

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
