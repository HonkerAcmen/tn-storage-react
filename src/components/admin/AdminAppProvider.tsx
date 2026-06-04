import { ReactNode, useEffect } from 'react';
import { App, ConfigProvider } from 'antd';
import { adminTheme } from './adminTheme';

/**
 * 管理后台专用 Ant Design 上下文（浅色），不影响云盘主站
 */
export default function AdminAppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.adminRoute = 'true';
    document.documentElement.removeAttribute('data-theme');
    return () => {
      delete document.documentElement.dataset.adminRoute;
    };
  }, []);

  return (
    <ConfigProvider theme={adminTheme}>
      <App
        message={{
          top: 72,
          duration: 3,
          maxCount: 3,
        }}
        notification={{ placement: 'topRight', duration: 4 }}
      >
        {children}
      </App>
    </ConfigProvider>
  );
}
