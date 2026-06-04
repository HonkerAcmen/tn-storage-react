import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Result, Spin } from 'antd';
import { isAdminAuthed, clearAdminSession } from '@/utils/auth/adminSession';
import { useAdminProfile } from '@/network/hooks/adminAuth';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const authed = ready && isAdminAuthed();
  const { isLoading, isError, refetch } = useAdminProfile(authed);

  useEffect(() => {
    if (!ready) return;
    if (!isAdminAuthed()) {
      router.replace('/admin/login');
    }
  }, [ready, router]);

  if (!ready || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <Spin size="large" tip={authed ? undefined : '正在跳转登录...'} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <Spin size="large" tip="正在验证管理员身份..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Result
          status="error"
          title="管理员会话无效"
          subTitle="请重新登录管理后台"
          extra={
            <Button
              type="primary"
              onClick={() => {
                clearAdminSession();
                router.replace('/admin/login');
              }}
            >
              重新登录
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
