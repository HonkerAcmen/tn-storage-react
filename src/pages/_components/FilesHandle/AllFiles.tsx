import Modal from '@/components/Modal';
import { useState, useMemo } from 'react';
import { Empty, Button, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  AiOutlineAppstore,
  AiOutlineCaretDown,
  AiOutlineMenu,
  AiFillStar,
  AiOutlineStar,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineInfoCircle,
} from 'react-icons/ai';
import { FileSystemNode } from '../../../types/fileSystem';
import FileList from './FileList';
import FileListItem from '../../../components/FileListItem';
import FileDetailsModal from './FileDetailsModal';
import { useFavorites } from '../../../hooks/useFavorites';
import { formatDate } from '../../../utils/fileUtils';
import { useDeletedFiles } from '../../../hooks/useDeletedFiles';
import { useFileData } from '../../../contexts/FileDataContext';

interface MenuItemNameProps {
  key: number;
  name: string;
  icon: unknown;
}

type SortType = 'latest' | 'oldest' | 'name' | 'type';

export default function AllFiles() {
  const [seleMenuItem, setSeleMenuItem] = useState(false);
  // 0: 列表模式, 1: 网格模式
  const [seleRadioItem, setSeleRadioItem] = useState(1);

  const [MenuItemName, setMenuItemName] = useState<MenuItemNameProps>({
    key: 1,
    name: '最新添加',
    icon: <AiOutlineAppstore />,
  });

  const MenuItemsName: MenuItemNameProps[] = [
    { key: 1, name: '最新添加', icon: <AiOutlineAppstore /> },
    { key: 2, name: '最旧添加', icon: <AiOutlineAppstore /> },
    { key: 3, name: '名称', icon: <AiOutlineAppstore /> },
    { key: 4, name: '类型', icon: <AiOutlineAppstore /> },
  ];

  // 收藏和删除文件管理
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addDeletedFile } = useDeletedFiles();

  // 全局文件数据
  const { allFiles, updateFile } = useFileData();

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // 根据分组方式排序文件
  const sortedFiles = useMemo(() => {
    const files = [...allFiles];
    const sortType: SortType =
      MenuItemName.key === 1
        ? 'latest'
        : MenuItemName.key === 2
          ? 'oldest'
          : MenuItemName.key === 3
            ? 'name'
            : 'type';

    switch (sortType) {
      case 'latest':
        return files.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      case 'oldest':
        return files.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
      case 'name':
        return files.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'type':
        return files.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
          }
          if (a.type === 'file' && b.type === 'file') {
            return (a.ext || '').localeCompare(b.ext || '');
          }
          return 0;
        });
      default:
        return files;
    }
  }, [allFiles, MenuItemName.key]);

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
        addDeletedFile(item);
        message.success(`已删除 ${item.name}`);
        break;
      case 'details':
        setSelectedFile(item);
        setShowDetails(true);
        break;
      case 'favorite': {
        const wasFavorite = isFavorite(item.id);
        toggleFavorite(item.id);
        message.success(wasFavorite ? '已取消收藏' : '已添加到收藏');
        break;
      }
      default:
        break;
    }
  };

  // 获取文件操作菜单
  const getFileMenuItems = (item: FileSystemNode): MenuProps['items'] => {
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
        onClick: () => handleFileAction('favorite', item),
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
      {/* 头部 Header */}
      <div className="mt-4 mb-6 flex flex-row items-center justify-between">
        <div className="mb-4 flex flex-col">
          <p className="text-3xl font-semibold whitespace-nowrap text-[#2e2c34]">
            所有文件
          </p>
          <p className="mt-2 text-sm text-gray-500">
            查看和管理所有文件和文件夹
          </p>
        </div>

        <div className="mr-8 flex flex-row gap-6">
          {/* 列表/网格切换 */}
          <div className="flex h-10 w-20 items-center justify-center">
            <div
              onClick={() => setSeleRadioItem(0)}
              className={`flex h-full w-[50%] cursor-pointer items-center justify-center rounded-l-lg border border-gray-200 transition duration-150 hover:bg-gray-200 ${seleRadioItem === 0 ? 'bg-gray-100' : ''}`}
            >
              <AiOutlineMenu />
            </div>
            <div
              onClick={() => setSeleRadioItem(1)}
              className={`${seleRadioItem === 1 ? 'bg-gray-100' : ''} flex h-full w-[50%] cursor-pointer items-center justify-center rounded-r-lg border border-gray-200 transition duration-150 hover:bg-gray-200`}
            >
              <AiOutlineAppstore />
            </div>
          </div>

          {/* 分组方式选择 */}
          <div
            className="relative flex w-64 cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-2"
            tabIndex={0}
            onFocus={() => setSeleMenuItem(!seleMenuItem)}
            onBlur={() => setSeleMenuItem(false)}
          >
            <p className="text-xs text-gray-500">
              分组方式:{' '}
              <span className="ml-2 text-sm text-gray-800">
                {MenuItemName?.name}
              </span>
            </p>
            <AiOutlineCaretDown className="text-gray-500" />

            <Modal
              open={seleMenuItem}
              position={{ top: 'top-10' }}
              size={{ width: 'w-60' }}
              onClose={() => setSeleMenuItem(false)}
              className="animate-fadein"
            >
              {MenuItemsName.map((item) => (
                <li
                  key={item.key}
                  className="w-full list-none rounded-lg p-2 transition duration-150 hover:bg-gray-200"
                  onClick={() => {
                    setMenuItemName(item);
                    setSeleMenuItem(false); // 点击后关闭下拉菜单
                  }}
                >
                  {item.name}
                </li>
              ))}
            </Modal>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      {seleRadioItem === 0 ? (
        // 列表模式
        sortedFiles.length === 0 ? (
          <Empty
            description={
              <div>
                <p className="text-gray-500">暂无文件</p>
                <p className="mt-2 text-sm text-gray-400">
                  上传文件后，文件将显示在这里
                </p>
              </div>
            }
            className="py-12"
          />
        ) : (
          <ul className="mr-8 flex flex-col space-y-2">
            {sortedFiles.map((item) => (
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
                    icon={
                      isFavorite(item.id) ? (
                        <AiFillStar className="h-5 w-5 text-amber-400" />
                      ) : (
                        <AiOutlineStar className="h-5 w-5 text-gray-400" />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileAction('favorite', item);
                    }}
                    className="flex items-center justify-center"
                  />
                }
              />
            ))}
          </ul>
        )
      ) : (
        // 网格模式
        <FileList />
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
