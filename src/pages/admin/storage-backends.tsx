import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Switch,
  Table,
  Tag,
} from 'antd';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import {
  useActivateAdminStorageBackend,
  useAdminStorageBackends,
  useAdminStorageMigrations,
  useCreateAdminStorageBackend,
  useTestAdminStorageBackend,
  useUpdateAdminStorageBackend,
} from '@/network/hooks/admin';
import { StorageBackendPublicView } from '@/network/types/Response/admin';

function statusTag(status: StorageBackendPublicView['status']) {
  if (status === 'connected') {
    return <Tag color="success">已连通</Tag>;
  }
  if (status === 'error') {
    return <Tag color="error">连接失败</Tag>;
  }
  return <Tag>未测试</Tag>;
}

function roleTag(backend: StorageBackendPublicView) {
  if (backend.role === 'active') {
    return <Tag color="blue">主存储</Tag>;
  }
  if (backend.role === 'readonly') {
    return <Tag color="orange">只读保留</Tag>;
  }
  if (backend.is_builtin) {
    return <Tag>本机内置</Tag>;
  }
  return <Tag>待命</Tag>;
}

type BackendFormValues = {
  name: string;
  endpoint: string;
  port?: number;
  region?: string;
  use_ssl: boolean;
  force_path_style: boolean;
  access_key?: string;
  secret_key?: string;
};

