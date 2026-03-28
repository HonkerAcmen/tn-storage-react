import {
  AiFillCloud,
  AiFillFileText,
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineStar,
  AiTwotoneClockCircle,
} from 'react-icons/ai';

import { Menu, MenuProps } from 'antd';

import { JSX, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';

import RecentFiles from '../components/layout/RecentFiles';

import MyCloud from '../components/layout/MyCloud';

import AllFiles from '../components/layout/AllFiles';
import DeletedFiles from '../components/layout/DeletedFiles';
import Favorites from '../components/layout/Favorites';
import Header from '../components/layout/Header';
import UploadMenu from '@/components/secondaryPage/UploadMenu';
import { useAuthed, useHydrated } from '@/utils/auth';
import { message } from 'antd';

export default function Home() {
  const router = useRouter();
  const [seleId, setSeleId] = useState('sub1');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const authed = useAuthed();
  const hydrated = useHydrated();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (hydrated && !authed) {
      router.replace('/visitor');
    }
  }, [hydrated, authed, router]);

  const currentView = useMemo(() => {
    if (router.query.view && typeof router.query.view === 'string') {
      return router.query.view;
    }
    return seleId;
  }, [router.query.view, seleId]);

  const menuItems = [
    { key: 'sub1', label: '我的云', icon: <AiFillCloud /> },
    { key: 'sub2', label: '所有文件', icon: <AiFillFileText /> },
    { key: 'sub3', label: '最近的', icon: <AiTwotoneClockCircle /> },
    { key: 'sub4', label: '收藏', icon: <AiOutlineStar /> },
    { key: 'sub5', label: '已删除文件', icon: <AiOutlineDelete /> },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    setSeleId(e.key);
    // 更新 URL 参数
    const newQuery: Record<string, string | string[] | undefined> = {
      ...router.query,
      view: e.key,
    };
    // 如果切换到非 MyCloud 视图，清除 folderId
    if (e.key !== 'sub1') {
      delete newQuery.folderId;
    }
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const renderMap: Record<string, JSX.Element> = {
    sub1: <MyCloud />,
    sub2: <AllFiles />,
    sub3: <RecentFiles />,
    sub4: <Favorites />,
    sub5: <DeletedFiles />,
  };

  if (!hydrated || !authed) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {contextHolder}
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体区域 */}
      <div className="grid flex-1 grid-cols-[240px_1fr]">
        {/* 左侧边栏 */}
        <aside className="flex flex-col items-center border-r border-gray-200 bg-white">
          <div
            onClick={() => {
              if (!authed) {
                messageApi.info('上传文件需要先登录为普通用户');
                router.push('/login?tab=login');
                return;
              }
              setShowUploadModal(true);
            }}
            className="relative mt-6 mb-6 flex h-12 w-[90%] cursor-pointer items-center justify-center rounded-sm border border-gray-200 text-[16px] text-gray-600 transition duration-150 hover:bg-gray-100"
          >
            <AiOutlineCloudUpload className="mr-2 ml-2 flex h-5 w-5 flex-1" />
            <p className="flex flex-2">上传文件</p>
          </div>

          <Menu
            onClick={onClick}
            selectedKeys={[currentView]}
            style={{ width: 240 }}
            items={menuItems}
          />
        </aside>

        {/* 主内容区 */}
        <main className="bg-white">{renderMap[currentView] ?? <div>未知选项</div>}</main>
      </div>

      {/* 上传模态框 */}
      <UploadMenu
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
}
