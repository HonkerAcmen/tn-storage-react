import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Modal,
  Progress,
  Select,
  Table,
  Tag,
} from 'antd';
import { MdSwapHoriz } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { useAdminProfile } from '@/network/hooks/adminAuth';
import {
  useActivateAdminStorageBackend,
  useAdminStorageBackends,
  useAdminStorageMigrations,
  useAdminStorageRetentions,
  useCreateAdminStorageMigration,
  usePurgeAdminStorageRetention,
} from '@/network/hooks/admin';
import {
  StorageBackendPublicView,
  StorageMigrationJobView,
  StorageRetentionView,
} from '@/network/types/Response/admin';
import { formatFileSize } from '@/utils/format/formatters';
import EmailChallengeModal from '@/components/verification/EmailChallengeModal';

const jobStatusMap: Record<
  StorageMigrationJobView['status'],
  { color: string; label: string }
> = {
  pending: { color: 'default', label: '等待中' },
  running: { color: 'processing', label: '进行中' },
  completed: { color: 'success', label: '已完成' },
  failed: { color: 'error', label: '失败' },
  cancelled: { color: 'warning', label: '已取消' },
};

const modeLabels: Record<StorageMigrationJobView['mode'], string> = {
  migrate: '迁移并切换',
  backup: '仅备份',
  sync: '同步',
};

type CreateFormValues = {
  target_backend_id: number;
  mode: 'migrate' | 'backup';
};

function backendLabel(
  backends: StorageBackendPublicView[],
  id: number,
): string {
  const item = backends.find((b) => b.id === id);
  return item ? `${item.name} (#${item.id})` : `#${id}`;
}

