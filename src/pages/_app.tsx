import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { FileDataProvider } from '@/contexts/FileDataContext';
import { ConfigProvider, App as AntApp, message } from 'antd';
import { useEffect } from 'react';
import { isAuthed } from '@/utils/auth';
import { useRouter } from 'next/router';
import { QueryProvider } from '@/providers/QueryProvider';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

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
    if (!isLoginPage && !isAuthed()) {
      router.push('/login');
    }
    if (isLoginPage && isAuthed()) {
      router.push('/');
    }
  }, [router, isLoginPage]);

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
            <Component {...pageProps} />
          </FileDataProvider>
        </AntApp>
      </ConfigProvider>
    </QueryProvider>
  );
}
