import { App } from 'antd';
import { getApiErrorMessage } from '@/utils/apiError';

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
        content: getApiErrorMessage(err, fallback),
        duration: 3,
      });
    },
    warn: (content: string) => {
      message.warning({ content, duration: 3 });
    },
    notifyError: (title: string, err: unknown, fallback = '操作失败') => {
      notification.error({
        message: title,
        description: getApiErrorMessage(err, fallback),
        duration: 4,
      });
    },
  };
}