export default function AdminStorageBackendsPage() {
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const { data, isLoading, isError, refetch } = useAdminStorageBackends();
  const { data: migrationsRes } = useAdminStorageMigrations();
  const createBackend = useCreateAdminStorageBackend();
  const updateBackend = useUpdateAdminStorageBackend();
  const testBackend = useTestAdminStorageBackend();
  const activateBackend = useActivateAdminStorageBackend();
  const [form] = Form.useForm<BackendFormValues>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StorageBackendPublicView | null>(null);
  const [lastTestMessage, setLastTestMessage] = useState<string | null>(null);

  const backends = data?.data?.data ?? [];
  const connectedOss = useMemo(
    () =>
      backends.filter(
        (item) => !item.is_builtin && item.status === 'connected',
      ),
    [backends],
  );
  const completedMigrateTargets = useMemo(() => {
    const jobs = migrationsRes?.data?.data ?? [];
    return new Set(
      jobs
        .filter((job) => job.mode === 'migrate' && job.status === 'completed')
        .map((job) => job.target_backend_id),
    );
  }, [migrationsRes]);

  const openCreate = () => {
    setEditing(null);
    setLastTestMessage(null);
    form.resetFields();
    form.setFieldsValue({
      use_ssl: true,
      force_path_style: false,
      port: 443,
    });
    setOpen(true);
  };

  const openEdit = (record: StorageBackendPublicView) => {
    setEditing(record);
    setLastTestMessage(record.status_message);
    form.setFieldsValue({
      name: record.name,
      endpoint: record.endpoint,
      port: record.port ?? undefined,
      region: record.region ?? undefined,
      use_ssl: record.use_ssl,
      force_path_style: record.force_path_style,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      const payload = {
        name: values.name.trim(),
        provider_type: 's3' as const,
        endpoint: values.endpoint.trim(),
        port: values.port ?? null,
        region: values.region?.trim() || null,
        use_ssl: values.use_ssl,
        force_path_style: values.force_path_style,
        access_key: values.access_key?.trim(),
        secret_key: values.secret_key?.trim(),
      };

      const res = editing
        ? await updateBackend.mutateAsync({ id: editing.id, body: payload })
        : await createBackend.mutateAsync({
            ...payload,
            access_key: payload.access_key!,
            secret_key: payload.secret_key!,
          });

      const test = res.data?.data?.test;
      setLastTestMessage(test?.message ?? null);
      if (test?.success) {
        feedback.success(test.message || '保存并测连成功');
      } else {
        feedback.error(test?.message || '测连失败');
      }
      if (!editing) {
        setOpen(false);
      }
    } catch (err) {
      feedback.error(err, '保存失败');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activateBackend.mutateAsync(id);
      feedback.success('已切换为主存储');
    } catch (err) {
      feedback.error(err, '切换失败');
    }
  };

  const handleRetest = async (id: number) => {
    try {
      const res = await testBackend.mutateAsync(id);
      const test = res.data?.data?.test;
      if (test?.success) {
        feedback.success(test.message);
      } else {
        feedback.error(test?.message || '测连失败');
      }
    } catch (err) {
      feedback.error(err, '测连失败');
    }
  };

  return (
    <AdminLayout title="存储配置">
      <div className="space-y-4">
        <Alert
          type="info"
          showIcon
          message="配置外部 OSS（S3 兼容）后保存即自动测连。测连成功后可在「数据迁移」页一键迁移；迁移完成后可在此切换主存储。"
        />

        <Card
          title="存储后端"
          extra={
            canWrite ? (
              <Button type="primary" onClick={openCreate}>
                添加 OSS 配置
              </Button>
            ) : null
          }
        >
          <AdminQueryAlert
            isError={isError}
            message="无法加载存储后端列表"
            onRetry={() => refetch()}
            className="mb-3"
          />
          <Table<StorageBackendPublicView>
            rowKey="id"
            loading={isLoading}
            dataSource={backends}
            pagination={false}
            columns={[
              { title: '名称', dataIndex: 'name' },
              {
                title: '类型',
                dataIndex: 'provider_type',
                render: (value: string) =>
                  value === 's3' ? 'S3 兼容 OSS' : 'MinIO',
              },
              {
                title: 'Endpoint',
                render: (_, record) =>
                  `${record.use_ssl ? 'https' : 'http'}://${record.endpoint}${
                    record.port ? `:${record.port}` : ''
                  }`,
              },
              {
                title: '状态',
                render: (_, record) => (
                  <div className="space-y-1">
                    {statusTag(record.status)}
                    {roleTag(record)}
                  </div>
                ),
              },
              {
                title: '最近测连',
                dataIndex: 'last_tested_at',
                render: (value: string | null) =>
                  value ? new Date(value).toLocaleString() : '—',
              },
              {
                title: '操作',
                render: (_, record) =>
                  record.is_builtin ? (
                    <span className="text-gray-400">内置只读</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {canWrite && (
                        <Button size="small" onClick={() => openEdit(record)}>
                          编辑
                        </Button>
                      )}
                      {canWrite && (
                        <Button
                          size="small"
                          loading={testBackend.isPending}
                          onClick={() => handleRetest(record.id)}
                        >
                          测连
                        </Button>
                      )}
                      {canWrite &&
                        record.role !== 'active' &&
                        completedMigrateTargets.has(record.id) && (
                          <Button
                            size="small"
                            type="primary"
                            loading={activateBackend.isPending}
                            onClick={() => handleActivate(record.id)}
                          >
                            切换为主存储
                          </Button>
                        )}
                    </div>
                  ),
              },
            ]}
          />
        </Card>

        {connectedOss.length > 0 && (
          <Alert
            type="success"
            showIcon
            message={`已有 ${connectedOss.length} 个外部 OSS 测连成功，可前往 OSS 管理页查看详情。`}
          />
        )}
      </div>

      <Modal
        title={editing ? '编辑 OSS 配置' : '添加 OSS 配置'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createBackend.isPending || updateBackend.isPending}
        okText="保存并测试"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="显示名称"
            rules={[{ required: true, message: '必填' }]}
          >
            <Input placeholder="例如：阿里云 OSS 杭州" />
          </Form.Item>
          <Form.Item
            name="endpoint"
            label="Endpoint"
            rules={[{ required: true, message: '必填' }]}
            extra="不含协议，如 oss-cn-hangzhou.aliyuncs.com"
          >
            <Input />
          </Form.Item>
          <Form.Item name="port" label="端口">
            <InputNumber className="w-full" min={1} max={65535} placeholder="HTTPS 默认 443" />
          </Form.Item>
          <Form.Item name="region" label="Region（可选）">
            <Input placeholder="如 oss-cn-hangzhou" />
          </Form.Item>
          <Form.Item
            name="access_key"
            label="Access Key"
            rules={editing ? [] : [{ required: true, message: '必填' }]}
            extra={editing?.has_credentials ? '留空则保持不变' : undefined}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="secret_key"
            label="Secret Key"
            rules={editing ? [] : [{ required: true, message: '必填' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="use_ssl" label="启用 HTTPS" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="force_path_style"
            label="Path-Style 访问"
            valuePropName="checked"
            extra="部分 MinIO 兼容服务需要开启"
          >
            <Switch />
          </Form.Item>
        </Form>
        {lastTestMessage && (
          <Alert
            className="mt-2"
            type={lastTestMessage.includes('成功') ? 'success' : 'error'}
            message={lastTestMessage}
            showIcon
          />
        )}
      </Modal>
    </AdminLayout>
  );
}
