import { Result, Button } from 'antd';
import http from '@/network/http';

export default function NetWorkError() {
  async function sendResponse() {
    await http
      .get('/health')
      .then(() => {
        window.location.href = '/';
      })
      .catch(() => {
        window.location.href = '/networkError';
      });
  }

  return (
    <Result
      status="error"
      title="网络连接失败"
      subTitle="请检查您的网络连接，稍后再试。"
      extra={
        <Button type="primary" onClick={sendResponse}>
          重试
        </Button>
      }
    />
  );
}
