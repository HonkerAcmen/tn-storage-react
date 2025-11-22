import Modal from '@/components/Modal';
import { fileDatas } from '@/mock';
import { FileNode } from '@/types/fileSystem';
import { Breadcrumb } from 'antd'; // 已引入，现在我们将使用它
import { useRouter } from 'next/router';
import { JSX, useState } from 'react';
import { FolderNode } from '../../types/fileSystem';
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
import FolderPage from './FolderPage';

interface MenuItemNameProps {
  key: number;
  name: string;
  icon: unknown;
}

export default function AllFiles() {
  const [seleMenuItem, setSeleMenuItem] = useState(false);
  // 0: 列表模式, 1: 网格模式 (通常 0 代表 list, 1 代表 grid，根据你的图标逻辑调整)
  const [seleRadioItem, setSeleRadioItem] = useState(1);

  const router = useRouter();
  const folderId = router.query.folderId;

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

  // 生成假的文件系统数据
  type withOutChildren = Omit<FolderNode, 'children'>;
  type newFileSystemType = withOutChildren | FileNode;

  const newFileDatas: newFileSystemType[] = fileDatas.map((item) =>
    item.type === 'folder' ? (({ children, ...rest }) => rest)(item) : item
  );

  const renderMap: Record<string, JSX.Element> = {
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

  // 修复拼写错误: handleChick -> handleClick
  function handleClick(item: newFileSystemType) {
    if (item.type === 'folder') {
      // 核心修复：使用 router.pathname 保持当前主路由不变，仅更新参数
      // shallow: true 避免运行 getServerSideProps (根据你的数据获取策略决定是否保留)
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, folderId: item.id },
        },
        undefined,
        { shallow: true }
      );
    } else {
      console.log('preview', item.name);
    }
  }

  // 处理面包屑导航点击
  const handleBreadcrumbClick = () => {
    // 移除 folderId 参数，回到根目录
    const { folderId, ...restQuery } = router.query;
    router.push(
      {
        pathname: router.pathname,
        query: restQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div>
      {/* 头部 Header - 保持不变 */}
      <div className="mt-4 flex flex-row justify-between p-6">
        <div className="flex flex-col">
          <p className="text-3xl font-semibold text-[#2e2c34]">所有文件</p>
          {folderId && (
            <Breadcrumb className="mt-2">
              <Breadcrumb.Item
                onClick={handleBreadcrumbClick}
                className="cursor-pointer transition hover:text-[#5542f6]"
              >
                根目录
              </Breadcrumb.Item>
              <Breadcrumb.Item>当前文件夹 ({folderId})</Breadcrumb.Item>
            </Breadcrumb>
          )}
        </div>

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

      {/* 内容区域 - 路由跳转后 Header 不变，下方内容变化 */}
      {!folderId ? (
        <ul className="grid w-full gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {newFileDatas.map((v, i) => (
            <li
              key={i}
              className="flex h-60 w-60 cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 transition duration-150 hover:bg-gray-100"
              onClick={() => handleClick(v)}
            >
              {v.type === 'folder' ? (
                <div className="flex flex-col items-center justify-center">
                  <AiFillFolder className="h-20 w-20 text-amber-400" />
                  <span className="text-sm text-gray-600">{v.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {renderMap[v.ext] || renderMap['other']}
                  <span className="text-sm text-gray-600">
                    {v.name}.{v.ext}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        /* 这里是子页面渲染逻辑
           建议将 seleRadioItem (视图模式) 传给 FolderPage，
           这样切换到文件夹内也能保持网格/列表样式。
        */
        <FolderPage
          folderId={folderId as string}
          // viewMode={seleRadioItem} // 如果 FolderPage 支持，建议传入
        />
      )}
    </div>
  );
}
