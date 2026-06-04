import { useMemo } from 'react';
import { Card, Col, Row, Spin, Table } from 'antd';
import type { EChartsOption } from 'echarts';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import EChart from '@/components/Echart';
import {
  useAdminStorageOverview,
  useAdminStorageUsers,
} from '@/network/hooks/admin';
import { formatFileSize } from '@/utils/format/formatters';

export default function AdminStoragePage() {
  const {
    data: overviewRes,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useAdminStorageOverview();
  const {
    data: usersRes,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useAdminStorageUsers();

  const totals = overviewRes?.data?.data?.totals;
  const users = usersRes?.data?.data ?? [];

  const categoryOption: EChartsOption = useMemo(() => {
    if (!totals) return {};
    const categories = totals.categories;
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; percent: number };
          return `${p.name}: ${formatFileSize(p.value)} (${p.percent}%)`;
        },
      },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: '65%',
          data: [
            { name: '图片', value: categories.image },
            { name: '视频', value: categories.video },
            { name: '音频', value: categories.audio },
            { name: '文档', value: categories.document },
            { name: '其他', value: categories.other },
          ].filter((item) => item.value > 0),
        },
      ],
    };
  }, [totals]);

  const userBarOption: EChartsOption = useMemo(() => {
    const top = users.slice(0, 10);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const list = Array.isArray(params) ? params : [params];
          const item = list[0] as { name: string; value: number } | undefined;
          if (!item) return '';
          return `${item.name}<br/>${formatFileSize(item.value)}`;
        },
      },
      grid: { left: 100, right: 24, bottom: 32, top: 24 },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => formatFileSize(v) },
      },
      yAxis: {
        type: 'category',
        data: top.map((u) => u.username).reverse(),
      },
      series: [
        {
          type: 'bar',
          data: top.map((u) => u.usedBytes).reverse(),
          itemStyle: { color: '#5542f6', borderRadius: [0, 4, 4, 0] },
        },
      ],
    };
  }, [users]);

  return (
    <AdminLayout title="存储分析">
      <AdminQueryAlert
        isError={overviewError}
        message="无法加载存储概览"
        onRetry={() => refetchOverview()}
      />
      <Spin spinning={overviewLoading && !overviewError}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card {...adminCardProps} title="总文件数">{totals?.totalFiles ?? 0}</Card>
          </Col>
          <Col xs={24} md={8}>
            <Card {...adminCardProps} title="总文件夹数">{totals?.totalFolders ?? 0}</Card>
          </Col>
          <Col xs={24} md={8}>
            <Card {...adminCardProps} title="总占用">
              {formatFileSize(totals?.usedBytes ?? 0)}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={12}>
            <Card {...adminCardProps} title="全局类型分布">
              <EChart option={categoryOption} height="360px" />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card {...adminCardProps} title="用户占用 Top 10">
              <EChart option={userBarOption} height="360px" />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card {...adminCardProps} title="用户存储明细" className="mt-4">
        <AdminQueryAlert
          isError={usersError}
          message="无法加载用户存储明细"
          onRetry={() => refetchUsers()}
        />
        <Table
          rowKey="userId"
          loading={usersLoading}
          dataSource={users}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: '用户 ID', dataIndex: 'userId', width: 90 },
            { title: '用户名', dataIndex: 'username' },
            { title: '邮箱', dataIndex: 'email' },
            {
              title: '文件数',
              dataIndex: 'fileCount',
              width: 90,
              sorter: (a, b) => a.fileCount - b.fileCount,
            },
            {
              title: '文件夹数',
              dataIndex: 'folderCount',
              width: 100,
              sorter: (a, b) => a.folderCount - b.folderCount,
            },
            {
              title: '占用空间',
              dataIndex: 'usedBytes',
              width: 130,
              sorter: (a, b) => a.usedBytes - b.usedBytes,
              defaultSortOrder: 'descend',
              render: (v: number) => formatFileSize(v),
            },
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
