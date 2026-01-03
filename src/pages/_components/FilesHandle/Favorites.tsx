import { useState, useMemo } from 'react';
import type { JSX } from 'react';
import { Typography, Space, Tag, Empty, Button, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  AiFillFileExcel,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFileUnknown,
  AiFillFileZip,
  AiFillFolder,
  AiFillMuted,
  AiFillPlaySquare,
  AiFillStar,
  AiOutlineFileImage,
  AiOutlineFileJpg,
  AiOutlineEllipsis,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineInfoCircle,
} from 'react-icons/ai';
import { fileDatas } from '../../../mock/index';
import { FileSystemNode } from '../../../types/fileSystem';
import FileDetailsModal from './FileDetailsModal';

const { Text } = Typography;

// 文件图标映射
const ICON_SIZE_CLASS = 'h-6 w-6';
const FILE_ICON_MAP: Record<string, JSX.Element> = {
  txt: <AiFillFileText className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  pdf: <AiFillFilePdf className={`${ICON_SIZE_CLASS} text-red-400`} />,
  jpg: <AiOutlineFileJpg className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  png: <AiOutlineFileImage className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  mp4: <AiFillPlaySquare className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  mp3: <AiFillMuted className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  json: <AiFillFileText className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  zip: <AiFillFileZip className={`${ICON_SIZE_CLASS} text-amber-400`} />,
  doc: <AiFillFileText className={`${ICON_SIZE_CLASS} text-blue-400`} />,
  docx: <AiFillFileText className={`${ICON_SIZE_CLASS} text-blue-400`} />,
  xlsx: <AiFillFileExcel className={`${ICON_SIZE_CLASS} text-green-400`} />,
  other: <AiFillFileUnknown className={`${ICON_SIZE_CLASS} text-gray-400`} />,
};

// 递归获取所有文件
function getAllFiles(node: FileSystemNode): FileSystemNode[] {
  const files: FileSystemNode[] = [];

  if (node.type === 'file') {
    files.push(node);
  } else if (node.type === 'folder' && node.children) {
    node.children.forEach((child) => {
      files.push(...getAllFiles(child));
    });
  }

  return files;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 从 localStorage 获取收藏列表
function getFavoritesFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('favorites');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

// 初始化默认收藏数据
function initializeDefaultFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  const allFiles = getAllFiles(fileDatas);
  const defaultFavorites = allFiles.slice(0, 5).map((file) => file.id);
  saveFavoritesToStorage(defaultFavorites);
  return defaultFavorites;
}

