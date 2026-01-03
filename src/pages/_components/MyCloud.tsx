import { useState, useMemo } from 'react';
import { Button, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  AiFillCustomerService,
  AiFillFile,
  AiFillFileImage,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFolder,
  AiFillPicture,
  AiFillPlaySquare,
  AiFillStar,
  AiFillVideoCamera,
  AiOutlineEllipsis,
  AiOutlineStar,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineInfoCircle,
} from 'react-icons/ai';
import EChart from '@/components/Echart';
import { useFileData } from '../../contexts/FileDataContext';
import { useFavorites } from '../../hooks/useFavorites';
import { useDeletedFiles } from '../../hooks/useDeletedFiles';
import { formatDate, formatFileSize } from '../../utils/fileUtils';
import { getFileIcon } from '../../utils/fileIcons';
import FileDetailsModal from './FilesHandle/FileDetailsModal';
import type { FileSystemNode } from '../../types/fileSystem';

export default function MyCloud() {
  const { allFiles, updateFile } = useFileData();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addDeletedFile } = useDeletedFiles();

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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

  // 获取最近上传的文件（按创建时间排序，取前4个）
  const recentlyUploaded = useMemo(() => {
    return [...allFiles]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4);
  }, [allFiles]);

  // 获取收藏的文件（取前3个）
  const favoriteFiles = useMemo(() => {
    return allFiles
      .filter((file) => isFavorite(file.id))
      .slice(0, 3);
  }, [allFiles, isFavorite]);

  // 根据实际文件数据计算存储统计
  const saveData = useMemo(() => {
    // 只统计文件，不包括文件夹
    const files = allFiles.filter((item) => item.type === 'file');

    // 文件类型分类
    const documentExts = ['txt', 'pdf', 'doc', 'docx', 'json', 'log', 'xlsx', 'zip', 'tar'];
    const imageExts = ['jpg', 'png'];
    const videoExts = ['mp4'];
    const audioExts = ['mp3', 'wav'];

    // 统计各类文件
    const stats = {
      document: { count: 0, size: 0 },
      image: { count: 0, size: 0 },
      video: { count: 0, size: 0 },
      audio: { count: 0, size: 0 },
      other: { count: 0, size: 0 },
    };

    files.forEach((file) => {
      if (!file.ext) {
        stats.other.count++;
        stats.other.size += file.size;
        return;
      }

      if (documentExts.includes(file.ext)) {
        stats.document.count++;
        stats.document.size += file.size;
      } else if (imageExts.includes(file.ext)) {
        stats.image.count++;
        stats.image.size += file.size;
      } else if (videoExts.includes(file.ext)) {
        stats.video.count++;
        stats.video.size += file.size;
      } else if (audioExts.includes(file.ext)) {
        stats.audio.count++;
        stats.audio.size += file.size;
      } else {
        stats.other.count++;
        stats.other.size += file.size;
      }
    });

    return [
      {
        key: 1,
        name: '文件',
        fileNumber: stats.document.count,
        fileSize: stats.document.size,
        iconBg: '#e5f6ff',
        icon: <AiFillFileText className="scale-125 text-[#00a5ff]" />,
      },
      {
        key: 2,
        name: '图片',
        fileNumber: stats.image.count,
        fileSize: stats.image.size,
        iconBg: '#eeecfe',
        icon: <AiFillPicture className="scale-125 text-[#5542f6]" />,
      },
      {
        key: 3,
        name: '视频',
        fileNumber: stats.video.count,
        fileSize: stats.video.size,
        iconBg: '#e8f9f6',
        icon: <AiFillPlaySquare className="scale-125 text-[#22c9ad]" />,
      },
      {
        key: 4,
        name: '音频',
        fileNumber: stats.audio.count,
        fileSize: stats.audio.size,
        iconBg: '#fef0f5',
        icon: <AiFillCustomerService className="scale-125 text-[#fa699d]" />,
      },
      {
        key: 5,
        name: '其他',
        fileNumber: stats.other.count,
        fileSize: stats.other.size,
        iconBg: '#fff5ec',
        icon: <AiFillFile className="scale-125 text-[#ffa043]" />,
      },
    ];
  }, [allFiles]);

  return (
    <div className="grid w-full gap-6 p-6 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
      {/* ================= 左侧内容 ================= */}
      <div className="col-span-8 flex flex-col space-y-8">
        {/* 活动 */}
        <section>
          <h1 className="py-4 text-3xl font-semibold text-[#2e2c34]">我的云</h1>
          <p className="mb-4 text-sm text-[#2e2c34]">从你的活动来看</p>

          {/* 自适应网格卡片 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyUploaded.map((item) => (
              <div
                key={item.id}
                className="group relative flex h-32 cursor-pointer flex-col rounded-2xl border border-gray-100 p-4 transition duration-175 hover:bg-gray-100"
              >
                <div className="mb-2">
                  {item.type === 'folder' ? (
                    <AiFillFolder className="h-10 w-10 text-amber-400" />
                  ) : (
                    <div className="text-gray-400">
                      {getFileIcon(item.ext, 'small')}
                    </div>
                  )}
                </div>
                <h2 className="text-gray-800 line-clamp-1">{item.name}</h2>
                <span className="text-sm text-gray-600">
                  {formatDate(item.createdAt)}
                </span>
                {/* 右下角功能按钮 */}
                <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Dropdown
                    menu={{ items: getFileMenuItems(item) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<AiOutlineEllipsis className="h-5 w-5 text-gray-600" />}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center"
                    />
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 最近上传 */}
        <section>
          <p className="mb-4 text-sm text-[#2e2c34]">最近上传</p>

          <ul className="flex flex-col">
            {recentlyUploaded.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="group relative mb-2 flex h-20 cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-1 transition hover:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">
                    {item.type === 'folder' ? (
                      <AiFillFolder className="h-8 w-8 text-amber-400" />
                    ) : (
                      getFileIcon(item.ext, 'small')
                    )}
                  </div>
                  <p className="text-gray-700">
                    {item.name}
                    {item.type === 'file' && item.ext ? `.${item.ext}` : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>添加于 {formatDate(item.createdAt)}</span>
                  <div className="flex items-center space-x-1">
                    <AiFillFolder className="text-amber-400" />
                    <span>参考文献</span>
                  </div>
                  {/* 右下角功能按钮 */}
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <Dropdown
                      menu={{ items: getFileMenuItems(item) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<AiOutlineEllipsis className="h-5 w-5 text-gray-600" />}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center"
                      />
                    </Dropdown>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 已收藏 */}
        <section>
          <p className="mb-4 text-sm text-[#2e2c34]">已收藏</p>

          <ul className="flex flex-col divide-y divide-gray-200">
            {favoriteFiles.map((item) => (
              <li
                key={item.id}
                className="group relative mb-2 flex h-16 cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-1 transition duration-150 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {item.type === 'folder' ? (
                    <AiFillFolder className="h-8 w-8 text-amber-400" />
                  ) : (
                    <div className="text-gray-400">
                      {getFileIcon(item.ext, 'small')}
                    </div>
                  )}
                  <p className="text-gray-700">
                    {item.name}
                    {item.type === 'file' && item.ext ? `.${item.ext}` : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <AiFillStar className="mr-2 h-6 w-6 text-amber-400" />
                  {/* 右下角功能按钮 */}
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <Dropdown
                      menu={{ items: getFileMenuItems(item) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<AiOutlineEllipsis className="h-5 w-5 text-gray-600" />}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center"
                      />
                    </Dropdown>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ================= 右侧图表 ================= */}
      <div className="col-span-4 rounded-2xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">存储大小</h2>
        <div
          className="flex h-[200px] items-center justify-center rounded-xl text-gray-400"
          style={{ boxShadow: '0px 0px 5px #eaeaea' }}
        >
          <EChart
            option={{
              tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                  const item = saveData.find((d) => d.name === params.name);
                  if (item) {
                    return `${params.name}<br/>${item.fileNumber} 个文件<br/>${formatFileSize(item.fileSize)}`;
                  }
                  return `${params.name}: ${params.value}`;
                },
              },
              series: [
                {
                  name: '存储大小',
                  type: 'pie',
                  radius: ['40%', '50%'],
                  center: ['50%', '70%'],
                  startAngle: 180,
                  endAngle: 360,
                  data: saveData
                    .filter((item) => item.fileSize > 0) // 只显示有数据的类型
                    .map((item) => ({
                      value: item.fileSize,
                      name: item.name,
                    })),
                },
              ],
            }}
          />
        </div>
        <ul className="mt-4">
          {saveData.map((item, i) => (
            <li
              key={i}
              className={`relative mb-4 flex cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-100 px-4 py-2 transition duration-150 hover:bg-gray-100`}
            >
              <div className="flex">
                <div
                  className={`mr-4 flex h-14 w-14 items-center justify-center rounded-lg`}
                  style={{ backgroundColor: item.iconBg }}
                >
                  {item.icon}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-gray-800">{item.name}</p>
                  <span className="text-gray-500">{item.fileNumber} files</span>
                </div>
              </div>
              <span className="text-gray-600">
                {formatFileSize(item.fileSize)}
              </span>
            </li>
          ))}
        </ul>
      </div>

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
