import { Form, Input, Modal } from 'antd';
import { useAdminChangePassword } from '@/network/hooks/adminStaff';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';

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
  }>();
  const newPassword = Form.useWatch('newPassword', form) ?? '';
  const changePassword = useAdminChangePassword();
  const feedback = useAdminFeedback();

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      await changePassword.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      feedback.success('密码修改成功');
      form.resetFields();
      onClose();
    } catch (err) {
      feedback.error(err, '密码修改失败');
    }
  };

  return (
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
      </Form>
    </Modal>
  );
}
