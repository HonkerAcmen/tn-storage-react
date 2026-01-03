import { useState, useMemo } from 'react';
import type { JSX } from 'react';
import { Typography, Tabs, Space, Tag } from 'antd';
import type { TabsProps } from 'antd';
import {
  AiFillFileExcel,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFileUnknown,
  AiFillFileZip,
  AiFillFolder,
  AiFillMuted,
  AiFillPlaySquare,
  AiOutlineFileImage,
  AiOutlineFileJpg,
  AiOutlineEllipsis,
  AiOutlineClockCircle,
} from 'react-icons/ai';
import { fileDatas } from '../../../mock/index';
import { FileSystemNode } from '../../../types/fileSystem';

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

// 格式化时间
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function RecentFiles() {
  const [activeTab, setActiveTab] = useState('recent');

  // 获取所有文件
  const allFiles = useMemo(() => {
    return getAllFiles(fileDatas);
  }, []);

  // 最近访问的文件（按 updatedAt 排序）
  const recentlyAccessed = useMemo(() => {
    return [...allFiles]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20);
  }, [allFiles]);

  // 最近创建的文件（按 createdAt 排序）
  const recentlyCreated = useMemo(() => {
    return [...allFiles]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);
  }, [allFiles]);

  // 最近修改的文件（按 updatedAt 排序，排除今天创建的）
  const recentlyModified = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...allFiles]
      .filter((file) => file.createdAt < today)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20);
  }, [allFiles]);

  const tabItems: TabsProps['items'] = [
    {
      key: 'recent',
      label: (
        <Space>
          <AiOutlineClockCircle />
          <span>最近访问</span>
        </Space>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyAccessed.map((item) => (
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
                  </Space>
                  <Space className="mt-1">
                    <Text type="secondary" className="text-xs">
                      {formatTime(item.updatedAt)}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      • 修改于 {item.updatedAt.toLocaleDateString('zh-CN')}
                    </Text>
                  </Space>
                </div>
              </div>
              <AiOutlineEllipsis className="h-5 w-5 cursor-pointer text-gray-600" />
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'created',
      label: (
        <Space>
          <AiOutlineClockCircle />
          <span>最近创建</span>
        </Space>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyCreated.map((item) => (
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
                    {item.type === 'file' && <Tag color="green">新建</Tag>}
                  </Space>
                  <Space className="mt-1">
                    <Text type="secondary" className="text-xs">
                      {formatTime(item.createdAt)}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      • 创建于 {item.createdAt.toLocaleDateString('zh-CN')}
                    </Text>
                  </Space>
                </div>
              </div>
              <AiOutlineEllipsis className="h-5 w-5 cursor-pointer text-gray-600" />
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'modified',
      label: (
        <Space>
          <AiOutlineClockCircle />
          <span>最近修改</span>
        </Space>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyModified.map((item) => (
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
                    {item.type === 'file' && <Tag color="orange">已修改</Tag>}
                  </Space>
                  <Space className="mt-1">
                    <Text type="secondary" className="text-xs">
                      {formatTime(item.updatedAt)}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      • 修改于 {item.updatedAt.toLocaleDateString('zh-CN')}
                    </Text>
                  </Space>
                </div>
              </div>
              <AiOutlineEllipsis className="h-5 w-5 cursor-pointer text-gray-600" />
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="ml-4">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-semibold text-[#2e2c34]">最近的</h1>
        <p className="mt-2 text-sm text-gray-500">
          查看最近访问、创建或修改的文件
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="w-full"
      />
    </div>
  );
}
