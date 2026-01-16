import { useCallback } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/router';
import type { FileSystemNode } from '@/types/fileSystem';
import { useFavorites } from './useFavorites';
import { useDeletedFiles } from './useDeletedFiles';
import { useFileData } from '@/contexts/FileDataContext';
import * as fileOperations from '@/features/files/services/fileOperations';

/**
 * 文件操作 Hook
 * 统一管理所有文件操作逻辑
 */
export function useFileActions() {
  const [messageApi] = message.useMessage();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addDeletedFile } = useDeletedFiles();
  const { updateFile, deleteFile } = useFileData();

  /**
   * 处理文件操作
   */
  const handleFileAction = useCallback(
    (
      action: string,
      item: FileSystemNode,
      options?: {
        onDetailsOpen?: (file: FileSystemNode) => void;
        onFolderNavigate?: (folderId: string) => void;
      }
    ) => {
      switch (action) {
        case 'download':
          fileOperations.downloadFile(item);
          break;
        case 'share':
          fileOperations.shareFile(item);
          break;
        case 'rename':
          fileOperations.renameFile(item, updateFile, messageApi);
          break;
        case 'delete':
          // 先添加到已删除列表
          addDeletedFile(item);
          // 立即显示成功消息（因为删除操作会立即更新 UI）
          messageApi.success(`已删除 ${item.name}`);
          // 然后从文件树中删除（这会立即更新 UI）
          deleteFile(item.id).catch((error) => {
            console.error('Failed to delete file from tree:', error);
            // 如果删除失败，可以在这里处理错误（但本地状态已经更新）
          });
          break;
        case 'details':
          options?.onDetailsOpen?.(item);
          break;
        case 'favorite': {
          const wasFavorite = isFavorite(item.id);
          toggleFavorite(item.id);
          messageApi.success(wasFavorite ? '已取消收藏' : '已添加到收藏');
          break;
        }
        case 'openFolder':
          if (item.type === 'folder') {
            options?.onFolderNavigate?.(item.id);
          }
          break;
        default:
          break;
      }
    },
    [toggleFavorite, isFavorite, addDeletedFile, updateFile, deleteFile, messageApi]
  );

  /**
   * 处理文件夹导航
   */
  const handleFolderNavigation = useCallback(
    (folderId: string, targetView: string = 'sub2') => {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, view: targetView, folderId },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  /**
   * 处理返回根目录
   */
  const handleBackToRoot = useCallback(() => {
    const newQuery: Record<string, string | string[] | undefined> = {
      ...router.query,
      view: 'sub2',
    };
    delete newQuery.folderId;
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  return {
    handleFileAction,
    handleFolderNavigation,
    handleBackToRoot,
    isFavorite,
  };
}
