import { useEffect, useState } from 'react';
import { Form, Input, Modal } from 'antd';
import CaptchaField from '@/components/auth/CaptchaField';
import {
  useSendEmailOtp,
  useVerifyEmailOtp,
  VerificationPurpose,
} from '@/network/hooks/verification';
import { getApiErrorMessage } from '@/utils/apiError';

interface EmailChallengeModalProps {
  open: boolean;
  purpose: VerificationPurpose;
  scope: 'cloud' | 'admin';
  admin?: boolean;
  email?: string;
  title?: string;
  onClose: () => void;
  onVerified: (challengeToken: string) => void | Promise<void>;
}

export default function EmailChallengeModal({
  open,
  purpose,
  scope,
  admin = false,
  email,
  title = '邮箱安全验证',
  onClose,
  onVerified,
}: EmailChallengeModalProps) {
  const [form] = Form.useForm<{
    captcha: { captchaId: string; captchaCode: string };
    code: string;
  }>();
  const [challengeId, setChallengeId] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const sendOtp = useSendEmailOtp(admin);
  const verifyOtp = useVerifyEmailOtp(admin);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setChallengeId('');
      setCooldown(0);
    }
  }, [open, form]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSend = async () => {
    const captcha = form.getFieldValue('captcha');
    try {
      const result = await sendOtp.mutateAsync({
        purpose,
        scope,
        email,
        captchaId: captcha?.captchaId,
        captchaCode: captcha?.captchaCode,
      });
      setChallengeId(result.challengeId);
      setCooldown(result.cooldownSeconds ?? 60);
    } catch (err) {
      Modal.error({
        title: '发送失败',
        content: getApiErrorMessage(err, '验证码发送失败'),
      });
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (!challengeId) {
      Modal.warning({ title: '请先获取邮箱验证码' });
      return;
    }
    setSubmitting(true);
    try {
      const result = await verifyOtp.mutateAsync({
        challengeId,
        code: values.code,
      });
      await onVerified(result.challengeToken);
      onClose();
    } catch (err) {
      Modal.error({
        title: '验证失败',
        content: getApiErrorMessage(err, '邮箱验证码错误'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      okText="确认验证"
      destroyOnClose
    >
      <p className="mb-4 text-sm text-gray-500">
        为保障账户安全，请完成图形验证码与邮箱验证码校验。
        {email ? ` 验证码将发送至 ${email}` : ''}
      </p>
      <Form form={form} layout="vertical">
        <Form.Item
          name="captcha"
          label="图形验证码"
          rules={[{ required: true, message: '请完成图形验证码' }]}
        >
          <CaptchaField admin={admin} />
        </Form.Item>
        <Form.Item label="邮箱验证码" required>
          <div className="flex gap-2">
            <Form.Item
              name="code"
              noStyle
              rules={[{ required: true, message: '请输入邮箱验证码' }]}
            >
              <Input placeholder="6 位验证码" maxLength={6} />
            </Form.Item>
            <button
              type="button"
              className="shrink-0 rounded border border-gray-200 px-3 text-sm text-[#5542f6] disabled:text-gray-400"
              disabled={cooldown > 0 || sendOtp.isPending}
              onClick={handleSend}
            >
              {cooldown > 0 ? `${cooldown}s` : '发送验证码'}
            </button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
