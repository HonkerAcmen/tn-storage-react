import { useCallback } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/router';
import { useFavorites } from './useFavorites';
import { useDeletedFiles } from './useDeletedFiles';
import { useFileData } from '@/contexts/FileDataContext';
import * as fileOperations from '@/features/files/services/fileOperations';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import { useGetMySettings } from '@/network/hooks/user';

/**
 * 文件操作 Hook
 * 统一管理所有文件操作逻辑
 */
export function useFileActions() {
  const [messageApi] = message.useMessage();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addDeletedFile } = useDeletedFiles();
  const { updateFile } = useFileData();
  const { data: settingsResponse } = useGetMySettings();
  const settings = settingsResponse?.data?.data;

  /**
   * 处理文件操作
   */
  const handleFileAction = useCallback(
    (
      action: string,
      item: FileSystemTreeNode,
      options?: {
        onDetailsOpen?: (file: FileSystemTreeNode) => void;
        onFolderNavigate?: (folderId: string) => void;
      }
    ) => {
      switch (action) {
        case 'download':
          void fileOperations.downloadFile(item);
          break;
        case 'share':
          if (!(settings?.allow_share ?? false)) {
            messageApi.error('当前账户未开启分享权限');
            break;
          }
          void fileOperations.shareFile(
            item,
            settings?.share_notification ?? true
          );
          break;
        case 'rename':
          fileOperations.renameFile(item, updateFile, messageApi);
          break;
        case 'delete':
          // 先添加到已删除列表
          addDeletedFile(item.UUID, item.type);
          break;
        case 'details':
          options?.onDetailsOpen?.(item);
          break;
        case 'favorite': {
          const wasFavorite = isFavorite(item.UUID);
          void toggleFavorite(item.UUID)
            .then((isNowFavorite) => {
              messageApi.success(isNowFavorite ? '已添加到收藏' : '已取消收藏');
            })
            .catch(() => {
              messageApi.error(wasFavorite ? '取消收藏失败' : '收藏失败');
            });
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
    [
      updateFile,
      messageApi,
      addDeletedFile,
      isFavorite,
      settings,
      toggleFavorite,
    ]
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
