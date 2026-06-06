import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import type { EChartsOption } from 'echarts';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import EChart from '@/components/Echart';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import {
  useAdminStorageBackends,
  useAdminStorageDashboard,
  useCutoverStorageDualWrite,
  useDisableStorageDualWrite,
  useEnableStorageDualWrite,
  useProbeStorageDisk,
  useSetAdminStorageMaintenance,
  useSyncStorageDiskFromProbe,
} from '@/network/hooks/admin';
import { formatFileSize } from '@/utils/format/formatters';
import Link from 'next/link';

export default function AdminStorageDashboardPage() {
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const { data, isLoading, isError, refetch } = useAdminStorageDashboard();
  const { data: backendsRes } = useAdminStorageBackends();
  const setMaintenance = useSetAdminStorageMaintenance();
  const probeDisk = useProbeStorageDisk();
  const syncDisk = useSyncStorageDiskFromProbe();
  const enableDualWrite = useEnableStorageDualWrite();
  const disableDualWrite = useDisableStorageDualWrite();
  const cutoverDualWrite = useCutoverStorageDualWrite();
  const [dualWriteTarget, setDualWriteTarget] = useState<number | undefined>();
  const dashboard = data?.data?.data;
  const diskProbe = dashboard?.disk_probe;
  const dualWrite = dashboard?.dual_write;
  const connectedOss = (backendsRes?.data?.data ?? []).filter(
    (item) => !item.is_builtin && item.status === 'connected',
  );

  const trendOption: EChartsOption = useMemo(() => {
    const trends = dashboard?.trends ?? [];
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: { left: 48, right: 24, top: 24, bottom: 48 },
      xAxis: {
        type: 'category',
        data: trends.map((item) => item.date),
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => formatFileSize(v) },
      },
      series: [
        {
          name: '全站已用',
          type: 'line',
          smooth: true,
          data: trends.map((item) => item.site_used_bytes),
          itemStyle: { color: '#5542f6' },
        },
        {
          name: '用户池上限',
          type: 'line',
          smooth: true,
          data: trends.map((item) => item.user_pool_bytes),
          itemStyle: { color: '#22d3ee' },
        },
      ],
    };
  }, [dashboard?.trends]);

  const handleMaintenance = async (enabled: boolean) => {
    try {
      await setMaintenance.mutateAsync(enabled);
      feedback.success(enabled ? '维护模式已开启' : '维护模式已关闭');
    } catch (err) {
      feedback.error(err, '操作失败');
    }
  };

  return (
    <AdminLayout title="存储大屏">
      <div className="space-y-4">
        {dashboard?.maintenance_mode && (
          <Alert
            type="warning"
            showIcon
            message="维护模式已开启"
            description="全站上传已暂停，迁移与配置操作仍可进行。"
          />
        )}

        <AdminQueryAlert
          isError={isError}
          message="无法加载存储大屏"
          onRetry={() => refetch()}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card {...adminCardProps} loading={isLoading} title="全站已用">
              {formatFileSize(dashboard?.totals.usedBytes ?? 0)}
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card {...adminCardProps} loading={isLoading} title="用户池使用率">
              {dashboard?.pool
                ? `${(dashboard.pool.userPoolUsageRatio * 100).toFixed(1)}%`
                : '—'}
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card {...adminCardProps} loading={isLoading} title="主存储">
              {dashboard?.active_backend?.name ?? '—'}
              <Tag className="ml-2" color="blue">
                {dashboard?.policy.mode === 'oss' ? 'OSS' : '本机'}
              </Tag>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card
              {...adminCardProps}
              loading={isLoading}
              title="维护模式"
              extra={
                canWrite ? (
                  <Switch
                    checked={dashboard?.maintenance_mode}
                    loading={setMaintenance.isPending}
                    onChange={handleMaintenance}
                  />
                ) : null
              }
            >
              {dashboard?.maintenance_mode ? '已开启' : '已关闭'}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card {...adminCardProps} loading={isLoading} title="用量趋势（近 30 天）">
              {(dashboard?.trends.length ?? 0) === 0 ? (
                <p className="text-sm text-gray-500">
                  暂无历史快照，系统将于每日 00:05 自动记录。
                </p>
              ) : (
                <EChart option={trendOption} height="300px" />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card {...adminCardProps} loading={isLoading} title="用户占用 Top 10">
              <Table
                rowKey="userId"
                size="small"
                pagination={false}
                dataSource={dashboard?.top_users ?? []}
                columns={[
                  { title: '用户', dataIndex: 'username' },
                  {
                    title: '占用',
                    dataIndex: 'usedBytes',
                    render: (v: number) => formatFileSize(v),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card {...adminCardProps} loading={isLoading} title="宿主机磁盘探测">
              {diskProbe?.should_alert && (
                <Alert
                  className="mb-3"
                  type="warning"
                  showIcon
                  message="配置总盘与探测值偏差较大"
                />
              )}
              <p className="text-sm text-gray-600">
                配置：{formatFileSize(diskProbe?.configured_bytes ?? 0)}
              </p>
              <p className="text-sm text-gray-600">
                探测：
                {diskProbe?.probed_bytes
                  ? formatFileSize(diskProbe.probed_bytes)
                  : '未探测'}
              </p>
              {canWrite && (
                <Space className="mt-3">
                  <Button
                    size="small"
                    loading={probeDisk.isPending}
                    onClick={async () => {
                      try {
                        await probeDisk.mutateAsync();
                        feedback.success('探测完成');
                        await refetch();
                      } catch (err) {
                        feedback.error(err, '探测失败');
                      }
                    }}
                  >
                    探测
                  </Button>
                  <Button
                    size="small"
                    loading={syncDisk.isPending}
                    onClick={async () => {
                      try {
                        await syncDisk.mutateAsync();
                        feedback.success('已同步总盘配置');
                        await refetch();
                      } catch (err) {
                        feedback.error(err, '同步失败');
                      }
                    }}
                  >
                    同步到策略
                  </Button>
                </Space>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card {...adminCardProps} loading={isLoading} title="双写零停机切流">
              <p className="text-sm text-gray-600">
                状态：{dualWrite?.enabled ? '已开启' : '已关闭'}
                {dualWrite?.backend_name
                  ? ` → ${dualWrite.backend_name}`
                  : ''}
              </p>
              {canWrite && (
                <Space className="mt-3" direction="vertical" style={{ width: '100%' }}>
                  <Select
                    className="w-full"
                    placeholder="选择双写目标 OSS"
                    value={dualWriteTarget}
                    onChange={setDualWriteTarget}
                    options={connectedOss.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                  <Space wrap>
                    <Button
                      size="small"
                      disabled={!dualWriteTarget}
                      loading={enableDualWrite.isPending}
                      onClick={async () => {
                        if (!dualWriteTarget) return;
                        try {
                          await enableDualWrite.mutateAsync(dualWriteTarget);
                          feedback.success('双写已开启');
                          await refetch();
                        } catch (err) {
                          feedback.error(err, '开启失败');
                        }
                      }}
                    >
                      开启双写
                    </Button>
                    <Button
                      size="small"
                      disabled={!dualWrite?.enabled}
                      loading={disableDualWrite.isPending}
                      onClick={async () => {
                        try {
                          await disableDualWrite.mutateAsync();
                          feedback.success('双写已关闭');
                          await refetch();
                        } catch (err) {
                          feedback.error(err, '关闭失败');
                        }
                      }}
                    >
                      关闭双写
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      disabled={!dualWrite?.enabled}
                      loading={cutoverDualWrite.isPending}
                      onClick={async () => {
                        try {
                          await cutoverDualWrite.mutateAsync();
                          feedback.success('已切流至目标 OSS');
                          await refetch();
                        } catch (err) {
                          feedback.error(err, '切流失败');
                        }
                      }}
                    >
                      切流并关闭双写
                    </Button>
                  </Space>
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        <Card
          {...adminCardProps}
          loading={isLoading}
          title="存储后端一览"
          extra={
            <div className="flex gap-2">
              <Link href="/admin/storage-migration">
                <Button size="small">数据迁移</Button>
              </Link>
              <Link href="/admin/storage-backends">
                <Button size="small">存储配置</Button>
              </Link>
            </div>
          }
        >
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={dashboard?.backends ?? []}
            columns={[
              { title: '名称', dataIndex: 'name' },
              {
                title: '角色',
                dataIndex: 'role',
                render: (role: string) => {
                  if (role === 'active') return <Tag color="blue">主存储</Tag>;
                  if (role === 'readonly') return <Tag color="orange">只读保留</Tag>;
                  return <Tag>待命</Tag>;
                },
              },
              {
                title: '连通',
                render: (_, record) =>
                  record.connected ? (
                    <Tag color="success">已连通</Tag>
                  ) : (
                    <Tag>未连通</Tag>
                  ),
              },
              { title: 'Endpoint', dataIndex: 'endpoint' },
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
