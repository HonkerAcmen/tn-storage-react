import { Button, Card, Col, Descriptions, Popconfirm, Row, Statistic, Table, Tag } from 'antd';
import { MdCleaningServices, MdMemory, MdSettings } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  useAdminClearCache,
  useAdminOpsConfig,
  useAdminOpsMinio,
  useAdminOpsOverview,
} from '@/network/hooks/adminOps';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { formatFileSize } from '@/utils/format/formatters';

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} 小时 ${m} 分钟`;
  return `${m} 分钟`;
}

export default function AdminOpsPage() {
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const { data: overviewRes, isLoading: overviewLoading } =
    useAdminOpsOverview();
  const { data: minioRes, isLoading: minioLoading } = useAdminOpsMinio();
  const { data: configRes, isLoading: configLoading } = useAdminOpsConfig();
  const clearCache = useAdminClearCache();

  const overview = overviewRes?.data?.data;
  const minio = minioRes?.data?.data;
  const config = configRes?.data?.data;

  const handleClearCache = async () => {
    try {
      const res = await clearCache.mutateAsync();
      const cleared = res.data?.data?.cleared ?? 0;
      feedback.success(`已清空 ${cleared} 条缓存`);
    } catch {
      feedback.error('清空缓存失败');
    }
  };

  return (
    <AdminLayout title="运维中心">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card {...adminCardProps} loading={overviewLoading} title="内存缓存">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="缓存条目"
                  value={overview?.cache.size ?? 0}
                  prefix={<MdMemory className="text-[#5542f6]" />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Key 数量"
                  value={overview?.cache.keyCount ?? 0}
                />
              </Col>
            </Row>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                进程运行 {formatUptime(overview?.node.uptime ?? 0)}
              </span>
              {canWrite ? (
                <Popconfirm
                  title="确认清空全部内存缓存？"
                  onConfirm={handleClearCache}
                >
                  <Button
                    icon={<MdCleaningServices />}
                    loading={clearCache.isPending}
                  >
                    清空缓存
                  </Button>
                </Popconfirm>
              ) : (
                <span className="text-xs text-gray-400">只读角色无写权限</span>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            {...adminCardProps}
            loading={minioLoading}
            title="MinIO 监控"
            extra={
              minio?.status === 'ok' ? (
                <Tag color="success">连接正常</Tag>
              ) : (
                <Tag color="error">连接异常</Tag>
              )
            }
          >
            <Row gutter={16} className="mb-4">
              <Col span={8}>
                <Statistic title="对象总数" value={minio?.totalObjects ?? 0} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="存储占用"
                  value={formatFileSize(minio?.totalBytes ?? 0)}
                />
              </Col>
              <Col span={8}>
                <Statistic title="桶数量" value={minio?.buckets.length ?? 0} />
              </Col>
            </Row>
            <Table
              rowKey="name"
              size="small"
              pagination={false}
              dataSource={minio?.buckets ?? []}
              columns={[
                { title: '桶名', dataIndex: 'name' },
                { title: '对象数', dataIndex: 'objectCount', width: 100 },
                {
                  title: '占用',
                  dataIndex: 'totalBytes',
                  width: 120,
                  render: (v: number) => formatFileSize(v),
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card
            {...adminCardProps}
            loading={configLoading}
            title={
              <span className="inline-flex items-center gap-2">
                <MdSettings /> 系统配置（脱敏）
              </span>
            }
          >
            <Descriptions bordered size="small" column={{ xs: 1, md: 2, lg: 3 }}>
              <Descriptions.Item label="环境">
                {config?.nodeEnv}
              </Descriptions.Item>
              <Descriptions.Item label="监听">
                {config?.host}:{config?.port}
              </Descriptions.Item>
              <Descriptions.Item label="数据库">
                {config?.database.host}/{config?.database.name}
              </Descriptions.Item>
              <Descriptions.Item label="MinIO">
                {config?.minio.endpoint}:{config?.minio.port}
                {config?.minio.useSsl ? ' (SSL)' : ''}
              </Descriptions.Item>
              <Descriptions.Item label="上传上限">
                {formatFileSize(config?.upload.maxFileSize ?? 0)}
              </Descriptions.Item>
              <Descriptions.Item label="CORS">
                {config?.cors.origin ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备份 Cron">
                {config?.backup.cron ?? '未配置'}
              </Descriptions.Item>
              <Descriptions.Item label="MinIO 镜像备份">
                {config?.backup.minioMirror ? '开启' : '关闭'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}
