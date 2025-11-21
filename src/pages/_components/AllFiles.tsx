import Modal from '@/components/Modal';
import { FileNode, FileSystemNode } from '@/types/fileSystem';
import { Breadcrumb } from 'antd';
import { useRouter } from 'next/router';
import { JSX, useState } from 'react';
import {
  AiFillFileExcel,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFileUnknown,
  AiFillFileZip,
  AiFillFolder,
  AiFillMuted,
  AiFillPlaySquare,
  AiOutlineAppstore,
  AiOutlineCaretDown,
  AiOutlineFileImage,
  AiOutlineFileJpg,
  AiOutlineMenu,
} from 'react-icons/ai';

interface MenuItemNameProps {
  key: number;
  name: string;
  icon: unknown;
}

export default function AllFiles() {
  const [seleMenuItem, setSeleMenuItem] = useState(false);
  const [seleRadioItem, setSeleRadioItem] = useState(0);

  const router = useRouter();

  const [MenuItemName, setMenuItemName] = useState<MenuItemNameProps>({
    key: 1,
    name: '最新添加',
    icon: <AiOutlineAppstore />,
  });
  const MenuItemsName: MenuItemNameProps[] = [
    {
      key: 1,
      name: '最新添加',
      icon: <AiOutlineAppstore />,
    },
    {
      key: 2,
      name: '最旧添加',
      icon: <AiOutlineAppstore />,
    },
    {
      key: 3,
      name: '名称',
      icon: <AiOutlineAppstore />,
    },
    {
      key: 4,
      name: '类型',
      icon: <AiOutlineAppstore />,
    },
  ];

  // 生成假的文件系统数据
  const fileDatas: FileSystemNode[] = [
    {
      id: '1',
      name: '项目文档',
      createdAt: new Date('2025-01-10T09:20:30'),
      updatedAt: new Date('2025-03-15T14:40:20'),
      type: 'folder',
      children: [
        {
          id: '1-1',
          name: '需求规格说明书',
          type: 'file',
          size: 89600, // 约87.5KB
          ext: 'docx',
          createdAt: new Date('2025-01-12T10:15:00'),
          updatedAt: new Date('2025-02-20T16:30:45'),
        },
        {
          id: '1-2',
          name: '技术架构设计',
          type: 'file',
          size: 122880, // 120KB
          ext: 'pdf',
          createdAt: new Date('2025-01-18T09:30:10'),
          updatedAt: new Date('2025-03-10T11:25:30'),
        },
        {
          id: '1-3',
          name: '会议纪要',
          type: 'folder',
          createdAt: new Date('2025-01-20T15:00:00'),
          updatedAt: new Date('2025-03-12T10:05:15'),
          children: [
            {
              id: '1-3-1',
              name: '第一次需求评审',
              type: 'file',
              size: 40960, // 40KB
              ext: 'txt',
              createdAt: new Date('2025-01-21T09:00:00'),
              updatedAt: new Date('2025-01-21T10:15:20'),
            },
            {
              id: '1-3-2',
              name: '架构评审会议',
              type: 'file',
              size: 61440, // 60KB
              ext: 'docx',
              createdAt: new Date('2025-02-05T14:20:00'),
              updatedAt: new Date('2025-02-05T16:40:30'),
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: '开发资源',
      createdAt: new Date('2025-01-05T08:10:00'),
      updatedAt: new Date('2025-03-18T15:30:00'),
      type: 'folder',
      children: [
        {
          id: '2-1',
          name: '图片素材',
          type: 'folder',
          createdAt: new Date('2025-01-06T10:00:00'),
          updatedAt: new Date('2025-03-10T12:00:00'),
          children: [
            {
              id: '2-1-1',
              name: 'logo',
              type: 'file',
              size: 262144, // 256KB
              ext: 'png',
              createdAt: new Date('2025-01-06T10:10:00'),
              updatedAt: new Date('2025-02-10T11:20:00'),
            },
            {
              id: '2-1-2',
              name: '背景图',
              type: 'file',
              size: 1048576, // 1MB
              ext: 'jpg',
              createdAt: new Date('2025-01-08T09:00:00'),
              updatedAt: new Date('2025-03-05T14:00:00'),
            },
          ],
        },
        {
          id: '2-2',
          name: '代码库',
          type: 'file',
          size: 5242880, // 5MB
          ext: 'zip',
          createdAt: new Date('2025-01-10T11:00:00'),
          updatedAt: new Date('2025-03-18T15:25:00'),
        },
        {
          id: '2-3',
          name: '依赖包',
          type: 'file',
          size: 10485760, // 10MB
          ext: 'tar',
          createdAt: new Date('2025-01-12T13:00:00'),
          updatedAt: new Date('2025-03-15T16:00:00'),
        },
      ],
    },
    {
      id: '3',
      name: '音视频文件',
      createdAt: new Date('2025-02-01T14:00:00'),
      updatedAt: new Date('2025-03-20T10:00:00'),
      type: 'folder',
      children: [
        {
          id: '3-1',
          name: '宣传音频',
          type: 'file',
          size: 12800, // 与示例中一致的大小
          ext: 'mp3',
          createdAt: new Date('2025-02-02T09:00:00'),
          updatedAt: new Date('2025-02-05T11:00:00'),
        },
        {
          id: '3-2',
          name: '产品演示',
          type: 'file',
          size: 52428800, // 50MB
          ext: 'mp4',
          createdAt: new Date('2025-02-10T15:00:00'),
          updatedAt: new Date('2025-03-19T14:30:00'),
        },
        {
          id: '3-3',
          name: '背景音乐',
          type: 'folder',
          createdAt: new Date('2025-02-15T10:00:00'),
          updatedAt: new Date('2025-03-10T13:00:00'),
          children: [
            {
              id: '3-3-1',
              name: '轻松旋律',
              type: 'file',
              size: 204800, // 200KB
              ext: 'wav',
              createdAt: new Date('2025-02-15T10:10:00'),
              updatedAt: new Date('2025-02-20T12:00:00'),
            },
            {
              id: '3-3-2',
              name: '科技感音效',
              type: 'file',
              size: 102400, // 100KB
              ext: 'mp3',
              createdAt: new Date('2025-02-18T09:00:00'),
              updatedAt: new Date('2025-03-01T11:00:00'),
            },
          ],
        },
      ],
    },
    {
      id: '4',
      name: '临时文件',
      createdAt: new Date('2025-03-01T10:00:00'),
      updatedAt: new Date('2025-03-20T09:00:00'),
      type: 'folder',
      children: [
        {
          id: '4-1',
          name: '数据统计',
          type: 'file',
          size: 73728, // 72KB
          ext: 'xlsx',
          createdAt: new Date('2025-03-02T11:00:00'),
          updatedAt: new Date('2025-03-15T10:00:00'),
        },
        {
          id: '4-2',
          name: '测试日志',
          type: 'file',
          size: 153600, // 150KB
          ext: 'log',
          createdAt: new Date('2025-03-10T14:00:00'),
          updatedAt: new Date('2025-03-20T08:30:00'),
        },
      ],
    },
    {
      id: '5',
      name: '架构评审会议',
      type: 'file',
      size: 61440, // 60KB
      ext: 'xlsx',
      createdAt: new Date('2025-02-05T14:20:00'),
      updatedAt: new Date('2025-02-05T16:40:30'),
    },
  ];

  const randerMap: Record<string, JSX.Element> = {
    txt: <AiFillFileText className="h-20 w-20 text-gray-400" />,
    pdf: <AiFillFilePdf className="h-20 w-20 text-red-400" />,
    jpg: <AiOutlineFileJpg className="h-20 w-20 text-gray-400" />,
    png: <AiOutlineFileImage className="h-20 w-20 text-gray-400" />,
    mp4: <AiFillPlaySquare className="h-20 w-20 text-gray-400" />,
    mp3: <AiFillMuted className="h-20 w-20 text-gray-400" />,
    json: <AiFillFileText className="h-20 w-20 text-gray-400" />,
    zip: <AiFillFileZip className="h-20 w-20 text-amber-400" />,
    doc: <AiFillFileText className="h-20 w-20 text-gray-400" />,
    docx: <AiFillFileText className="h-20 w-20 text-gray-400" />,
    wav: <AiFillFileText className="h-20 w-20 text-gray-400" />,
    tar: <AiFillFileZip className="h-20 w-20 text-gray-400" />,
    xlsx: <AiFillFileExcel className="h-20 w-20 text-green-400" />,
    log: <AiFillFileText className="h-20 w-20 text-gray-400" />,
    other: <AiFillFileUnknown className="h-20 w-20 text-gray-400" />,
  };
  function handleChick(item: FileSystemNode) {
    if (item.type === 'folder') {
      router.push(`/drive/folder/${item.id}`);
    } else {
      // 预览逻辑
      console.log('preview');
    }
  }
  return (
    <div>
      {/* 头部 */}
      <div className="mt-4 flex flex-row justify-between p-6">
        <p className="text-3xl font-semibold text-[#2e2c34]">所有文件</p>
        <div className="mr-8 flex flex-row gap-6">
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
                  onClick={() => setMenuItemName(item)}
                >
                  {item.name}
                </li>
              ))}
            </Modal>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <ul className="grid w-full gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        {fileDatas.map((v, i) => (
          <li
            key={i}
            className="flex h-60 w-60 cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 transition duration-150 hover:bg-gray-100"
            onClick={() => handleChick(v)}
          >
            {v.type === 'folder' ? (
              <div className="flex flex-col items-center justify-center">
                <AiFillFolder className="h-20 w-20 text-amber-400" />
                <span className="text-sm text-gray-600">{v.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                {randerMap[v.ext]}
                <span className="text-sm text-gray-600">
                  {v.name}.{v.ext}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
