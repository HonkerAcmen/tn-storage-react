import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Spin } from 'antd';
import Header from '@/components/layout/Header';
import { downloadSharedFileByToken } from '@/features/share/downloadSharedFile';
import { getApiErrorMessage } from '@/utils/apiError';
import { isAuthed } from '@/utils/auth';

type ShareState = 'checking' | 'downloading' | 'done' | 'error';

export default function ShareDownloadPage() {
  const router = useRouter();
  const tokenParam = router.query.token;
  const token = typeof tokenParam === 'string' ? tokenParam : '';
  const startedRef = useRef(false);

  const [state, setState] = useState<ShareState>('checking');
  const [filename, setFilename] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!router.isReady || !token || startedRef.current) {
      return;
    }

    if (!isAuthed()) {
      void router.replace(`/login?redirect=${encodeURIComponent(`/share/${token}`)}`);
      return;
    }

    startedRef.current = true;
    setState('downloading');

    void downloadSharedFileByToken(token)
      .then((name) => {
        setFilename(name);
        setState('done');
      })
      .catch((err) => {
        setErrorMessage(getApiErrorMessage(err, '下载失败'));
        setState('error');
      });
  }, [router, token]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          {state === 'checking' || state === 'downloading' ? (
            <>
              <Spin size="large" />
              <p className="mt-4 text-gray-600">
                {state === 'checking' ? '正在验证登录状态…' : '正在下载分享文件…'}
              </p>
            </>
          ) : null}

          {state === 'done' ? (
            <>
              <p className="text-lg font-medium text-gray-800">下载已开始</p>
              <p className="mt-2 text-sm text-gray-500">{filename}</p>
              <Button
                type="primary"
                className="mt-6"
                onClick={() => void router.push('/')}
              >
                返回我的云盘
              </Button>
            </>
          ) : null}

          {state === 'error' ? (
            <>
              <p className="text-lg font-medium text-red-600">无法下载</p>
              <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => void router.push('/')}>返回首页</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    startedRef.current = false;
                    setState('checking');
                    void router.replace(`/share/${token}`);
                  }}
                >
                  重试
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
