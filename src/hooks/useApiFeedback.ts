import { message } from 'antd';
import { getApiErrorMessage } from '@/utils/apiError';

/**
 * 云盘用户端统一提示（解析后端 message 并展示）
 */
export function useApiFeedback() {
  const [messageApi, contextHolder] = message.useMessage();

  return {
    contextHolder,
    success: (content: string) => {
      messageApi.success({ content, duration: 2.5 });
    },
    error: (err: unknown, fallback = '操作失败') => {
      messageApi.error({
        content: getApiErrorMessage(err, fallback),
        duration: 3,
      });
    },
    warn: (content: string) => {
      messageApi.warning({ content, duration: 3 });
    },
  };
}
