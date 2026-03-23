import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { FileDataProvider } from '@/contexts/FileDataContext';
import { ConfigProvider, App as AntApp, message } from 'antd';
import { useEffect } from 'react';
import { useAuthed } from '@/utils/auth';
import { useRouter } from 'next/router';
import { QueryProvider } from '@/providers/QueryProvider';
import { useGetMySettings } from '@/network/hooks/user';

function UserPreferenceBridge({ enabled }: { enabled: boolean }) {
  const { data } = useGetMySettings();
  const settings = enabled ? data?.data?.data : undefined;

  useEffect(() => {
    if (!enabled || !settings) {
      document.documentElement.removeAttribute('lang');
      document.documentElement.removeAttribute('data-theme');
      return;
    }

    document.documentElement.lang = settings.language || 'zh-CN';
    document.documentElement.dataset.theme = settings.theme || 'system';
  }, [enabled, settings]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';
  const authed = useAuthed();

  // 配置 message
  useEffect(() => {
    message.config({
      top: 100,
      duration: 2,
      maxCount: 3,
      rtl: false,
    });
  }, []);

  // 路由守卫
  useEffect(() => {
    if (isLoginPage && authed) {
      router.push('/');
    }
  }, [router, isLoginPage, authed]);

  return (
    <QueryProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#5542f6',
            colorSuccess: '#52c41a',
            colorWarning: '#faad14',
            colorError: '#ff4d4f',
            colorInfo: '#5542f6',
            borderRadius: 6,
          },
          components: {
            Button: {
              primaryColor: '#ffffff',
            },
            Menu: {
              itemSelectedBg: '#EBEBEB',
              itemSelectedColor: '#3B3B3B',
              itemActiveBg: '#DEDEDE',
              itemHeight: 50,
              itemColor: '#2e2c34',
            },
          },
        }}
      >
        <AntApp>
          <FileDataProvider>
            <UserPreferenceBridge enabled={!isLoginPage && authed} />
            <Component {...pageProps} />
          </FileDataProvider>
        </AntApp>
      </ConfigProvider>
    </QueryProvider>
  );
}
