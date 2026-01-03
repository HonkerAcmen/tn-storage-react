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
import { generateFileSystem } from '../mock/randomFileData';
import { getAllFiles, updateNodeInTree } from '../utils/fileSystemUtils';

interface FileDataContextType {
  fileTree: FileSystemNode;
  allFiles: FileSystemNode[];
  updateFile: (fileId: string, updates: Partial<FileSystemNode>) => void;
  deleteFile: (fileId: string) => void;
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
  // 在服务器端使用空数据，在客户端挂载后生成真实数据
  const [fileTree, setFileTree] = useState<FileSystemNode>(emptyRoot);
  const [isMounted, setIsMounted] = useState(false);

  // 在客户端挂载后生成数据，每次刷新使用新的种子
  useEffect(() => {
    setIsMounted(true);
    // 使用时间戳作为种子，确保每次刷新都生成不同的数据
    const seed = Date.now();
    setFileTree(generateFileSystem(3, 6, seed));
  }, []);

  // 获取所有文件
  const allFiles = useMemo(() => getAllFiles(fileTree), [fileTree]);

  // 更新文件
  const updateFile = useCallback(
    (fileId: string, updates: Partial<FileSystemNode>) => {
      setFileTree((prevTree) => {
        const updatedTree = updateNodeInTree(prevTree, fileId, updates);
        return updatedTree || prevTree;
      });
    },
    []
  );

  // 删除文件（从树中移除）
  const deleteFile = useCallback((fileId: string) => {
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
  }, []);

  // 刷新文件（重新加载）
  const refreshFiles = useCallback(() => {
    if (isMounted) {
      // 使用新的时间戳作为种子，生成新的数据
      const seed = Date.now();
      setFileTree(generateFileSystem(3, 6, seed));
    }
  }, [isMounted]);

  return (
    <FileDataContext.Provider
      value={{
        fileTree,
        allFiles,
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
