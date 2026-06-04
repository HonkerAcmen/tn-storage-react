import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Avatar, Button, Layout, Menu, Typography } from 'antd';
import {
  MdDashboard,
  MdPeople,
  MdStorage,
  MdBackup,
  MdMenuOpen,
  MdMenu,
  MdLogout,
} from 'react-icons/md';
import { HiOutlineCloud } from 'react-icons/hi';
import AdminGuard from './AdminGuard';
import AdminAppProvider from './AdminAppProvider';
import { useAdminUiStore } from '@/store/adminUiStore';
import { useAdminLogout, useAdminProfile } from '@/network/hooks/adminAuth';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin', label: '仪表盘', icon: <MdDashboard /> },
  { key: '/admin/users', label: '用户管理', icon: <MdPeople /> },
  { key: '/admin/storage', label: '存储分析', icon: <MdStorage /> },
  { key: '/admin/backup', label: '数据备份', icon: <MdBackup /> },
];

export default function AdminLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const router = useRouter();
  const collapsed = useAdminUiStore((s) => s.collapsed);
  const toggleCollapsed = useAdminUiStore((s) => s.toggleCollapsed);
  const adminLogout = useAdminLogout();
  const { data: profileRes } = useAdminProfile();
  const profile = profileRes?.data?.data;
  const adminName =
    profile?.display_name || profile?.username || '管理员';

  const selectedKey =
    menuItems.find((item) => router.pathname === item.key)?.key ?? '/admin';

  return (
    <AdminAppProvider>
      <AdminGuard>
        <Layout className="min-h-screen bg-[#f4f5f7]">
          <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={232}
            theme="light"
            className="!bg-white shadow-[1px_0_0_#e8eaed]"
          >
            <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5542f6]/10">
                <HiOutlineCloud className="text-lg text-[#5542f6]" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    伏羲文化
                  </p>
                  <p className="text-xs text-gray-400">管理后台</p>
                </div>
              )}
            </div>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: <Link href={item.key}>{item.label}</Link>,
              }))}
              className="border-none px-2 py-3"
            />
          </Sider>

          <Layout>
            <Header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 !leading-normal">
              <div className="flex items-center gap-3">
                <Button
                  type="text"
                  className="text-gray-500"
                  icon={collapsed ? <MdMenu /> : <MdMenuOpen />}
                  onClick={toggleCollapsed}
                />
                <Typography.Title
                  level={4}
                  className="!mb-0 !font-semibold !text-gray-800"
                >
                  {title}
                </Typography.Title>
              </div>
              <div className="flex items-center gap-2">
                <div className="mr-2 hidden items-center gap-2 sm:flex">
                  <Avatar
                    size={32}
                    className="!bg-[#5542f6]/15 !text-[#5542f6]"
                  >
                    {adminName.charAt(0).toUpperCase()}
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm text-gray-600">
                    {adminName}
                  </span>
                </div>
                <Button
                  type="text"
                  icon={<MdLogout />}
                  className="text-gray-500"
                  onClick={adminLogout}
                >
                  退出
                </Button>
                <Link href="/">
                  <Button type="default" className="border-gray-200">
                    返回云盘
                  </Button>
                </Link>
              </div>
            </Header>

            <Content className="overflow-auto p-6">{children}</Content>
          </Layout>
        </Layout>
      </AdminGuard>
    </AdminAppProvider>
  );
}