export default function AdminStorageMigrationPage() {
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const { data: profileRes } = useAdminProfile();
  const { data: backendsRes, isLoading: backendsLoading } =
    useAdminStorageBackends();
  const {
    data: migrationsRes,
    isLoading: migrationsLoading,
    isError: migrationsError,
    refetch: refetchMigrations,
  } = useAdminStorageMigrations();
  const {
    data: retentionsRes,
    isLoading: retentionsLoading,
    isError: retentionsError,
    refetch: refetchRetentions,
  } = useAdminStorageRetentions();
  const createMigration = useCreateAdminStorageMigration();
  const activateBackend = useActivateAdminStorageBackend();
  const purgeRetention = usePurgeAdminStorageRetention();
  const [createOpen, setCreateOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeRetentionId, setPurgeRetentionId] = useState<number | null>(null);
  const [form] = Form.useForm<CreateFormValues>();

  const backends = backendsRes?.data?.data ?? [];
  const jobs = migrationsRes?.data?.data ?? [];
  const retentions = retentionsRes?.data?.data ?? [];

  const activeSource = useMemo(
    () => backends.find((item) => item.role === 'active'),
    [backends],
  );
  const connectedTargets = useMemo(
    () =>
      backends.filter(
        (item) =>
          !item.is_builtin &&
          item.status === 'connected' &&
          item.id !== activeSource?.id,
      ),
    [backends, activeSource],
  );
  const hasRunningJob = jobs.some(
    (job) => job.status === 'pending' || job.status === 'running',
  );
  const completedMigrateTargets = useMemo(
    () =>
      new Set(
        jobs
          .filter((job) => job.mode === 'migrate' && job.status === 'completed')
          .map((job) => job.target_backend_id),
      ),
    [jobs],
  );
  const activeBackendId = backends.find((item) => item.role === 'active')?.id;

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ mode: 'migrate' });
    if (connectedTargets.length === 1) {
      form.setFieldValue('target_backend_id', connectedTargets[0].id);
    }
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!activeSource) {
      feedback.error('未找到主存储后端');
      return;
    }
    const values = await form.validateFields();
    try {
      await createMigration.mutateAsync({
        source_backend_id: activeSource.id,
        target_backend_id: values.target_backend_id,
        mode: values.mode,
      });
      feedback.success('迁移任务已创建');
      setCreateOpen(false);
    } catch (err) {
      feedback.error(err, '创建迁移任务失败');
    }
  };

  const handleActivate = async (backendId: number) => {
    try {
      await activateBackend.mutateAsync(backendId);
      feedback.success('已切换为主存储');
    } catch (err) {
      feedback.error(err, '切换失败');
    }
  };

  return (
    <AdminLayout title="数据迁移">
      <EmailChallengeModal
        open={purgeOpen}
        purpose="admin.backup_restore"
        scope="admin"
        admin
        email={profileRes?.data?.data?.email}
        title="验证邮箱以清理源端数据"
        onClose={() => {
          setPurgeOpen(false);
          setPurgeRetentionId(null);
        }}
        onVerified={async (challengeToken) => {
          if (!purgeRetentionId) return;
          try {
            const res = await purgeRetention.mutateAsync({
              id: purgeRetentionId,
              challengeToken,
            });
            feedback.success(
              `已清理 ${res.data?.data?.deletedObjects ?? 0} 个对象`,
            );
          } catch (err) {
            feedback.error(err, '清理失败');
          } finally {
            setPurgeOpen(false);
            setPurgeRetentionId(null);
          }
        }}
      />

      <div className="space-y-4">
        <Alert
          type="info"
          showIcon
          message="一键迁移至外部 OSS"
          description="「迁移并切换」会将本机 MinIO 数据复制到目标 OSS，完成后源端进入只读并保留 7 天。「仅备份」只复制数据，不切换主存储。迁移完成后可在下方或「存储配置」页切换主存储。"
        />

        {!activeSource && !backendsLoading && (
          <Alert
            type="warning"
            showIcon
            message="未检测到主存储后端，请检查存储配置"
          />
        )}

        {connectedTargets.length === 0 && !backendsLoading && (
          <Alert
            type="warning"
            showIcon
            message="暂无可用的目标 OSS"
            description="请先在「存储配置」添加外部 OSS 并完成测连。"
          />
        )}

        <Card
          {...adminCardProps}
          title="迁移任务"
          extra={
            canWrite ? (
              <Button
                type="primary"
                icon={<MdSwapHoriz />}
                disabled={
                  !activeSource ||
                  connectedTargets.length === 0 ||
                  hasRunningJob
                }
                onClick={openCreate}
              >
                创建迁移
              </Button>
            ) : null
          }
        >
          <AdminQueryAlert
            isError={migrationsError}
            message="无法加载迁移任务"
            onRetry={() => refetchMigrations()}
            className="mb-3"
          />
          <Table<StorageMigrationJobView>
            rowKey="id"
            loading={migrationsLoading}
            dataSource={jobs}
            pagination={false}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 64 },
              {
                title: '模式',
                dataIndex: 'mode',
                render: (mode: StorageMigrationJobView['mode']) =>
                  modeLabels[mode],
              },
              {
                title: '源 → 目标',
                render: (_, record) =>
                  `${backendLabel(backends, record.source_backend_id)} → ${backendLabel(backends, record.target_backend_id)}`,
              },
              {
                title: '状态',
                dataIndex: 'status',
                render: (status: StorageMigrationJobView['status']) => {
                  const meta = jobStatusMap[status];
                  return <Tag color={meta.color}>{meta.label}</Tag>;
                },
              },
              {
                title: '进度',
                render: (_, record) => (
                  <div className="min-w-[160px]">
                    <Progress
                      percent={record.progress_percent}
                      size="small"
                      status={
                        record.status === 'failed'
                          ? 'exception'
                          : record.status === 'completed'
                            ? 'success'
                            : 'active'
                      }
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {record.copied_objects}/{record.total_objects} 对象 ·{' '}
                      {formatFileSize(record.copied_bytes)}
                      {record.failed_objects > 0
                        ? ` · 失败 ${record.failed_objects}`
                        : ''}
                    </p>
                  </div>
                ),
              },
              {
                title: '创建时间',
                dataIndex: 'created_at',
                render: (value: string) => new Date(value).toLocaleString(),
              },
              {
                title: '操作',
                render: (_, record) => {
                  if (
                    record.mode !== 'migrate' ||
                    record.status !== 'completed' ||
                    record.target_backend_id === activeBackendId
                  ) {
                    return '—';
                  }
                  if (!completedMigrateTargets.has(record.target_backend_id)) {
                    return '—';
                  }
                  return canWrite ? (
                    <Button
                      size="small"
                      type="primary"
                      loading={activateBackend.isPending}
                      onClick={() => handleActivate(record.target_backend_id)}
                    >
                      切换为主存储
                    </Button>
                  ) : (
                    '—'
                  );
                },
              },
            ]}
          />
          {recordErrorMessage(jobs)}
        </Card>

        <Card {...adminCardProps} title="源端保留（7 天）">
          <AdminQueryAlert
            isError={retentionsError}
            message="无法加载保留记录"
            onRetry={() => refetchRetentions()}
            className="mb-3"
          />
          <Table<StorageRetentionView>
            rowKey="id"
            loading={retentionsLoading}
            dataSource={retentions}
            pagination={false}
            columns={[
              {
                title: '源后端',
                dataIndex: 'backend_id',
                render: (id: number) => backendLabel(backends, id),
              },
              {
                title: '迁移任务',
                dataIndex: 'migration_job_id',
                render: (id: number | null) => (id ? `#${id}` : '—'),
              },
              {
                title: '迁移完成',
                dataIndex: 'migrated_at',
                render: (value: string) => new Date(value).toLocaleString(),
              },
              {
                title: '计划清理',
                dataIndex: 'purge_at',
                render: (value: string) => new Date(value).toLocaleString(),
              },
              {
                title: '剩余',
                dataIndex: 'remaining_label',
                render: (label: string, record) => (
                  <Tag color={record.purged_at ? 'default' : record.expired ? 'warning' : 'blue'}>
                    {label}
                  </Tag>
                ),
              },
              {
                title: '操作',
                render: (_, record) =>
                  record.purged_at || !canWrite ? (
                    <span className="text-gray-400">
                      {record.purged_at ? '已清理' : '—'}
                    </span>
                  ) : (
                    <Button
                      size="small"
                      danger
                      onClick={() => {
                        setPurgeRetentionId(record.id);
                        setPurgeOpen(true);
                      }}
                    >
                      立即清理
                    </Button>
                  ),
              },
            ]}
          />
        </Card>
      </div>

      <Modal
        title="创建迁移任务"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        confirmLoading={createMigration.isPending}
        okText="开始迁移"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item label="源存储">
            <span>
              {activeSource
                ? `${activeSource.name}（主存储）`
                : '未检测到主存储'}
            </span>
          </Form.Item>
          <Form.Item
            name="target_backend_id"
            label="目标 OSS"
            rules={[{ required: true, message: '请选择目标 OSS' }]}
          >
            <Select
              placeholder="选择已连通的外部 OSS"
              options={connectedTargets.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.endpoint})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="mode"
            label="迁移模式"
            rules={[{ required: true, message: '请选择模式' }]}
          >
            <Select
              options={[
                {
                  value: 'migrate',
                  label: '迁移并切换 — 复制后源端只读，保留 7 天',
                },
                {
                  value: 'backup',
                  label: '仅备份 — 复制到 OSS，不切换主存储',
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

function recordErrorMessage(jobs: StorageMigrationJobView[]) {
  const failed = jobs.find((job) => job.status === 'failed' && job.error_message);
  if (!failed?.error_message) {
    return null;
  }
  return (
    <Alert
      className="mt-3"
      type="error"
      showIcon
      message={`任务 #${failed.id} 失败`}
      description={failed.error_message}
    />
  );
}
