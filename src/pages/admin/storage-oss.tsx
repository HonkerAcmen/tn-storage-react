import { useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Row, Select, Statistic, Table, Tag } from 'antd';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import {
  useAdminStorageBackends,
  useOssStorageBuckets,
} from '@/network/hooks/admin';
import { formatFileSize } from '@/utils/format/formatters';

export default function AdminStorageOssPage() {
  const { data: backendsRes, isLoading: backendsLoading } =
    useAdminStorageBackends();
  const backends = backendsRes?.data?.data ?? [];
  const connectedOss = useMemo(
    () =>
      backends.filter(
        (item) => !item.is_builtin && item.status === 'connected',
      ),
    [backends],
  );

  const [backendId, setBackendId] = useState<number | undefined>();
  useEffect(() => {
    if (!backendId && connectedOss.length > 0) {
      setBackendId(connectedOss[0].id);
    }
  }, [backendId, connectedOss]);

  const {
    data: bucketsRes,
    isLoading: bucketsLoading,
    isError: bucketsError,
    refetch,
  } = useOssStorageBuckets(backendId, Boolean(backendId));

  const bucketData = bucketsRes?.data?.data;
  const selectedBackend = connectedOss.find((item) => item.id === backendId);

  return (
    <AdminLayout title="OSS 管理">
      <div className="space-y-4">
        {connectedOss.length === 0 && !backendsLoading && (
          <Alert
            type="warning"
            showIcon
            message="暂无测连成功的外部 OSS"
            description="请先在「存储配置」页添加 OSS 并完成「保存并测试」。测连成功后即可在此查看桶与容量。"
          />
        )}

        {connectedOss.length > 0 && (
          <>
            <Card {...adminCardProps}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">选择已连通的外部 OSS</p>
                  <Select
                    className="mt-2 min-w-[280px]"
                    value={backendId}
                    onChange={setBackendId}
                    options={connectedOss.map((item) => ({
                      value: item.id,
                      label: `${item.name} (${item.endpoint})`,
                    }))}
                  />
                </div>
                {selectedBackend && (
                  <div className="text-sm text-gray-500">
                    最近测连：
                    {selectedBackend.last_tested_at
                      ? new Date(selectedBackend.last_tested_at).toLocaleString()
                      : '—'}
                    <Tag color="success" className="ml-2">
                      已连通
                    </Tag>
                  </div>
                )}
              </div>
            </Card>

            <AdminQueryAlert
              isError={bucketsError}
              message="无法加载 OSS 桶信息"
              onRetry={() => refetch()}
            />

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card {...adminCardProps} loading={bucketsLoading}>
                  <Statistic
                    title="对象总数"
                    value={bucketData?.totalObjects ?? 0}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card {...adminCardProps} loading={bucketsLoading}>
                  <Statistic
                    title="总容量"
                    value={formatFileSize(bucketData?.totalBytes ?? 0)}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card {...adminCardProps} loading={bucketsLoading}>
                  <Statistic
                    title="桶数量"
                    value={bucketData?.buckets.length ?? 0}
                  />
                </Card>
              </Col>
            </Row>

            <Card {...adminCardProps} title="存储桶" loading={bucketsLoading}>
              <Table
                rowKey="name"
                dataSource={bucketData?.buckets ?? []}
                pagination={false}
                columns={[
                  { title: '桶名', dataIndex: 'name' },
                  { title: '对象数', dataIndex: 'objectCount' },
                  {
                    title: '容量',
                    dataIndex: 'totalBytes',
                    render: (value: number) => formatFileSize(value),
                  },
                  {
                    title: '创建时间',
                    dataIndex: 'creationDate',
                    render: (value: string | null) =>
                      value ? new Date(value).toLocaleString() : '—',
                  },
                ]}
              />
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
