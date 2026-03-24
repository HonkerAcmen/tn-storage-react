import { useCallback } from 'react';
import type { MenuProps } from 'antd';
import {
  AiOutlineCopy,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineInfoCircle,
  AiOutlineFolderOpen,
  AiFillStar,
  AiOutlineStar,
} from 'react-icons/ai';

import { useFileActions } from './useFileActions';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import { useGetMySettings } from '@/network/hooks/user';

/**
 * 文件菜单 Hook
 * 统一生成文件操作菜单
 */
export function useFileMenu(): {
  // 返回值为getFileMenuItems函数
  getFileMenuItems: (
    item: FileSystemTreeNode,
    options?: {
      onDetailsOpen?: (file: FileSystemTreeNode) => void;
      onFolderNavigate?: (folderId: string) => void;
    }
  ) => MenuProps['items'];
} {
  const { handleFileAction, isFavorite } = useFileActions();
  const { data: settingsResponse } = useGetMySettings();
  const settings = settingsResponse?.data?.data;

  /**
   * 获取文件操作菜单项
   */
  const getFileMenuItems = useCallback(
    (
      item: FileSystemTreeNode,
      options?: {
        onDetailsOpen?: (file: FileSystemTreeNode) => void;
        onFolderNavigate?: (folderId: string) => void;
      }
    ): MenuProps['items'] => {
      const isFav = isFavorite(item.UUID);
      const items = [
        item.type === 'file' && (settings?.allow_file_download ?? true)
          ? {
              key: 'download',
              label: (
                <div className="flex items-center space-x-2">
                  <AiOutlineDownload className="h-4 w-4" />
                  <span>下载</span>
                </div>
              ),
              onClick: () => handleFileAction('download', item, options),
            }
          : null,
        item.type === 'file' && settings?.allow_share
          ? {
              key: 'share',
              label: (
                <div className="flex items-center space-x-2">
                  <AiOutlineShareAlt className="h-4 w-4" />
                  <span>分享</span>
                </div>
              ),
              onClick: () => handleFileAction('share', item, options),
            }
          : null,
        {
          key: 'rename',
          label: (
            <div className="flex items-center space-x-2">
              <AiOutlineEdit className="h-4 w-4" />
              <span>重命名</span>
            </div>
          ),
          onClick: () => handleFileAction('rename', item, options),
        },
        {
          key: 'move',
          label: (
            <div className="flex items-center space-x-2">
              <AiOutlineFolderOpen className="h-4 w-4" />
              <span>移动</span>
            </div>
          ),
          onClick: () => handleFileAction('move', item, options),
        },
        {
          key: 'copy',
          label: (
            <div className="flex items-center space-x-2">
              <AiOutlineCopy className="h-4 w-4" />
              <span>复制</span>
            </div>
          ),
          onClick: () => handleFileAction('copy', item, options),
        },
        settings?.allow_favorite ?? true
          ? {
          key: 'favorite',
          label: (
            <div className="flex items-center space-x-2">
              {isFav ? (
                <AiFillStar className="h-4 w-4 text-amber-400" />
              ) : (
                <AiOutlineStar className="h-4 w-4" />
              )}
              <span>{isFav ? '取消收藏' : '添加到收藏'}</span>
            </div>
          ),
          onClick: () => handleFileAction('favorite', item, options),
        }
          : null,
        {
          key: 'details',
          label: (
            <div className="flex items-center space-x-2">
              <AiOutlineInfoCircle className="h-4 w-4" />
              <span>查看详情</span>
            </div>
          ),
          onClick: () => handleFileAction('details', item, options),
        },
        settings?.allow_file_delete ?? true
          ? {
              type: 'divider' as const,
            }
          : null,
        settings?.allow_file_delete ?? true
          ? {
          key: 'delete',
          label: (
            <div className="flex items-center space-x-2 text-red-500">
              <AiOutlineDelete className="h-4 w-4" />
              <span>删除</span>
            </div>
          ),
          danger: true,
          onClick: () => handleFileAction('delete', item, options),
        }
          : null,
      ];
      return items.filter((menuItem) => menuItem !== null);
    },
    [handleFileAction, isFavorite, settings]
  );

  return {
    getFileMenuItems,
  };
}
