import { useState, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '../../../utils/storage';
import { getAllFiles } from '../../../utils/fileSystem/fileSystemUtils';
import { fileDatas } from '../../../mock/index';

const FAVORITES_STORAGE_KEY = 'favorites';

/**
 * 从 localStorage 获取收藏列表
 */
function getFavoritesFromStorage(): string[] {
  return getFromStorage<string[]>(FAVORITES_STORAGE_KEY) || [];
}

/**
 * 保存收藏列表到 localStorage
 */
function saveFavoritesToStorage(favorites: string[]): void {
  saveToStorage(FAVORITES_STORAGE_KEY, favorites);
}

/**
 * 初始化默认收藏数据
 */
function initializeDefaultFavorites(): string[] {
  if (!fileDatas) {
    return [];
  }
  const allFiles = getAllFiles(fileDatas);
  const defaultFavorites = allFiles.slice(0, 5).map((file) => file.id);
  saveFavoritesToStorage(defaultFavorites);
  return defaultFavorites;
}

/**
 * 收藏管理 Hook
 */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const stored = getFavoritesFromStorage();
    if (stored.length === 0) {
      return initializeDefaultFavorites();
    }
    return stored;
  });

  const toggleFavorite = useCallback(
    (fileId: string): boolean => {
      setFavoriteIds((prev) => {
        const index = prev.indexOf(fileId);
        let newFavorites: string[];

        if (index > -1) {
          // 取消收藏
          newFavorites = prev.filter((id) => id !== fileId);
        } else {
          // 添加收藏
          newFavorites = [...prev, fileId];
        }

        saveFavoritesToStorage(newFavorites);
        return newFavorites;
      });

      return !favoriteIds.includes(fileId);
    },
    [favoriteIds]
  );

  const isFavorite = useCallback(
    (fileId: string): boolean => {
      return favoriteIds.includes(fileId);
    },
    [favoriteIds]
  );

  const addFavorite = useCallback(
    (fileId: string): void => {
      if (!favoriteIds.includes(fileId)) {
        const newFavorites = [...favoriteIds, fileId];
        setFavoriteIds(newFavorites);
        saveFavoritesToStorage(newFavorites);
      }
    },
    [favoriteIds]
  );

  const removeFavorite = useCallback(
    (fileId: string): void => {
      const newFavorites = favoriteIds.filter((id) => id !== fileId);
      setFavoriteIds(newFavorites);
      saveFavoritesToStorage(newFavorites);
    },
    [favoriteIds]
  );

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
  };
}
