import { useEffect, useMemo } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Slider,
  Spin,
  Table,
} from 'antd';
import type { EChartsOption } from 'echarts';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import EChart from '@/components/Echart';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  useAdminStorageOverview,
  useAdminStoragePolicy,
  useAdminStorageUsers,
  useRebalanceStorageQuotas,
  useUpdateAdminStoragePolicy,
} from '@/network/hooks/admin';
import { AdminStorageUserItem } from '@/network/types/Response/admin';
import { formatFileSize } from '@/utils/format/formatters';

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

type PolicyFormValues = {
  diskTotalGb: number;
  userPoolRatioPercent: number;
  warnMinQuotaMb: number;
  warnPoolUsagePercent: number;
};

export default function AdminStoragePage() {
  const feedback = useAdminFeedback();
  const [policyForm] = Form.useForm<PolicyFormValues>();

  const {
    data: overviewRes,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useAdminStorageOverview();
  const {
    data: policyRes,
    isLoading: policyLoading,
    isError: policyError,
    refetch: refetchPolicy,
  } = useAdminStoragePolicy();
  const {
    data: usersRes,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useAdminStorageUsers();

  const updatePolicy = useUpdateAdminStoragePolicy();
  const rebalance = useRebalanceStorageQuotas();

  const totals = overviewRes?.data?.data?.totals;
  const policyView = policyRes?.data?.data;
  const pool = policyView?.pool ?? overviewRes?.data?.data?.pool;
  const alerts = policyView?.alerts ?? overviewRes?.data?.data?.alerts ?? [];
  const users = usersRes?.data?.data ?? [];

  useEffect(() => {
    const policy = policyView?.policy;
    if (!policy) return;
    policyForm.setFieldsValue({
      diskTotalGb: Math.round(policy.disk_total_bytes / GB),
      userPoolRatioPercent: Math.round(policy.user_pool_ratio * 100),
      warnMinQuotaMb: Math.round(policy.warn_min_quota_bytes / MB),
      warnPoolUsagePercent: Math.round(policy.warn_pool_usage_ratio * 100),
    });
  }, [policyView?.policy, policyForm]);

  const poolOption: EChartsOption = useMemo(() => {
    if (!pool) return {};
    const segments = [
      { name: '系统预留', value: pool.reservedBytes },
      { name: '用户池已用', value: pool.siteUsedBytes },
      { name: '用户池剩余', value: pool.userPoolFreeBytes },
    ].filter((item) => item.value > 0);

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
          radius: ['42%', '68%'],
          data: segments,
        },
      ],
    };
  }, [pool]);

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

  const handleSavePolicy = async () => {
    const values = await policyForm.validateFields();
    try {
      await updatePolicy.mutateAsync({
        disk_total_bytes: values.diskTotalGb * GB,
        user_pool_ratio: values.userPoolRatioPercent / 100,
        warn_min_quota_bytes: values.warnMinQuotaMb * MB,
        warn_pool_usage_ratio: values.warnPoolUsagePercent / 100,
      });
      feedback.success('存储策略已保存，并已重新分配用户配额');
    } catch (err) {
      feedback.error(err, '保存失败');
    }
  };

  const handleRebalance = async () => {
    try {
      const res = await rebalance.mutateAsync();
      const data = res.data?.data;
      feedback.success(
        `已重新均分 ${data?.updatedUsers ?? 0} 位用户，人均 ${formatFileSize(data?.perUserQuotaBytes ?? 0)}`,
      );
    } catch (err) {
      feedback.error(err, '重新均分失败');
    }
  };

  return (
    <AdminLayout title="存储分析">
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert) => (
            <Alert
              key={alert.code}
              type={alert.level === 'critical' ? 'error' : 'warning'}
              message={alert.message}
              showIcon
            />
          ))}
        </div>
      )}

      <AdminQueryAlert
        isError={overviewError || policyError}
        message="无法加载存储策略或概览"
        onRetry={() => {
          void refetchOverview();
          void refetchPolicy();
        }}
      />

      <Spin spinning={(overviewLoading || policyLoading) && !overviewError}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card {...adminCardProps} title="总盘容量">
              {formatFileSize(pool?.diskTotalBytes ?? 0)}
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card {...adminCardProps} title="用户池上限（60% 默认）">
              {formatFileSize(pool?.userPoolBytes ?? 0)}
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card {...adminCardProps} title="动态人均配额">
              {formatFileSize(pool?.dynamicPerUserQuotaBytes ?? 0)}
              <div className="mt-1 text-xs text-gray-400">
                活跃用户 {pool?.activeUserCount ?? 0} 人
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card {...adminCardProps} title="用户池使用率">
              {pool
                ? `${(pool.userPoolUsageRatio * 100).toFixed(1)}%`
                : '—'}
              <div className="mt-1 text-xs text-gray-400">
                已用 {formatFileSize(pool?.siteUsedBytes ?? 0)}
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={12}>
            <Card {...adminCardProps} title="磁盘分区（系统预留 / 用户池）">
              <EChart option={poolOption} height="320px" />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card {...adminCardProps} title="全站存储策略">
              <Form form={policyForm} layout="vertical">
                <Form.Item
                  name="diskTotalGb"
                  label="本机总盘容量（GB）"
                  rules={[{ required: true, type: 'number', min: 1 }]}
                  extra="包含系统与应用占用，不全部给用户数据"
                >
                  <InputNumber min={1} max={102400} className="w-full" />
                </Form.Item>
                <Form.Item
                  name="userPoolRatioPercent"
                  label="用户池占比（%）"
                  extra="默认 60%，剩余为系统预留区"
                >
                  <Slider min={10} max={90} marks={{ 60: '60%' }} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="warnMinQuotaMb"
                      label="人均过低告警（MB）"
                      rules={[{ required: true, type: 'number', min: 1 }]}
                    >
                      <InputNumber min={1} className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="warnPoolUsagePercent"
                      label="池使用率告警（%）"
                      rules={[{ required: true, type: 'number', min: 1, max: 100 }]}
                    >
                      <InputNumber min={1} max={100} className="w-full" />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="primary"
                    onClick={handleSavePolicy}
                    loading={updatePolicy.isPending}
                  >
                    保存策略并重新均分
                  </Button>
                  <Button onClick={handleRebalance} loading={rebalance.isPending}>
                    仅重新均分配额
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} md={8}>
            <Card {...adminCardProps} title="总文件数">{totals?.totalFiles ?? 0}</Card>
          </Col>
          <Col xs={24} md={8}>
            <Card {...adminCardProps} title="总文件夹数">{totals?.totalFolders ?? 0}</Card>
          </Col>
          <Col xs={24} md={8}>
            <Card {...adminCardProps} title="文件元数据占用">
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
        <Table<AdminStorageUserItem>
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
              title: '占用空间',
              dataIndex: 'usedBytes',
              width: 130,
              sorter: (a, b) => a.usedBytes - b.usedBytes,
              defaultSortOrder: 'descend',
              render: (v: number) => formatFileSize(v),
            },
            {
              title: '占用户池比例',
              width: 120,
              render: (_: unknown, record: AdminStorageUserItem) => {
                const poolBytes = pool?.userPoolBytes ?? 0;
                if (poolBytes <= 0) return '—';
                return `${((record.usedBytes / poolBytes) * 100).toFixed(2)}%`;
              },
            },
          ]}
        />
        {pool && (
          <p className="mt-3 text-sm text-gray-500">
            当前动态人均配额为 {formatFileSize(pool.dynamicPerUserQuotaBytes)}，
            用户池剩余 {formatFileSize(pool.userPoolFreeBytes)}。
            手动调整单用户配额请前往「云盘用户」页面。
          </p>
        )}
      </Card>
    </AdminLayout>
  );
}
