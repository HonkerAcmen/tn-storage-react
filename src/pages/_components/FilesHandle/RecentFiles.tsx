import { useState, useMemo } from 'react';
import { Tabs, Tag } from 'antd';
import type { TabsProps } from 'antd';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { fileDatas } from '../../../mock/index';
import FileListItem from '../../../components/FileListItem';
import { getAllFiles, formatRelativeTime, formatDate } from '../../../utils/fileUtils';

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

  // 最近上传的文件（按 createdAt 排序）
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
        <span className="flex items-center space-x-2">
          <AiOutlineClockCircle />
          <span>最近访问</span>
        </span>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyAccessed.map((item) => (
            <FileListItem
              key={item.id}
              file={item}
              showSize
              showTime
              timeValue={`${formatRelativeTime(item.updatedAt)} • 修改于 ${formatDate(item.updatedAt)}`}
            />
          ))}
        </ul>
      ),
    },
    {
      key: 'created',
      label: (
        <span className="flex items-center space-x-2">
          <AiOutlineClockCircle />
          <span>最近上传</span>
        </span>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyCreated.map((item) => (
            <FileListItem
              key={item.id}
              file={item}
              showSize
              showTime
              timeValue={`${formatRelativeTime(item.createdAt)} • 上传于 ${formatDate(item.createdAt)}`}
              actions={
                item.type === 'file' && (
                  <Tag color="green" className="mr-2">
                    新上传
                  </Tag>
                )
              }
            />
          ))}
        </ul>
      ),
    },
    {
      key: 'modified',
      label: (
        <span className="flex items-center space-x-2">
          <AiOutlineClockCircle />
          <span>最近修改</span>
        </span>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyModified.map((item) => (
            <FileListItem
              key={item.id}
              file={item}
              showSize
              showTime
              timeValue={`${formatRelativeTime(item.updatedAt)} • 修改于 ${formatDate(item.updatedAt)}`}
              actions={
                item.type === 'file' && (
                  <Tag color="orange" className="mr-2">
                    已修改
                  </Tag>
                )
              }
            />
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
          查看最近访问、上传或修改的文件
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
