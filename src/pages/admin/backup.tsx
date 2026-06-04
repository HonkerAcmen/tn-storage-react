import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import { MdBackup, MdDownload, MdDelete, MdSchedule } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  downloadAdminBackupJob,
  useAdminBackupJobs,
  useAdminBackupSchedule,
  useAdminDeleteBackupJob,
  useAdminTriggerBackup,
  useAdminUpdateBackupSchedule,
} from '@/network/hooks/admin';
import { AdminBackupJob } from '@/network/types/Response/admin';
import { formatDateTime } from '@/utils/format/formatters';

const statusMap: Record<
  AdminBackupJob['status'],
  { color: string; label: string }
> = {
  pending: { color: 'default', label: '等待中' },
  running: { color: 'processing', label: '进行中' },
  completed: { color: 'success', label: '已完成' },
  failed: { color: 'error', label: '失败' },
};

const cronPresets = [
  { label: '每天 03:00', value: '0 3 * * *' },
  { label: '每 12 小时', value: '0 */12 * * *' },
  { label: '每周日 03:00', value: '0 3 * * 0' },
];

type ScheduleFormValues = {
  enabled: boolean;
  cron: string;
  minioMirror: boolean;
};

export default function AdminBackupPage() {
  const { data, isLoading, refetch } = useAdminBackupJobs();
  const { data: scheduleRes, isLoading: scheduleLoading } =
    useAdminBackupSchedule();
  const triggerBackup = useAdminTriggerBackup();
  const deleteBackup = useAdminDeleteBackupJob();
  const updateSchedule = useAdminUpdateBackupSchedule();
  const feedback = useAdminFeedback();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [scheduleForm] = Form.useForm<ScheduleFormValues>();
  const jobs = data?.data?.data ?? [];
  const schedule = scheduleRes?.data?.data;

  useEffect(() => {
    if (schedule) {
      scheduleForm.setFieldsValue({
        enabled: schedule.enabled,
        cron: schedule.cron,
        minioMirror: schedule.minioMirror,
      });
    }
  }, [schedule, scheduleForm]);

  const handleTrigger = async () => {
    try {
      await triggerBackup.mutateAsync();
      feedback.success('备份任务已创建');
      await refetch();
    } catch (err) {
      feedback.error(err, '创建备份失败');
    }
  };

  const handleDownload = async (job: AdminBackupJob) => {
    setDownloadingId(job.id);
    try {
      await downloadAdminBackupJob(job.id);
      feedback.success('下载已开始');
    } catch (err) {
      feedback.error(err, '下载失败');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBackup.mutateAsync(id);
      feedback.success('备份已删除');
    } catch (err) {
      feedback.error(err, '删除失败');
    }
  };

  const handleSaveSchedule = async () => {
    const values = await scheduleForm.validateFields();
    try {
      await updateSchedule.mutateAsync(values);
      feedback.success('定时配置已保存');
    } catch (err) {
      feedback.error(err, '保存失败');
    }
  };

  return (
    <AdminLayout title="数据备份">
      <Card
        {...adminCardProps}
        title="定时备份"
        className="mb-4"
        loading={scheduleLoading}
        extra={
          <Button
            type="primary"
            icon={<MdSchedule />}
            loading={updateSchedule.isPending}
            onClick={handleSaveSchedule}
          >
            保存配置
          </Button>
        }
      >
        <Form form={scheduleForm} layout="vertical" className="max-w-xl">
          <Form.Item
            name="enabled"
            label="启用定时备份"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="cron"
            label="执行计划"
            rules={[{ required: true, message: '请选择执行计划' }]}
          >
            <Select options={cronPresets} />
          </Form.Item>
          <Form.Item
            name="minioMirror"
            label="MinIO 镜像备份"
            valuePropName="checked"
            extra="开启后将复制 MinIO 对象到本地备份目录；关闭则仅导出对象清单 JSON"
          >
            <Switch />
          </Form.Item>
        </Form>
        {schedule?.enabled && schedule.nextRunAt && (
          <p className="text-sm text-gray-500">
            下次执行：{formatDateTime(new Date(schedule.nextRunAt))}
          </p>
        )}
      </Card>

      <Card
        {...adminCardProps}
        title="备份任务"
        extra={
          <Button
            type="primary"
            icon={<MdBackup />}
            loading={triggerBackup.isPending}
            onClick={handleTrigger}
          >
            立即备份
          </Button>
        }
      >
        <p className="mb-4 text-sm text-gray-500">
          备份包含核心数据表 JSON（密码已脱敏）、MinIO 清单/镜像，以及
          mysqldump SQL（若可用）。已完成任务可下载 ZIP 或删除。
        </p>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={jobs}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1100 }}
          columns={[
            { title: '任务 ID', dataIndex: 'id', width: 170, ellipsis: true },
            {
              title: '来源',
              dataIndex: 'trigger',
              width: 90,
              render: (trigger: AdminBackupJob['trigger']) => (
                <Tag color={trigger === 'scheduled' ? 'purple' : 'blue'}>
                  {trigger === 'scheduled' ? '定时' : '手动'}
                </Tag>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 100,
              render: (status: AdminBackupJob['status']) => {
                const meta = statusMap[status];
                return <Tag color={meta.color}>{meta.label}</Tag>;
              },
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              width: 170,
              render: (v: string) => formatDateTime(new Date(v)),
            },
            {
              title: '完成时间',
              dataIndex: 'finishedAt',
              width: 170,
              render: (v: string | null) =>
                v ? formatDateTime(new Date(v)) : '-',
            },
            {
              title: '文件数',
              dataIndex: 'files',
              width: 80,
              render: (files: string[]) => files.length,
            },
            { title: '说明', dataIndex: 'message', ellipsis: true },
            {
              title: '操作',
              key: 'actions',
              width: 160,
              fixed: 'right',
              render: (_, record) => (
                <Space>
                  <Button
                    size="small"
                    icon={<MdDownload />}
                    disabled={
                      record.status !== 'completed' || record.files.length === 0
                    }
                    loading={downloadingId === record.id}
                    onClick={() => handleDownload(record)}
                  >
                    下载
                  </Button>
                  <Popconfirm
                    title="确定删除该备份？本地文件将一并移除。"
                    disabled={
                      record.status === 'running' || record.status === 'pending'
                    }
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Button
                      size="small"
                      danger
                      icon={<MdDelete />}
                      disabled={
                        record.status === 'running' ||
                        record.status === 'pending'
                      }
                      loading={deleteBackup.isPending}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
