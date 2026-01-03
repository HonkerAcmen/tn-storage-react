import { useState, useMemo } from 'react';
import { Empty, Button, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  AiFillStar,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineInfoCircle,
  AiOutlineEllipsis,
} from 'react-icons/ai';
import { fileDatas } from '../../../mock/index';
import { FileSystemNode } from '../../../types/fileSystem';
import FileDetailsModal from './FileDetailsModal';
import FileListItem from '../../../components/FileListItem';
import { useFavorites } from '../../../hooks/useFavorites';
import { getAllFiles } from '../../../utils/fileUtils';
import { formatDate } from '../../../utils/fileUtils';

export default function Favorites() {
  const { favoriteIds, removeFavorite } = useFavorites();

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
    message.success('文件信息已更新');
    console.log('更新文件:', fileId, updates);
  };

  // 取消收藏
  const handleUnfavorite = (fileId: string) => {
    removeFavorite(fileId);
    message.success('已取消收藏');
  };

  // 处理文件操作
  const handleFileAction = (action: string, item: FileSystemNode) => {
    switch (action) {
      case 'download':
        message.info(`正在下载 ${item.name}...`);
        break;
      case 'share':
        message.info(`正在分享 ${item.name}...`);
        break;
      case 'rename':
        message.info(`重命名 ${item.name}...`);
        break;
      case 'delete':
        message.warning(`删除 ${item.name}...`);
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
            <FileListItem
              key={item.id}
              file={item}
              menuItems={getFileMenuItems(item)}
              showSize
              showType
              showTime
              timeValue={`创建于 ${formatDate(item.createdAt)} • 修改于 ${formatDate(item.updatedAt)}`}
              actions={
                <Button
                  type="text"
                  icon={<AiFillStar className="h-5 w-5 text-amber-400" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfavorite(item.id);
                  }}
                  className="flex items-center justify-center"
                />
              }
            />
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