// 保存收藏列表到 localStorage
function saveFavoritesToStorage(favorites: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

export default function Favorites() {
  // 初始化收藏列表，如果没有数据则使用假数据
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const stored = getFavoritesFromStorage();
    if (stored.length === 0) {
      return initializeDefaultFavorites();
    }
    return stored;
  });

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // 获取所有文件
  const allFiles = useMemo(() => {
    return getAllFiles(fileDatas);
  }, []);

  // 获取收藏的文件
  const favoriteFiles = useMemo(() => {
    return allFiles.filter((file) => favoriteIds.includes(file.id));
  }, [allFiles, favoriteIds]);

  // 处理文件更新
  const handleFileUpdate = (
    fileId: string,
    updates: Partial<FileSystemNode>
  ) => {
    // 这里可以调用 API 更新文件信息
    // 由于使用的是 mock 数据，这里只是显示消息
    message.success('文件信息已更新');
    // 如果需要更新本地状态，可以在这里处理
    console.log('更新文件:', fileId, updates);
  };

  // 取消收藏
  const handleUnfavorite = (fileId: string) => {
    const newFavorites = favoriteIds.filter((id) => id !== fileId);
    setFavoriteIds(newFavorites);
    saveFavoritesToStorage(newFavorites);
    message.success('已取消收藏');
  };

  // 处理文件操作
  const handleFileAction = (action: string, item: FileSystemNode) => {
    switch (action) {
      case 'download':
        message.info(`正在下载 ${item.name}...`);
        // 这里可以调用下载 API
        break;
      case 'share':
        message.info(`正在分享 ${item.name}...`);
        // 这里可以调用分享 API
        break;
      case 'rename':
        message.info(`重命名 ${item.name}...`);
        // 这里可以打开重命名对话框
        break;
      case 'delete':
        message.warning(`删除 ${item.name}...`);
        // 这里可以调用删除 API
        break;
      case 'details':
        setSelectedFile(item);
        setShowDetails(true);
        break;
      default:
        break;
    }
  };

  // 获取文件操作菜单
  const getFileMenuItems = (item: FileSystemNode): MenuProps['items'] => {
    return [
      {
        key: 'download',
        label: (
          <div className="flex items-center space-x-2">
            <AiOutlineDownload className="h-4 w-4" />
            <span>下载</span>
          </div>
        ),
        onClick: () => handleFileAction('download', item),
      },
      {
        key: 'share',
        label: (
          <div className="flex items-center space-x-2">
            <AiOutlineShareAlt className="h-4 w-4" />
            <span>分享</span>
          </div>
        ),
        onClick: () => handleFileAction('share', item),
      },
      {
        key: 'rename',
        label: (
          <div className="flex items-center space-x-2">
            <AiOutlineEdit className="h-4 w-4" />
            <span>重命名</span>
          </div>
        ),
        onClick: () => handleFileAction('rename', item),
      },
      {
        key: 'details',
        label: (
          <div className="flex items-center space-x-2">
            <AiOutlineInfoCircle className="h-4 w-4" />
            <span>查看详情</span>
          </div>
        ),
        onClick: () => handleFileAction('details', item),
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
        onClick: () => handleFileAction('delete', item),
      },
    ];
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="ml-4">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-semibold text-[#2e2c34]">收藏</h1>
        <p className="mt-2 text-sm text-gray-500">
          查看和管理你收藏的文件和文件夹
        </p>
      </div>

      {favoriteFiles.length === 0 ? (
        <Empty
          description={
            <div>
              <p className="text-gray-500">还没有收藏任何文件</p>
              <p className="mt-2 text-sm text-gray-400">
                在文件列表中点击星标图标来收藏文件
              </p>
            </div>
          }
          className="py-12"
        />
      ) : (
        <ul className="flex flex-col space-y-2">
          {favoriteFiles.map((item) => (
            <li
              key={item.id}
              className="mb-2 flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {item.type === 'folder' ? (
                  <AiFillFolder className="h-8 w-8 text-amber-400" />
                ) : (
                  <div className="text-gray-400">
                    {FILE_ICON_MAP[item.ext || ''] || FILE_ICON_MAP['other']}
                  </div>
                )}
                <div className="flex flex-col">
                  <Space>
                    <Text className="text-gray-800">
                      {item.name}
                      {item.type === 'file' && item.ext ? `.${item.ext}` : ''}
                    </Text>
                    {item.type === 'file' && (
                      <Tag color="blue">{formatFileSize(item.size)}</Tag>
                    )}
                    {item.type === 'folder' && <Tag color="orange">文件夹</Tag>}
                  </Space>
                  <Space className="mt-1">
                    <Text type="secondary" className="text-xs">
                      创建于 {formatTime(item.createdAt)}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      • 修改于 {formatTime(item.updatedAt)}
                    </Text>
                  </Space>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="text"
                  icon={<AiFillStar className="h-5 w-5 text-amber-400" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfavorite(item.id);
                  }}
                  className="flex items-center justify-center"
                />
                <Dropdown
                  menu={{ items: getFileMenuItems(item) }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={
                      <AiOutlineEllipsis className="h-5 w-5 text-gray-600" />
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center"
                  />
                </Dropdown>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 文件详情模态框 */}
      <FileDetailsModal
        open={showDetails}
        file={selectedFile}
        onClose={() => {
          setShowDetails(false);
          setSelectedFile(null);
        }}
        onUpdate={handleFileUpdate}
      />
    </div>
  );
}

// 导出收藏相关的工具函数，供其他组件使用
export function toggleFavorite(fileId: string): boolean {
  const favorites = getFavoritesFromStorage();
  const index = favorites.indexOf(fileId);

  if (index > -1) {
    // 取消收藏
    favorites.splice(index, 1);
    saveFavoritesToStorage(favorites);
    return false;
  } else {
    // 添加收藏
    favorites.push(fileId);
    saveFavoritesToStorage(favorites);
    return true;
  }
}

export function isFavorite(fileId: string): boolean {
  const favorites = getFavoritesFromStorage();
  return favorites.includes(fileId);
}
