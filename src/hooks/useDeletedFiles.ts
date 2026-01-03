import { useState, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';
import { getAllFiles } from '../utils/fileUtils';
import { fileDatas } from '../mock/index';
import type { FileSystemNode } from '../types/fileSystem';

const DELETED_FILES_STORAGE_KEY = 'deletedFiles';

/**
 * 已删除文件的数据结构
 */
export interface DeletedFileItem {
  file: FileSystemNode;
  deletedAt: Date;
}

/**
 * 从 localStorage 获取已删除文件列表
 */
function getDeletedFilesFromStorage(): DeletedFileItem[] {
  const stored = getFromStorage<any[]>(DELETED_FILES_STORAGE_KEY);
  if (!stored) return [];

  // 将日期字符串转换回 Date 对象
  return stored.map((item) => ({
    file: {
      ...item.file,
      createdAt: new Date(item.file.createdAt),
      updatedAt: new Date(item.file.updatedAt),
    },
    deletedAt: new Date(item.deletedAt),
  }));
}

/**
 * 初始化默认已删除文件数据
 */
function initializeDefaultDeletedFiles(): DeletedFileItem[] {
  if (!fileDatas) {
    return [];
  }
  const allFiles = getAllFiles(fileDatas);
  const defaultDeleted = allFiles.slice(0, 3).map((file) => ({
    file,
    deletedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 随机删除时间（最近7天内）
  }));
  saveToStorage(DELETED_FILES_STORAGE_KEY, defaultDeleted);
  return defaultDeleted;
}

/**
 * 保存已删除文件列表到 localStorage
 */
function saveDeletedFilesToStorage(deletedFiles: DeletedFileItem[]): void {
  saveToStorage(DELETED_FILES_STORAGE_KEY, deletedFiles);
}

/**
 * 已删除文件管理 Hook
 */
export function useDeletedFiles() {
  const [deletedFiles, setDeletedFiles] = useState<DeletedFileItem[]>(() => {
    const stored = getDeletedFilesFromStorage();
    if (stored.length === 0) {
      return initializeDefaultDeletedFiles();
    }
    return stored;
  });

  const addDeletedFile = useCallback((file: FileSystemNode): void => {
    const deletedItem: DeletedFileItem = {
      file,
      deletedAt: new Date(),
    };
    setDeletedFiles((prev) => {
      const newDeletedFiles = [...prev, deletedItem];
      saveDeletedFilesToStorage(newDeletedFiles);
      return newDeletedFiles;
    });
  }, []);

  const removeDeletedFile = useCallback((fileId: string): void => {
    setDeletedFiles((prev) => {
      const newDeletedFiles = prev.filter((item) => item.file.id !== fileId);
      saveDeletedFilesToStorage(newDeletedFiles);
      return newDeletedFiles;
    });
  }, []);

  const clearDeletedFiles = useCallback((): void => {
    setDeletedFiles([]);
    saveDeletedFilesToStorage([]);
  }, []);

  return {
    deletedFiles,
    addDeletedFile,
    removeDeletedFile,
    clearDeletedFiles,
  };
}

