import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from 'react';
import type { FileSystemNode } from '../types/fileSystem';
import { getAllFiles, updateNodeInTree } from '../utils/fileSystemUtils';
import { getFileSystemTree, updateFile as updateFileAPI, deleteFile as deleteFileAPI } from '../services/fileService';

interface FileDataContextType {
  fileTree: FileSystemNode;
  allFiles: FileSystemNode[];
  loading: boolean;
  updateFile: (fileId: string, updates: Partial<FileSystemNode>) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  refreshFiles: () => void;
}

const FileDataContext = createContext<FileDataContextType | undefined>(
  undefined
);

// 创建一个空的根节点作为初始状态（用于服务器端渲染）
const emptyRoot: FileSystemNode = {
  id: '1',
  name: 'root',
  type: 'folder',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  children: [],
};

export function FileDataProvider({ children }: { children: ReactNode }) {
  // 在服务器端使用空数据，在客户端挂载后加载数据
  const [fileTree, setFileTree] = useState<FileSystemNode>(emptyRoot);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // 在客户端挂载后加载数据
  useEffect(() => {
    setIsMounted(true);
    loadFileSystem();
  }, []);

  // 加载文件系统数据
  const loadFileSystem = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    try {
      const data = await getFileSystemTree();
      setFileTree(data);
    } catch (error) {
      console.error('Failed to load file system:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取所有文件
  const allFiles = useMemo(() => getAllFiles(fileTree), [fileTree]);

  // 更新文件
  const updateFile = useCallback(
    async (fileId: string, updates: Partial<FileSystemNode>) => {
      try {
        // 调用 API 更新文件
        await updateFileAPI(fileId, updates);
        
        // 更新本地状态
        setFileTree((prevTree) => {
          const updatedTree = updateNodeInTree(prevTree, fileId, updates);
          return updatedTree || prevTree;
        });
      } catch (error) {
        console.error('Failed to update file:', error);
        // 即使 API 调用失败，也更新本地状态（用于假数据模式）
        setFileTree((prevTree) => {
          const updatedTree = updateNodeInTree(prevTree, fileId, updates);
          return updatedTree || prevTree;
        });
      }
    },
    []
  );

  // 删除文件（从树中移除）
  const deleteFile = useCallback(
    async (fileId: string) => {
      try {
        // 调用 API 删除文件
        await deleteFileAPI(fileId);
        
        // 更新本地状态
        setFileTree((prevTree) => {
          const removeNodeFromTree = (
            node: FileSystemNode
          ): FileSystemNode | null => {
            if (node.id === fileId) {
              return null; // 删除当前节点
            }
            if (node.type === 'folder' && node.children) {
              const filteredChildren = node.children
                .map(removeNodeFromTree)
                .filter((child): child is FileSystemNode => child !== null);
              return {
                ...node,
                children: filteredChildren,
              };
            }
            return node;
          };
          const result = removeNodeFromTree(prevTree);
          return result || prevTree;
        });
      } catch (error) {
        console.error('Failed to delete file:', error);
        // 即使 API 调用失败，也更新本地状态（用于假数据模式）
        setFileTree((prevTree) => {
          const removeNodeFromTree = (
            node: FileSystemNode
          ): FileSystemNode | null => {
            if (node.id === fileId) {
              return null;
            }
            if (node.type === 'folder' && node.children) {
              const filteredChildren = node.children
                .map(removeNodeFromTree)
                .filter((child): child is FileSystemNode => child !== null);
              return {
                ...node,
                children: filteredChildren,
              };
            }
            return node;
          };
          const result = removeNodeFromTree(prevTree);
          return result || prevTree;
        });
      }
    },
    []
  );

  // 刷新文件（重新加载）
  const refreshFiles = useCallback(() => {
    if (isMounted) {
      loadFileSystem();
    }
  }, [isMounted, loadFileSystem]);

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
