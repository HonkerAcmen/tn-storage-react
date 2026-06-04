import { App } from 'antd';
import { getAdminApiErrorMessage } from '@/utils/admin/apiError';

/**
 * 管理后台统一提示（基于 Ant Design App.useApp）
 */
export function useAdminFeedback() {
  const { message, notification } = App.useApp();

  return {
    success: (content: string) => {
      message.success({ content, duration: 2.5 });
    },
    error: (err: unknown, fallback = '操作失败') => {
      message.error({
        content: getAdminApiErrorMessage(err, fallback),
        duration: 3,
      });
    },
    warn: (content: string) => {
      message.warning({ content, duration: 3 });
    },
    notifyError: (title: string, err: unknown, fallback = '操作失败') => {
      notification.error({
        message: title,
        description: getAdminApiErrorMessage(err, fallback),
        duration: 4,
      });
    },
  };
}
