import { useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Switch, Table, Tag } from 'antd';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  useAdminEmailConfig,
  useAdminVerificationPolicies,
  useSaveAdminEmailConfig,
  useTestAdminEmailConfig,
  useUpdateVerificationPolicy,
} from '@/network/hooks/adminVerification';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminProfile } from '@/network/hooks/adminAuth';

export default function AdminVerificationPage() {
  const feedback = useAdminFeedback();
  const { data: profileRes } = useAdminProfile();
  const { data: emailConfig, isLoading: emailLoading } = useAdminEmailConfig();
  const { data: policies, isLoading: policyLoading } =
    useAdminVerificationPolicies();
  const saveEmailConfig = useSaveAdminEmailConfig();
  const testEmail = useTestAdminEmailConfig();
  const updatePolicy = useUpdateVerificationPolicy();
  const [form] = Form.useForm();
  const [testEmailValue, setTestEmailValue] = useState(
    profileRes?.data?.data?.email ?? '',
  );

  const handleSaveEmail = async () => {
    const values = await form.validateFields();
    try {
      await saveEmailConfig.mutateAsync(values);
      feedback.success('邮件配置已保存');
    } catch (err) {
      feedback.error(err, '保存失败');
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailValue.trim()) {
      feedback.warn('请填写测试收件邮箱');
      return;
    }
    try {
      await testEmail.mutateAsync(testEmailValue.trim());
      feedback.success('测试邮件已发送');
    } catch (err) {
      feedback.error(err, '测试发送失败');
    }
  };

  return (
    <AdminLayout title="验证与安全">
      <div className="space-y-6">
        <Card title="邮件服务（SMTP）" loading={emailLoading}>
          <p className="mb-4 text-sm text-gray-500">
            配置并启用后，系统才能发送邮箱验证码。敏感操作与改密均依赖此服务。
          </p>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              smtp_host: emailConfig?.smtp_host ?? '',
              smtp_port: emailConfig?.smtp_port ?? 587,
              smtp_secure: emailConfig?.smtp_secure ?? false,
              smtp_user: emailConfig?.smtp_user ?? '',
              from_name: emailConfig?.from_name ?? 'TNStorage',
              from_email: emailConfig?.from_email ?? '',
              enabled: emailConfig?.enabled ?? false,
            }}
            key={emailConfig?.updated_at ?? 'empty'}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                name="smtp_host"
                label="SMTP 主机"
                rules={[{ required: true, message: '必填' }]}
              >
                <Input placeholder="smtp.example.com" />
              </Form.Item>
              <Form.Item
                name="smtp_port"
                label="端口"
                rules={[{ required: true, message: '必填' }]}
              >
                <InputNumber className="w-full" min={1} max={65535} />
              </Form.Item>
              <Form.Item name="smtp_user" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="smtp_password"
                label="密码"
                extra={
                  emailConfig?.has_password
                    ? '留空则保持原密码不变'
                    : '首次配置必填'
                }
              >
                <Input.Password placeholder="SMTP 密码" />
              </Form.Item>
              <Form.Item name="from_name" label="发件人名称">
                <Input />
              </Form.Item>
              <Form.Item
                name="from_email"
                label="发件邮箱"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="smtp_secure"
                label="启用 TLS/SSL"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item name="enabled" label="启用邮件服务" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="primary"
                onClick={handleSaveEmail}
                loading={saveEmailConfig.isPending}
              >
                保存配置
              </Button>
              <Input
                style={{ width: 260 }}
                value={testEmailValue}
                onChange={(e) => setTestEmailValue(e.target.value)}
                placeholder="测试收件邮箱"
              />
              <Button onClick={handleTestEmail} loading={testEmail.isPending}>
                发送测试邮件
              </Button>
            </div>
          </Form>
        </Card>

        <Card title="验证策略" loading={policyLoading}>
          <Table
            rowKey="purpose"
            pagination={false}
            dataSource={policies ?? []}
            columns={[
              { title: '用途', dataIndex: 'description', width: 180 },
              { title: '标识', dataIndex: 'purpose', ellipsis: true },
              {
                title: '范围',
                dataIndex: 'scope',
                width: 90,
                render: (scope: string) => (
                  <Tag color={scope === 'admin' ? 'purple' : 'blue'}>
                    {scope === 'admin' ? '管理端' : '云盘'}
                  </Tag>
                ),
              },
              {
                title: '步骤',
                dataIndex: 'steps',
                render: (steps: string[]) => steps.join(' + '),
              },
              {
                title: '启用',
                dataIndex: 'enabled',
                width: 90,
                render: (enabled: boolean, record) => (
                  <Switch
                    checked={enabled}
                    onChange={async (checked) => {
                      try {
                        await updatePolicy.mutateAsync({
                          purpose: record.purpose,
                          enabled: checked,
                        });
                        feedback.success('策略已更新');
                      } catch (err) {
                        feedback.error(err, '更新失败');
                      }
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
