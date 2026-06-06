import { useState } from 'react';
import { Form, Input, Modal } from 'antd';
import { useAdminChangePassword } from '@/network/hooks/adminStaff';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import CaptchaField from '@/components/auth/CaptchaField';
import EmailChallengeModal from '@/components/verification/EmailChallengeModal';
import { useAdminProfile } from '@/network/hooks/adminAuth';

export default function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm<{
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    captcha?: { captchaId: string; captchaCode: string };
  }>();
  const newPassword = Form.useWatch('newPassword', form) ?? '';
  const changePassword = useAdminChangePassword();
  const feedback = useAdminFeedback();
  const { data: profileRes } = useAdminProfile();
  const adminEmail = profileRes?.data?.data?.email;
  const [challengeOpen, setChallengeOpen] = useState(false);

  const submitWithToken = async (challengeToken: string) => {
    const values = await form.validateFields();
    try {
      await changePassword.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        captchaId: values.captcha?.captchaId,
        captchaCode: values.captcha?.captchaCode,
        challengeToken,
      });
      feedback.success('密码修改成功');
      form.resetFields();
      onClose();
    } catch (err) {
      feedback.error(err, '密码修改失败');
    }
  };

  const handleOk = async () => {
    await form.validateFields();
    setChallengeOpen(true);
  };

  return (
    <>
      <Modal
        title="修改登录密码"
        open={open}
        onCancel={() => {
          form.resetFields();
          onClose();
        }}
        onOk={handleOk}
        confirmLoading={changePassword.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '至少 6 位' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <PasswordStrengthBar password={newPassword} className="mb-4" />
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="captcha"
            label="图形验证码"
            rules={[{ required: true, message: '请完成图形验证码' }]}
          >
            <CaptchaField admin />
          </Form.Item>
        </Form>
      </Modal>
      <EmailChallengeModal
        open={challengeOpen}
        purpose="admin.change_password"
        scope="admin"
        admin
        email={adminEmail}
        title="验证邮箱以修改密码"
        onClose={() => setChallengeOpen(false)}
        onVerified={async (token) => {
          setChallengeOpen(false);
          await submitWithToken(token);
        }}
      />
    </>
  );
}
