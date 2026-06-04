import { useMemo } from 'react';
import { Card, Col, Row, Statistic, Tag, Segmented, Spin, Alert } from 'antd';
import type { EChartsOption } from 'echarts';
import AdminLayout from '@/components/admin/AdminLayout';
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
  const { data: activityRes, isLoading: activityLoading } = useAdminActivity();
  const activityRange = useAdminUiStore((s) => s.activityRange);
  const setActivityRange = useAdminUiStore((s) => s.setActivityRange);

  const metrics = metricsRes?.data?.data;
  const activity = activityRes?.data?.data;

  const uploadsByDay = useMemo(() => {
    const list = activity?.uploadsByDay ?? [];
    if (activityRange === 7) return list.slice(-7);
    return list;
  }, [activity?.uploadsByDay, activityRange]);

  const uploadChartOption: EChartsOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      legend: { data: ['上传次数', '上传流量'] },
      grid: { left: 48, right: 48, bottom: 32, top: 48 },
      xAxis: {
        type: 'category',
        data: uploadsByDay.map((item) => item.date.slice(5)),
      },
      yAxis: [
        { type: 'value', name: '次数' },
        {
          type: 'value',
          name: '流量',
          axisLabel: {
            formatter: (v: number) => formatFileSize(v),
          },
        },
      ],
      series: [
        {
          name: '上传次数',
          type: 'bar',
          data: uploadsByDay.map((item) => item.uploads),
          itemStyle: { color: '#5542f6' },
        },
        {
          name: '上传流量',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: uploadsByDay.map((item) => item.bytes),
          itemStyle: { color: '#52c41a' },
        },
      ],
    }),
    [uploadsByDay]
  );

  const categoryChartOption: EChartsOption = useMemo(() => {
    const breakdown = activity?.categoryBreakdown ?? [];
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: { name: string; value: number; percent: number }) =>
          `${params.name}: ${formatFileSize(params.value)} (${params.percent}%)`,
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
                <Segmented
                  options={[
                    { label: '近 7 天', value: 7 },
                    { label: '近 30 天', value: 30 },
                  ]}
                  value={activityRange}
                  onChange={(v) => setActivityRange(v as 7 | 30)}
                />
              }
            >
              <Spin spinning={activityLoading}>
                <EChart option={uploadChartOption} height="320px" />
              </Spin>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card {...adminCardProps} title="存储类型分布">
              <Spin spinning={activityLoading}>
                <EChart option={categoryChartOption} height="320px" />
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
