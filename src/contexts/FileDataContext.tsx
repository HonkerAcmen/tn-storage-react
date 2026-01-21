import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import { message } from 'antd';
import {
  deleteNodeFromTree,
  getAllNodes,
} from '@/utils/fileSystem/fileSystemUtils';
import { useDeleteFile, useGetFileSystemTree } from '@/network/hooks/file';
import {
  FileSystemTreeNode,
  FileSystemTreeResponse,
} from '@/network/types/Response/file';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { useQueryClient } from '@tanstack/react-query';

interface FileDataContextType {
  fileTree: FileSystemTreeResponse;
  allFiles: FileSystemTreeNode[];
  loading: boolean;
  updateFile: (
    fileId: string,
    updates: Partial<FileSystemTreeResponse | FileSystemTreeNode>
  ) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  refreshFiles: () => void;
}

const FileDataContext = createContext<FileDataContextType | undefined>(
  undefined
);

// 创建一个空的根节点作为初始状态（用于服务器端渲染）
const emptyRoot: FileSystemTreeResponse = {
  id: '1',
  name: 'root',
  type: 'folder',
  createdAt: new Date('2024-01-01').toString(),
  updatedAt: new Date('2024-01-01').toString(),
  children: [],
};

/**
 * 规范化文件树数据，确保所有节点都有必需的字段
 * API 返回的文件节点可能没有 children 字段，需要规范化
 */
function normalizeFileTreeData(
  data: FileSystemTreeResponse | Partial<FileSystemTreeResponse>
): FileSystemTreeResponse {
  const normalizeNode = (
    node: Partial<FileSystemTreeNode | FileSystemTreeResponse>
  ): FileSystemTreeNode | FileSystemTreeResponse => {
    // 如果节点是文件类型，确保有空的 children 数组和其他必需字段
    if (node.type === 'file') {
      return {
        id: node.id || '',
        name: node.name || '',
        type: 'file',
        size: node.size || '0',
        ext: node.ext || '',
        createdAt: node.createdAt || new Date().toISOString(),
        updatedAt: node.updatedAt || new Date().toISOString(),
        children: [],
      } as FileSystemTreeNode;
    }

    // 如果是文件夹类型，递归规范化子节点
    const rawChildren =
      'children' in node && Array.isArray(node.children) ? node.children : [];
    const normalizedChildren =
      rawChildren.length > 0
        ? (rawChildren.map((child) =>
            normalizeNode(child)
          ) as FileSystemTreeNode[])
        : [];

    // 如果是根节点 (FileSystemTreeResponse)
    if (node.name === 'root' || (node.type === 'folder' && !node.id)) {
      return {
        id: node.id || '1',
        name: node.name || 'root',
        type: 'folder',
        createdAt: node.createdAt || new Date().toISOString(),
        updatedAt: node.updatedAt || new Date().toISOString(),
        children: normalizedChildren,
      } as FileSystemTreeResponse;
    }

    // 普通文件夹节点
    const folderNode: FileSystemTreeNode = {
      id: node.id || '',
      name: node.name || '',
      type: 'folder',
      size: 'size' in node ? node.size || '0' : '0',
      ext: 'ext' in node ? node.ext || '' : '',
      createdAt: node.createdAt || new Date().toISOString(),
      updatedAt: node.updatedAt || new Date().toISOString(),
      children: normalizedChildren,
    };
    return folderNode;
  };

  return normalizeNode(data) as FileSystemTreeResponse;
}

export function FileDataProvider({ children }: { children: ReactNode }) {
  // 在客户端挂载后加载数据
  const {
    data: fileSystemTreeData,
    isLoading,
    refetch,
  } = useGetFileSystemTree();

  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  // 规范化数据并作为状态
  const fileTree = useMemo(() => {
    const fstData = fileSystemTreeData?.data.data;
    if (!fstData) {
      return emptyRoot;
    }
    return normalizeFileTreeData(fstData);
  }, [fileSystemTreeData]);

  // 获取所有文件和文件夹
  const allFiles = useMemo(() => getAllNodes(fileTree), [fileTree]);

  const loading = isLoading;
  const deleteFileMutate = useDeleteFile();

  // 更新文件
  const updateFile = useCallback(
    async (
      _fileId: string,
      _updates: Partial<FileSystemTreeResponse | FileSystemTreeNode>
    ) => {
      // try {
      //   // 调用 API 更新文件
      //   await updateFileAPI(fileId, updates);
      //   // 更新本地状态
      //   setFileTree((prevTree) => {
      //     const updatedTree = updateNodeInTree(prevTree, fileId, updates);
      //     return updatedTree || prevTree;
      //   });
      // } catch (error) {
      //   console.error('Failed to update file:', error);
      //   // 即使 API 调用失败，也更新本地状态（用于假数据模式）
      //   setFileTree((prevTree) => {
      //     const updatedTree = updateNodeInTree(prevTree, fileId, updates);
      //     return updatedTree || prevTree;
      //   });
      // }
    },
    []
  );

  // 删除文件（从树中移除）
  const deleteFile = useCallback(
    async (fileId: string) => {
      deleteFileMutate.mutate(
        {
          bucket: DEFAULT_BUCKET,
          UUID: fileId,
        },
        {
          onSuccess: () => {
            messageApi.success('删除成功');
            queryClient.invalidateQueries({
              queryKey: ['file', 'data', 'tree'],
            });
          },
          onError: (error) => {
            console.error('删除文件出错: ' + error);
            messageApi.error('删除失败, ' + error.message);
          },
        }
      );
    },
    [deleteFileMutate, messageApi, queryClient]
  );

  // 刷新文件（重新加载）
  const refreshFiles = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <FileDataContext.Provider
      value={{
        fileTree,
        allFiles,
        loading,
        updateFile,
        deleteFile,
        refreshFiles,
      }}
    >
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
