import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Empty, Button, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  AiFillStar,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineInfoCircle,
} from 'react-icons/ai';
import { FileSystemNode } from '@/types/fileSystem';
import FileDetailsModal from './FileDetailsModal';
import FileListItem from '@/components/FileListItem';
import { useFileActions, useFileMenu, useFavorites } from '@/features/files/hooks';
import { formatDate } from '@/utils/format/formatters';
import { useFileData } from '@/contexts/FileDataContext';

export default function Favorites() {
  const router = useRouter();
  const { favoriteIds, removeFavorite } = useFavorites();
  const { allFiles, updateFile } = useFileData();
  const { handleFileAction, handleFolderNavigation } = useFileActions();
  const { getFileMenuItems } = useFileMenu();

  // 处理文件夹点击 - 导航到"所有文件"视图
  const handleFolderClick = (folderId: string) => {
    handleFolderNavigation(folderId, 'sub2');
  };

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // 获取收藏的文件
  const favoriteFiles = useMemo(() => {
    return allFiles.filter((file) => favoriteIds.includes(file.id));
  }, [allFiles, favoriteIds]);

  // 处理文件更新
  const handleFileUpdate = async (
    fileId: string,
    updates: Partial<FileSystemNode>
  ) => {
    try {
      await updateFile(fileId, updates);
      message.success('文件信息已更新');
    } catch {
      message.error('更新文件失败');
    }
  };

  // 取消收藏
  const handleUnfavorite = (fileId: string) => {
    removeFavorite(fileId);
    message.success('已取消收藏');
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
        <ul className="mr-8 flex flex-col space-y-2">
          {favoriteFiles.map((item) => (
            <FileListItem
              key={item.id}
              file={item}
              menuItems={getFileMenuItems(item, {
                onDetailsOpen: (file: FileSystemNode) => {
                  setSelectedFile(file);
                  setShowDetails(true);
                },
                onFolderNavigate: handleFolderClick,
              })}
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
              onClick={() => {
                if (item.type === 'folder') {
                  handleFolderClick(item.id);
                }
              }}
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
