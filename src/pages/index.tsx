import {
  AiFillCloud,
  AiFillFileText,
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineStar,
  AiTwotoneClockCircle,
} from 'react-icons/ai';

import { Menu, MenuProps } from 'antd';

import { JSX, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import RecentFiles from '../components/layout/RecentFiles';

import MyCloud from '../components/layout/MyCloud';

import AllFiles from '../components/layout/AllFiles';
import DeletedFiles from '../components/layout/DeletedFiles';
import Favorites from '../components/layout/Favorites';
import Header from '../components/layout/Header';
import UploadMenu from '@/components/secondaryPage/UploadMenu';
import { useAuthed } from '@/utils/auth';
import { message } from 'antd';

export default function Home() {
  const router = useRouter();
  const [seleId, setSeleId] = useState('sub1');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const authed = useAuthed();
  const [messageApi, contextHolder] = message.useMessage();

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
                router.push('/login');
                return;
              }
              setShowUploadModal(true);
            }}
            className="relative mt-6 mb-6 flex h-12 w-[90%] cursor-pointer items-center justify-center rounded-sm border border-gray-200 text-[16px] text-gray-600 transition duration-150 hover:bg-gray-100"
          >
            <AiOutlineCloudUpload className="mr-2 ml-2 flex h-5 w-5 flex-1" />
            <p className="flex flex-2">上传文件</p>
          </div>

          {authed ? (
            <Menu
              onClick={onClick}
              selectedKeys={[currentView]}
              style={{ width: 240 }}
              items={menuItems}
            />
          ) : (
            <div className="mt-4 w-full px-5">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-lg font-semibold text-gray-800">访客模式</p>
                <p className="mt-2 text-sm text-gray-500">
                  访客无需登录即可访问首页，但上传、收藏、回收站和个人数据需要登录。
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    href="/login"
                    className="rounded-lg bg-[#5542f6] px-4 py-2 text-sm text-white"
                  >
                    登录
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700"
                  >
                    注册
                  </Link>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* 主内容区 */}
        <main className="bg-white">
          {authed ? (
            renderMap[currentView] ?? <div>未知选项</div>
          ) : (
            <VisitorPanel />
          )}
        </main>
      </div>

      {/* 上传模态框 */}
      <UploadMenu
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
}

function VisitorPanel() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <h1 className="text-4xl font-semibold text-[#2e2c34]">TNStorage</h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          当前为访客模式。你可以直接浏览首页和系统介绍，但上传文件、收藏、最近记录、
          个人主页和回收站等能力需要登录后使用。
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <VisitorCard title="访客" desc="无需登录即可进入页面" />
          <VisitorCard title="普通用户" desc="可上传、下载、收藏、分享和删除自己的文件" />
          <VisitorCard title="管理员" desc="可在权限页面调整其他用户身份" />
        </div>
      </div>
    </div>
  );
}

function VisitorCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
