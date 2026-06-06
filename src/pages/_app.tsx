import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { FileDataProvider } from '@/contexts/FileDataContext';
import { UploadQueueProvider } from '@/contexts/UploadQueueContext';
import { DownloadQueueProvider } from '@/contexts/DownloadQueueContext';
import UploadProgressPanel from '@/components/Upload/UploadProgressPanel';
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { ConfigProvider, App as AntApp, message } from 'antd';
import { useEffect } from 'react';
import { useAuthed } from '@/utils/auth';
import { useRouter } from 'next/router';
import { QueryProvider } from '@/providers/QueryProvider';
import { useGetMySettings } from '@/network/hooks/user';
import { applyThemeSetting } from '@/utils/theme';
import { buildAntTheme } from '@/utils/antTheme';

function UserPreferenceBridge({ enabled }: { enabled: boolean }) {
  const { data } = useGetMySettings();
  const settings = enabled ? data?.data?.data : undefined;

  useEffect(() => {
    if (!enabled || !settings) {
      document.documentElement.removeAttribute('data-theme');
      return;
    }

    const setting = settings.theme || 'light';
    applyThemeSetting(setting);
  }, [enabled, settings]);

  return null;
}

function AppShell({
  Component,
  pageProps,
  preferenceEnabled,
  skipFileProvider,
}: Pick<AppProps, 'Component' | 'pageProps'> & {
  preferenceEnabled: boolean;
  skipFileProvider: boolean;
}) {
  const { antdLocale } = useLocale();
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  const page = (
    <>
      <UserPreferenceBridge enabled={preferenceEnabled} />
      <Component {...pageProps} />
      {!skipFileProvider ? <UploadProgressPanel /> : null}
    </>
  );

  return (
    <ConfigProvider locale={antdLocale} theme={buildAntTheme(isDark)}>
      <AntApp>
        {skipFileProvider ? (
          page
        ) : (
          <UploadQueueProvider>
            <DownloadQueueProvider>
              <FileDataProvider>{page}</FileDataProvider>
            </DownloadQueueProvider>
          </UploadQueueProvider>
        )}
      </AntApp>
    </ConfigProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';
  const isVisitorPage = router.pathname === '/visitor';
  const isAdminLoginPage = router.pathname === '/admin/login';
  const isAdminPage = router.pathname.startsWith('/admin') && !isAdminLoginPage;
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

  // 路由守卫（管理后台 /admin 有独立鉴权，不在此处理）
  useEffect(() => {
    if (isAdminPage || isAdminLoginPage) return;
    if (isLoginPage && authed) {
      const redirect =
        typeof router.query.redirect === 'string' ? router.query.redirect : '/';
      if (redirect.startsWith('/admin')) {
        router.replace('/admin');
        return;
      }
      router.replace(redirect);
    }
    if (isVisitorPage && authed) {
      router.push('/');
    }
  }, [
    router,
    isLoginPage,
    isVisitorPage,
    isAdminPage,
    isAdminLoginPage,
    authed,
  ]);

  const skipFileProvider = isAdminPage || isAdminLoginPage;
  const localeEnabled =
    !isLoginPage && !isVisitorPage && !skipFileProvider && authed;

  return (
    <QueryProvider>
      <LocaleProvider enabled={localeEnabled}>
        <AppShell
          Component={Component}
          pageProps={pageProps}
          preferenceEnabled={localeEnabled}
          skipFileProvider={skipFileProvider}
        />
      </LocaleProvider>
    </QueryProvider>
  );
}
