import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Form,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
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
  useCancelAdminStorageMigration,
  useCreateAdminStorageMigration,
  useMigrateAndActivateAdminStorage,
  usePurgeAdminStorageRetention,
  useResumeAdminStorageMigration,
  useRetryAdminStorageMigration,
  useReconcileMigrationChecksum,
  useRollbackAdminStorageBackend,
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
  sync: '增量同步',
};

type CreateFormValues = {
  source_backend_id: number;
  target_backend_id: number;
  mode: 'migrate' | 'backup' | 'sync';
  auto_activate: boolean;
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
  const migrateAndActivate = useMigrateAndActivateAdminStorage();
  const cancelMigration = useCancelAdminStorageMigration();
  const retryMigration = useRetryAdminStorageMigration();
  const resumeMigration = useResumeAdminStorageMigration();
  const activateBackend = useActivateAdminStorageBackend();
  const rollbackBackend = useRollbackAdminStorageBackend();
  const reconcileChecksum = useReconcileMigrationChecksum();
  const purgeRetention = usePurgeAdminStorageRetention();
  const [createOpen, setCreateOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [reportJob, setReportJob] = useState<StorageMigrationJobView | null>(
    null,
  );
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeRetentionId, setPurgeRetentionId] = useState<number | null>(null);
  const [form] = Form.useForm<CreateFormValues>();
  const [wizardForm] = Form.useForm<{
    source_backend_id: number;
    target_backend_id: number;
  }>();

  const backends = backendsRes?.data?.data ?? [];
  const jobs = migrationsRes?.data?.data ?? [];
  const retentions = retentionsRes?.data?.data ?? [];

  const connectedSources = useMemo(
    () => backends.filter((item) => item.status === 'connected'),
    [backends],
  );
  const connectedTargets = useMemo(
    () =>
      backends.filter(
        (item) => item.status === 'connected' && item.role !== 'active',
      ),
    [backends],
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
  const readonlyBackends = backends.filter((item) => item.role === 'readonly');

  const openCreate = () => {
    form.resetFields();
    const defaultSource =
      backends.find((item) => item.role === 'active') ?? connectedSources[0];
    form.setFieldsValue({
      mode: 'migrate',
      source_backend_id: defaultSource?.id,
      auto_activate: false,
    });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    const values = await form.validateFields();
    if (values.source_backend_id === values.target_backend_id) {
      feedback.error('源与目标不能相同');
      return;
    }
    try {
      await createMigration.mutateAsync({
        source_backend_id: values.source_backend_id,
        target_backend_id: values.target_backend_id,
        mode: values.mode,
        auto_activate:
          values.mode === 'migrate' ? values.auto_activate : false,
      });
      feedback.success('迁移任务已创建');
      setCreateOpen(false);
    } catch (err) {
      feedback.error(err, '创建迁移任务失败');
    }
  };

  const handleWizard = async () => {
    const values = await wizardForm.validateFields();
    try {
      await migrateAndActivate.mutateAsync(values);
      feedback.success('一键迁移并切换任务已创建');
      setWizardOpen(false);
    } catch (err) {
      feedback.error(err, '创建失败');
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

  const handleRollback = async (backendId: number) => {
    try {
      await rollbackBackend.mutateAsync(backendId);
      feedback.success('已回滚至源存储（请确认新写入数据位置）');
    } catch (err) {
      feedback.error(err, '回滚失败');
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
          message="跨后端迁移（本机 MinIO / OSS A → OSS B）"
          description="支持 migrate、backup、sync 三种模式。migrate 完成后源端只读并保留 7 天；可使用一键向导自动切换主存储，或在保留期内回滚。"
        />

        <Card
          {...adminCardProps}
          title="迁移任务"
          extra={
            canWrite ? (
              <Space>
                <Button
                  type="primary"
                  icon={<MdSwapHoriz />}
                  disabled={connectedSources.length < 1 || hasRunningJob}
                  onClick={openCreate}
                >
                  创建迁移
                </Button>
                <Button
                  disabled={
                    connectedSources.length < 1 ||
                    connectedTargets.length < 1 ||
                    hasRunningJob
                  }
                  loading={migrateAndActivate.isPending}
                  onClick={() => {
                    wizardForm.resetFields();
                    const src = backends.find((item) => item.role === 'active');
                    if (src) wizardForm.setFieldValue('source_backend_id', src.id);
                    setWizardOpen(true);
                  }}
                >
                  一键迁移并切换
                </Button>
              </Space>
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
                render: (mode: StorageMigrationJobView['mode'], record) => (
                  <span>
                    {modeLabels[mode]}
                    {record.auto_activate && (
                      <Tag className="ml-1" color="purple">
                        自动切换
                      </Tag>
                    )}
                  </span>
                ),
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
                      {record.copied_objects}/{record.total_objects} ·{' '}
                      {formatFileSize(record.copied_bytes)}
                      {record.failed_objects > 0
                        ? ` · 失败 ${record.failed_objects}`
                        : ''}
                    </p>
                  </div>
                ),
              },
              {
                title: '操作',
                render: (_, record) => (
                  <Space wrap size="small">
                    {record.report && (
                      <Button size="small" onClick={() => setReportJob(record)}>
                        报告
                      </Button>
                    )}
                    {canWrite &&
                      (record.status === 'completed' ||
                        record.status === 'failed') && (
                        <Button
                          size="small"
                          loading={reconcileChecksum.isPending}
                          onClick={async () => {
                            try {
                              const res = await reconcileChecksum.mutateAsync(
                                record.id,
                              );
                              feedback.success(
                                `checksum 对账完成：${res.data?.data?.checksum_success_rate_percent ?? 0}%`,
                              );
                              await refetchMigrations();
                            } catch (err) {
                              feedback.error(err, '对账失败');
                            }
                          }}
                        >
                          checksum 对账
                        </Button>
                      )}
                    {canWrite && record.status === 'running' && (
                      <Popconfirm
                        title="确认取消此任务？"
                        onConfirm={async () => {
                          try {
                            await cancelMigration.mutateAsync(record.id);
                            feedback.success('已取消');
                          } catch (err) {
                            feedback.error(err, '取消失败');
                          }
                        }}
                      >
                        <Button size="small" danger>
                          取消
                        </Button>
                      </Popconfirm>
                    )}
                    {canWrite && record.status === 'failed' && (
                      <Button
                        size="small"
                        onClick={async () => {
                          try {
                            await retryMigration.mutateAsync(record.id);
                            feedback.success('已重试');
                          } catch (err) {
                            feedback.error(err, '重试失败');
                          }
                        }}
                      >
                        重试
                      </Button>
                    )}
                    {canWrite &&
                      (record.status === 'failed' ||
                        record.status === 'cancelled') && (
                        <Button
                          size="small"
                          onClick={async () => {
                            try {
                              await resumeMigration.mutateAsync(record.id);
                              feedback.success('已续跑');
                            } catch (err) {
                              feedback.error(err, '续跑失败');
                            }
                          }}
                        >
                          续跑
                        </Button>
                      )}
                    {canWrite &&
                      record.mode === 'migrate' &&
                      record.status === 'completed' &&
                      record.target_backend_id !== activeBackendId &&
                      completedMigrateTargets.has(record.target_backend_id) && (
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => handleActivate(record.target_backend_id)}
                        >
                          切换
                        </Button>
                      )}
                  </Space>
                ),
              },
            ]}
          />
        </Card>

        {readonlyBackends.length > 0 && (
          <Card {...adminCardProps} title="可回滚的只读源端">
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={readonlyBackends}
              columns={[
                { title: '后端', dataIndex: 'name' },
                { title: 'Endpoint', dataIndex: 'endpoint' },
                {
                  title: '操作',
                  render: (_, record) =>
                    canWrite ? (
                      <Popconfirm
                        title="回滚后新上传数据可能仍在当前主存储，确认继续？"
                        onConfirm={() => handleRollback(record.id)}
                      >
                        <Button size="small" danger>
                          回滚切换
                        </Button>
                      </Popconfirm>
                    ) : (
                      '—'
                    ),
                },
              ]}
            />
          </Card>
        )}

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
                title: '剩余',
                dataIndex: 'remaining_label',
                render: (label: string, record) => (
                  <Tag
                    color={
                      record.purged_at
                        ? 'default'
                        : record.expired
                          ? 'warning'
                          : 'blue'
                    }
                  >
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
        okText="开始"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="source_backend_id"
            label="源存储"
            rules={[{ required: true, message: '请选择源存储' }]}
          >
            <Select
              loading={backendsLoading}
              options={connectedSources.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.role})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="target_backend_id"
            label="目标 OSS"
            rules={[{ required: true, message: '请选择目标' }]}
          >
            <Select
              options={connectedTargets.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.endpoint})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="mode" label="模式" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'migrate', label: '迁移 — 源端只读 + 7 天保留' },
                { value: 'backup', label: '备份 — 不切主存储' },
                { value: 'sync', label: '增量同步 — 仅复制差异对象' },
              ]}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {() =>
              form.getFieldValue('mode') === 'migrate' ? (
                <Form.Item
                  name="auto_activate"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Checkbox>完成后自动切换为主存储</Checkbox>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="一键迁移并切换"
        open={wizardOpen}
        onCancel={() => setWizardOpen(false)}
        onOk={handleWizard}
        confirmLoading={migrateAndActivate.isPending}
        okText="开始"
        destroyOnClose
      >
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="将创建 migrate 任务并在校验通过后自动切换主存储"
        />
        <Form form={wizardForm} layout="vertical">
          <Form.Item
            name="source_backend_id"
            label="源存储"
            rules={[{ required: true }]}
          >
            <Select
              options={connectedSources.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="target_backend_id"
            label="目标 OSS"
            rules={[{ required: true }]}
          >
            <Select
              options={connectedTargets.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`迁移报告 #${reportJob?.id ?? ''}`}
        open={Boolean(reportJob)}
        footer={null}
        onCancel={() => setReportJob(null)}
      >
        {reportJob?.report && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="成功率">
              {reportJob.report.success_rate_percent}%
            </Descriptions.Item>
            <Descriptions.Item label="校验通过">
              {reportJob.report.verified_objects}
            </Descriptions.Item>
            <Descriptions.Item label="不一致">
              {reportJob.report.mismatch_objects}
            </Descriptions.Item>
            <Descriptions.Item label="失败对象">
              {reportJob.report.failed_object_keys.length > 0
                ? reportJob.report.failed_object_keys.join(', ')
                : '无'}
            </Descriptions.Item>
            <Descriptions.Item label="checksum 一致">
              {reportJob.report.checksum_verified_objects}
            </Descriptions.Item>
            <Descriptions.Item label="checksum 不一致">
              {reportJob.report.checksum_mismatch_objects}
            </Descriptions.Item>
            <Descriptions.Item label="checksum 成功率">
              {reportJob.report.checksum_success_rate_percent}%
            </Descriptions.Item>
            <Descriptions.Item label="健康">
              {reportJob.report.is_healthy ? (
                <Tag color="success">通过</Tag>
              ) : (
                <Tag color="error">需处理</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </AdminLayout>
  );
}
