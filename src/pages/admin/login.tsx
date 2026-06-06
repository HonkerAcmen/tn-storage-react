import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Button, Form, Input, Spin } from 'antd';
import { AiOutlineLock, AiOutlineMail } from 'react-icons/ai';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import Link from 'next/link';
import { isAdminAuthed } from '@/utils/auth/adminSession';
import { useAdminLogin, useAdminProfile } from '@/network/hooks/adminAuth';
import { LoginRequest } from '@/network/types/Request/auth';
import { getAdminApiErrorMessage } from '@/utils/admin/apiError';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import AdminAppProvider from '@/components/admin/AdminAppProvider';
import CaptchaField from '@/components/auth/CaptchaField';

function AdminLoginForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const adminLogin = useAdminLogin();
  const feedback = useAdminFeedback();
  const authed = ready && isAdminAuthed();
  const { isLoading: profileLoading, isSuccess: profileOk } =
    useAdminProfile(authed);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !authed || profileLoading) return;
    if (profileOk) {
      router.replace('/admin');
    }
  }, [ready, authed, profileLoading, profileOk, router]);

  const onFinish = async (
    values: LoginRequest & {
      captcha?: { captchaId: string; captchaCode: string };
    },
  ) => {
    setLoginError(null);
    setLoading(true);
    try {
      await adminLogin.mutateAsync({
        email: values.email,
        password: values.password,
        captchaId: values.captcha?.captchaId,
        captchaCode: values.captcha?.captchaCode,
      });
      feedback.success('登录成功，正在进入管理后台…');
      router.replace('/admin');
    } catch (err) {
      const msg = getAdminApiErrorMessage(err, '邮箱或密码错误');
      setLoginError(msg);
      feedback.error(err, '邮箱或密码错误');
    } finally {
      setLoading(false);
    }
  };

  if (!ready || (authed && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <Spin size="large" />
      </div>
    );
  }

  if (authed && profileOk) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <Spin size="large" tip="正在进入管理后台..." />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f5f7] px-4">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#5542f6]/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#22d3ee]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px] rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5542f6]/10">
            <HiOutlineShieldCheck className="text-3xl text-[#5542f6]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            管理后台登录
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            伏羲文化数据云盘 · 管理员独立账号
          </p>
        </div>

        {loginError && (
          <Alert
            type="error"
            showIcon
            closable
            className="mb-4"
            message="登录失败"
            description={loginError}
            onClose={() => setLoginError(null)}
          />
        )}

        <Form
          name="admin-login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="管理员邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<AiOutlineMail className="text-gray-400" />}
              placeholder="admin@fuxi.local"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
            validateStatus={loginError ? 'error' : undefined}
            help={loginError ? '请检查邮箱和密码后重试' : undefined}
          >
            <Input.Password
              prefix={<AiOutlineLock className="text-gray-400" />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item
            name="captcha"
            label="图形验证码"
            rules={[{ required: true, message: '请完成图形验证码' }]}
          >
            <CaptchaField admin />
          </Form.Item>

          <Form.Item className="mb-2">
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录管理后台
            </Button>
          </Form.Item>
        </Form>

        <p className="mt-6 text-center text-xs text-gray-400">
          管理账号与云盘用户完全独立，此页不支持注册
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/" className="text-[#5542f6] hover:underline">
            返回云盘首页
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminAppProvider>
      <AdminLoginForm />
    </AdminAppProvider>
  );
}
