import { useCallback } from 'react';
import type { MenuProps } from 'antd';
import {
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineInfoCircle,
  AiFillStar,
  AiOutlineStar,
} from 'react-icons/ai';
import type { FileSystemNode } from '@/types/fileSystem';
import { useFileActions } from './useFileActions';

/**
 * 文件菜单 Hook
 * 统一生成文件操作菜单
 */
export function useFileMenu(): {
  // 返回值为getFileMenuItems函数
  getFileMenuItems: (
    item: FileSystemNode,
    options?: {
      onDetailsOpen?: (file: FileSystemNode) => void;
      onFolderNavigate?: (folderId: string) => void;
    }
  ) => MenuProps['items'];
} {
  const { handleFileAction, isFavorite } = useFileActions();

  /**
   * 获取文件操作菜单项
   */
  const getFileMenuItems = useCallback(
    (
      item: FileSystemNode,
      options?: {
        onDetailsOpen?: (file: FileSystemNode) => void;
        onFolderNavigate?: (folderId: string) => void;
      }
    ): MenuProps['items'] => {
      const isFav = isFavorite(item.id);

      return [
        {
          key: 'download',
          label: (
            <div className="flex items-center space-x-2">
              <AiOutlineDownload className="h-4 w-4" />
              <span>下载</span>
            </div>
          ),
          onClick: () => handleFileAction('download', item, options),
        },
        {
          key: 'share',
          label: (
            <div className="flex items-center space-x-2">
              <AiOutlineShareAlt className="h-4 w-4" />
              <span>分享</span>
            </div>
          ),
          onClick: () => handleFileAction('share', item, options),
        },
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
        },
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
        {
          type: 'divider',
        },
        {
          key: 'delete',
          label: (
            <div className="flex items-center space-x-2 text-red-500">
              <AiOutlineDelete className="h-4 w-4" />
              <span>删除</span>
            </div>
          ),
          danger: true,
          onClick: () => handleFileAction('delete', item, options),
        },
      ];
    },
    [handleFileAction, isFavorite]
  );

  return {
    getFileMenuItems,
  };
}
