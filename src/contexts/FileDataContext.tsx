import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import type { FileSystemNode } from '../types/fileSystem';
import { fileDatas as initialFileDatas } from '../mock/index';
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

export function FileDataProvider({ children }: { children: ReactNode }) {
  const [fileTree, setFileTree] = useState<FileSystemNode>(initialFileDatas);

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
    setFileTree(initialFileDatas);
  }, []);

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
