import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';

import {
  useGetFileSystemTree,
  usePushFileDataTrash,
} from '@/network/hooks/file';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { mapToList } from '@/utils/fileSystem/fileSystemUtils';

// --- 类型定义 ---

// 后端返回的原始数据格式
interface BackendTreeNode {
  id: string;
  UUID: string;
  filename: string;
  type: 'file' | 'folder';
  parent_id: number;
  size: string;
  ext: string;
  children?: BackendTreeNode[];
  createdAt: string;
  updatedAt: string;
}

interface FileDataContextType {
  fileTree: FileSystemTreeNode;
  allFiles: FileSystemTreeNode[]; // 扁平化的所有文件列表
  fileMap: Map<string, FileSystemTreeNode>;
  loading: boolean;

  updateFile: (
    fileId: string,
    updates: Partial<FileSystemTreeNode>
  ) => Promise<void>;
  deleteFile: (UUID: string, type: string) => Promise<void>;
  refreshFiles: () => void;
}

// --- 常量与工具函数 ---

// 初始空根节点
const EMPTY_ROOT: FileSystemTreeNode = {
  id: '1',
  UUID: '0',
  parent_id: 0,
  size: '0',
  ext: 'other',
  filename: 'root',
  type: 'folder',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  children: [],
};

/**
 * 转换后端数据格式到前端格式（纯函数）
 */
const transformTreeNode = (node: BackendTreeNode): FileSystemTreeNode => {
  return {
    id: node.id,
    UUID: node.UUID,
    filename: node.filename || 'Untitled', // 提供默认名
    type: node.type,
    parent_id: node.parent_id,
    size: node.size || '0',
    ext: node.ext || 'other',
    children: Array.isArray(node.children)
      ? node.children.map(transformTreeNode)
      : [],
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
};

/**
 * 构造缓存表
 * @param root 整个文件结构的根结点
 * @returns
 */
function buildFileMap(
  root: FileSystemTreeNode
): Map<string, FileSystemTreeNode> {
  const map = new Map<string, FileSystemTreeNode>();

  function transformation(root: FileSystemTreeNode) {
    map.set(root.id, root);

    if ('children' in root && root.children) {
      root.children.forEach(transformation);
    }
  }

  transformation(root);
  return map;
}

// --- Context 定义 ---

const FileDataContext = createContext<FileDataContextType | undefined>(
  undefined
);

// --- Provider 组件 ---

export function FileDataProvider({ children }: { children: ReactNode }) {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // 1. 获取数据
  const {
    data: fileSystemTreeData,
    isLoading,
    refetch,
  } = useGetFileSystemTree();
  const pushFileDataTrash = usePushFileDataTrash();

  // 2. 计算 fileTree (Memoized)
  const fileTree = useMemo(() => {
    const fstData = fileSystemTreeData?.data?.data;

    if (!fstData) {
      return EMPTY_ROOT;
    }

    // // 兼容后端可能返回数组或单个对象的情况
    return Array.isArray(fstData) ? fstData[0] : fstData;
  }, [fileSystemTreeData]);

  // 初始化为文件映射表
  const fileMap = buildFileMap(fileTree);

  // 3. 计算 allFiles (Memoized)
  // 这里修正为 扁平化所有文件
  // 这里假设你需要所有文件用于搜索/统计。
  const allFiles = useMemo(() => {
    if (!fileTree || !fileTree.children) return [];

    // 将整个树（包括根节点或仅根节点的子节点）扁平化
    return mapToList(fileMap);
  }, [fileMap, fileTree]);

  // 4. 操作方法
  const updateFile = useCallback(
    async (fileId: string, updates: Partial<FileSystemTreeNode>) => {
      // TODO: 实现 update 逻辑
      // 建议：使用 queryClient.setQueryData 进行乐观更新 (Optimistic Update)
      console.log('Update file placeholder', fileId, updates);
      return Promise.resolve();
    },
    []
  );

  const deleteFile = useCallback(
    async (UUID: string, type: string) =>
      new Promise<void>((resolve, reject) =>
        pushFileDataTrash.mutate(
          {
            srcBucket: DEFAULT_BUCKET,
            UUID,
            type,
          },
          {
            onSuccess: () => {
              messageApi.success('已移入回收站');
              // 使得查询失效，触发重新获取
              queryClient.invalidateQueries({
                queryKey: ['file', 'data', 'tree'],
              });
              resolve();
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
              const errorMsg = error?.message || '未知错误';
              messageApi.error(`删除失败: ${errorMsg}`);
              reject(error);
            },
          }
        )
      ),
    [pushFileDataTrash, messageApi, queryClient]
  );

  const refreshFiles = useCallback(() => {
    refetch();
  }, [refetch]);

  // 5. 构造 Context Value (Memoized)
  // 这一点很重要，否则每次 Provider 重渲染都会导致所有消费者重渲染
  const contextValue = useMemo<FileDataContextType>(
    () => ({
      fileTree,
      fileMap,
      allFiles,
      loading: isLoading,
      updateFile,
      deleteFile,
      refreshFiles,
    }),
    [
      fileTree,
      fileMap,
      allFiles,
      isLoading,
      updateFile,
      deleteFile,
      refreshFiles,
    ]
  );

  return (
    <FileDataContext.Provider value={contextValue}>
      {contextHolder}
      {children}
    </FileDataContext.Provider>
  );
}

export function useFileData() {
  const context = useContext(FileDataContext);
  if (context === undefined) {
    throw new Error('useFileData must be used within a FileDataProvider');
  }
  return context;
}
