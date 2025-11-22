import { FileSystemNode } from '@/types/fileSystem';

export const fileDatas: FileSystemNode[] = [
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
