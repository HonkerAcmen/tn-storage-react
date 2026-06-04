import { useMemo } from 'react';
import { Card, Col, Row, Statistic, Tag, Segmented, Spin, Alert } from 'antd';
import type { EChartsOption } from 'echarts';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import EChart from '@/components/Echart';
import { useAdminActivity, useAdminMetrics } from '@/network/hooks/admin';
import { useAdminUiStore } from '@/store/adminUiStore';
import { formatFileSize } from '@/utils/format/formatters';
import {
  MdPeople,
  MdInsertDriveFile,
  MdMemory,
  MdStorage,
} from 'react-icons/md';

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}天 ${h}小时`;
  if (h > 0) return `${h}小时 ${m}分钟`;
  return `${m}分钟`;
}

export default function AdminDashboardPage() {
  const { data: metricsRes, isLoading, isError } = useAdminMetrics();
  const {
    data: activityRes,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useAdminActivity();
  const activityRange = useAdminUiStore((s) => s.activityRange);
  const setActivityRange = useAdminUiStore((s) => s.setActivityRange);
  const activityMetric = useAdminUiStore((s) => s.activityMetric);
  const setActivityMetric = useAdminUiStore((s) => s.setActivityMetric);

  const metrics = metricsRes?.data?.data;
  const activity = activityRes?.data?.data;

  const uploadsByDay = useMemo(() => {
    const list = activity?.uploadsByDay ?? [];
    if (activityRange === 7) return list.slice(-7);
    return list;
  }, [activity?.uploadsByDay, activityRange]);

  const uploadChartOption: EChartsOption = useMemo(() => {
    const isCount = activityMetric === 'count';
    const xLabels = uploadsByDay.map((item) => item.date.slice(5));
    const values = uploadsByDay.map((item) =>
      isCount ? item.uploads : item.bytes
    );

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const list = Array.isArray(params) ? params : [params];
          const first = list[0] as { dataIndex?: number } | undefined;
          const idx = first?.dataIndex ?? 0;
          const row = uploadsByDay[idx];
          if (!row) return '';
          return [
            row.date,
            `上传次数：${row.uploads}`,
            `上传流量：${formatFileSize(row.bytes)}`,
          ].join('<br/>');
        },
      },
      grid: { left: 16, right: 16, bottom: 8, top: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: xLabels,
        boundaryGap: true,
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
      },
      yAxis: {
        type: 'value',
        name: isCount ? '次数' : '流量',
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
        axisLabel: {
          color: '#6b7280',
          formatter: isCount
            ? (v: number) => String(v)
            : (v: number) => formatFileSize(v),
        },
      },
      series: [
        {
          name: isCount ? '上传次数' : '上传流量',
          type: 'bar',
          barMaxWidth: 28,
          data: values,
          itemStyle: {
            color: isCount ? '#5542f6' : '#22c55e',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: { focus: 'series' },
        },
      ],
    };
  }, [uploadsByDay, activityMetric]);

  const categoryChartOption: EChartsOption = useMemo(() => {
    const breakdown = activity?.categoryBreakdown ?? [];
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; percent: number };
          return `${p.name}: ${formatFileSize(p.value)} (${p.percent}%)`;
        },
      },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          data: breakdown.map((item) => ({
            name: item.name,
            value: item.value,
          })),
        },
      ],
    };
  }, [activity?.categoryBreakdown]);

  const memoryChartOption: EChartsOption = useMemo(() => {
    if (!metrics) return {};
    const used = metrics.memory.systemUsedMb;
    const free = metrics.memory.systemTotalMb - used;
    return {
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['55%', '75%'],
          label: {
            show: true,
            position: 'center',
            formatter: `${metrics.memory.usagePercent}%`,
            fontSize: 18,
            fontWeight: 'bold',
          },
          data: [
            { value: used, name: '已用', itemStyle: { color: '#5542f6' } },
            { value: free, name: '空闲', itemStyle: { color: '#e8e8e8' } },
          ],
        },
      ],
    };
  }, [metrics]);

  return (
    <AdminLayout title="系统仪表盘">
      {isError && (
        <Alert
          type="error"
          showIcon
          className="mb-4"
          message="无法加载系统指标，请确认后端 Admin 模块已启动且当前账号为管理员"
        />
      )}

      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card {...adminCardProps}>
              <Statistic
                title="注册用户"
                value={metrics?.users.total ?? 0}
                prefix={<MdPeople className="text-[#5542f6]" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card {...adminCardProps}>
              <Statistic
                title="文件总数"
                value={metrics?.storage.totalFiles ?? 0}
                prefix={<MdInsertDriveFile className="text-[#5542f6]" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card {...adminCardProps}>
              <Statistic
                title="存储占用"
                value={formatFileSize(metrics?.storage.usedBytes ?? 0)}
                prefix={<MdStorage className="text-[#5542f6]" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card {...adminCardProps}>
              <Statistic
                title="系统内存"
                value={metrics?.memory.usagePercent ?? 0}
                suffix="%"
                prefix={<MdMemory className="text-[#5542f6]" />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={16}>
            <Card
              {...adminCardProps}
              title="上传活动"
              extra={
                <div className="flex flex-wrap items-center gap-2">
                  <Segmented
                    size="small"
                    options={[
                      { label: '按次数', value: 'count' },
                      { label: '按流量', value: 'bytes' },
                    ]}
                    value={activityMetric}
                    onChange={(v) => setActivityMetric(v as 'count' | 'bytes')}
                  />
                  <Segmented
                    size="small"
                    options={[
                      { label: '近 7 天', value: 7 },
                      { label: '近 30 天', value: 30 },
                    ]}
                    value={activityRange}
                    onChange={(v) => setActivityRange(v as 7 | 30)}
                  />
                </div>
              }
            >
              <AdminQueryAlert
                isError={activityError}
                message="无法加载上传活动数据"
                onRetry={() => refetchActivity()}
              />
              <Spin spinning={activityLoading && !activityError}>
                {!activityError && (
                  <EChart option={uploadChartOption} height="320px" />
                )}
              </Spin>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card {...adminCardProps} title="存储类型分布">
              <AdminQueryAlert
                isError={activityError}
                message="无法加载存储类型分布"
                onRetry={() => refetchActivity()}
              />
              <Spin spinning={activityLoading && !activityError}>
                {!activityError && (
                  <EChart option={categoryChartOption} height="320px" />
                )}
              </Spin>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} md={12} lg={8}>
            <Card {...adminCardProps} title="系统内存">
              <EChart option={memoryChartOption} height="240px" />
              <div className="mt-2 text-center text-sm text-gray-500">
                进程 {metrics?.memory.processUsedMb ?? 0} /{' '}
                {metrics?.memory.processTotalMb ?? 0} MB
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Card {...adminCardProps} title="运行环境">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">环境</span>
                  <Tag color="blue">{metrics?.environment ?? '-'}</Tag>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">版本</span>
                  <span>{metrics?.version ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">运行时长</span>
                  <span>{formatUptime(metrics?.uptime ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CPU 核心</span>
                  <span>{metrics?.cpu.cores ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">缓存条目</span>
                  <span>{metrics?.cache.keys ?? 0}</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Card {...adminCardProps} title="数据库">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">状态</span>
                  <Tag
                    color={metrics?.database.status === 'ok' ? 'success' : 'error'}
                  >
                    {metrics?.database.status === 'ok' ? '正常' : '异常'}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">延迟</span>
                  <span>{metrics?.database.latencyMs ?? 0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">主机</span>
                  <span>{metrics?.database.host ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">库名</span>
                  <span>{metrics?.database.name ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">回收站文件</span>
                  <span>{metrics?.storage.trashCount ?? 0}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </AdminLayout>
  );
}
