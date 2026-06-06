import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import {
  MdAdd,
  MdEdit,
  MdLockReset,
  MdDelete,
  MdBlock,
  MdCheckCircle,
  MdHistory,
  MdStorage,
} from 'react-icons/md';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import {
  USERNAME_HINT,
  USERNAME_MAX_LENGTH,
  usernameFormRule,
} from '@/utils/usernameRules';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  useAdminCreateUser,
  useAdminDeleteUser,
  useAdminResetPassword,
  useAdminUpdateUser,
  useAdminUpdateUserStatus,
  useAdminStoragePolicy,
  useAdminUpdateUserQuota,
  useAdminUser,
  useAdminUserLoginLogs,
  useAdminUsers,
} from '@/network/hooks/admin';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { AdminCloudUserResponse } from '@/network/types/Response/user';
import { formatDateTime, formatFileSize } from '@/utils/format/formatters';
import EmailChallengeModal from '@/components/verification/EmailChallengeModal';
import { VerificationPurpose } from '@/network/hooks/verification';
import { useAdminProfile } from '@/network/hooks/adminAuth';

type UserFormValues = {
  username: string;
  email: string;
  phone: string;
  password?: string;
  desc?: string;
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    AdminCloudUserResponse['account_status'] | undefined
  >();
  const limit = 10;

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit,
    keyword: keyword || undefined,
    status: statusFilter,
  });
  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const resetPassword = useAdminResetPassword();
  const updateStatus = useAdminUpdateUserStatus();
  const updateQuota = useAdminUpdateUserQuota();
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const { data: adminProfile } = useAdminProfile();
  const adminEmail = adminProfile?.data?.data?.email;
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengePurpose, setChallengePurpose] =
    useState<VerificationPurpose>('admin.reset_user_password');
  const pendingChallengeAction = useRef<
    ((token: string) => Promise<void>) | null
  >(null);

  const runWithChallenge = (
    purpose: VerificationPurpose,
    action: (token: string) => Promise<void>,
  ) => {
    pendingChallengeAction.current = action;
    setChallengePurpose(purpose);
    setChallengeOpen(true);
  };

  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [loginLogUser, setLoginLogUser] = useState<AdminCloudUserResponse | null>(
    null,
  );
  const [loginLogPage, setLoginLogPage] = useState(1);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [quotaUserId, setQuotaUserId] = useState<number | null>(null);
  const loginLogLimit = 10;
  const [form] = Form.useForm<UserFormValues>();
  const [resetForm] = Form.useForm<{ password: string }>();
  const resetPasswordValue = Form.useWatch('password', resetForm) ?? '';
  const [quotaForm] = Form.useForm<{ quotaGb: number }>();

  const { data: quotaDetailRes, isLoading: quotaDetailLoading } =
    useAdminUser(quotaUserId, quotaOpen);
  const { data: storagePolicyRes } = useAdminStoragePolicy(quotaOpen);
  const storagePool = storagePolicyRes?.data?.data?.pool;
  const storageAlerts = storagePolicyRes?.data?.data?.alerts ?? [];
  const poolMaxGb = storagePool
    ? Math.max(1, Math.floor(storagePool.userPoolBytes / (1024 * 1024 * 1024)))
    : 10240;

  const result = data?.data?.data;
  const users = result?.items ?? [];
  const total = result?.pagination.total ?? 0;

  const { data: loginLogsRes, isLoading: loginLogsLoading } =
    useAdminUserLoginLogs(loginLogUser?.id ?? null, {
      page: loginLogPage,
      limit: loginLogLimit,
    });
  const loginLogs = loginLogsRes?.data?.data?.items ?? [];
  const loginLogsTotal = loginLogsRes?.data?.data?.pagination.total ?? 0;
  const quotaDetail = quotaDetailRes?.data?.data;

  useEffect(() => {
    if (quotaOpen && quotaDetail?.storage) {
      quotaForm.setFieldsValue({
        quotaGb: Math.round(quotaDetail.storage.quotaBytes / 1024 / 1024 / 1024),
      });
    }
  }, [quotaOpen, quotaDetail, quotaForm]);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setFormOpen(true);
  };

  const openEdit = (record: AdminCloudUserResponse) => {
    setEditingId(record.id);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      desc: record.desc,
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingId) {
        await updateUser.mutateAsync({
          id: editingId,
          username: values.username,
          email: values.email,
          phone: values.phone,
          desc: values.desc,
        });
        feedback.success('用户已更新');
      } else {
        await createUser.mutateAsync({
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password!,
        });
        feedback.success('用户已创建');
      }
      setFormOpen(false);
      await refetch();
    } catch (err) {
      feedback.error(err, '操作失败');
    }
  };

  const handleResetPassword = async () => {
    const values = await resetForm.validateFields();
    if (!resetUserId) return;
    runWithChallenge('admin.reset_user_password', async (challengeToken) => {
      try {
        await resetPassword.mutateAsync({
          id: resetUserId,
          password: values.password,
          challengeToken,
        });
        feedback.success('密码已重置');
        setResetOpen(false);
        resetForm.resetFields();
      } catch (err) {
        feedback.error(err, '重置失败');
      }
    });
  };

  const handleToggleStatus = async (record: AdminCloudUserResponse) => {
    const nextStatus =
      record.account_status === 'active' ? 'disabled' : 'active';
    runWithChallenge('admin.disable_user', async (challengeToken) => {
      try {
        await updateStatus.mutateAsync({
          id: record.id,
          status: nextStatus,
          challengeToken,
        });
        feedback.success(
          nextStatus === 'disabled' ? '账号已禁用' : '账号已启用',
        );
      } catch (err) {
        feedback.error(err, '状态更新失败');
      }
    });
  };

  const handleSaveQuota = async () => {
    if (!quotaUserId) return;
    const values = await quotaForm.validateFields();
    try {
      await updateQuota.mutateAsync({
        id: quotaUserId,
        quotaBytes: values.quotaGb * 1024 * 1024 * 1024,
      });
      feedback.success('存储配额已更新');
      setQuotaOpen(false);
      setQuotaUserId(null);
    } catch (err) {
      feedback.error(err, '配额更新失败');
    }
  };

  const handleSearch = () => {
    setKeyword(searchInput.trim());
    setPage(1);
  };

  return (
    <AdminLayout title="云盘用户">
      <EmailChallengeModal
        open={challengeOpen}
        purpose={challengePurpose}
        scope="admin"
        admin
        email={adminEmail}
        onClose={() => {
          setChallengeOpen(false);
          pendingChallengeAction.current = null;
        }}
        onVerified={async (token) => {
          const action = pendingChallengeAction.current;
          pendingChallengeAction.current = null;
          setChallengeOpen(false);
          if (action) await action(token);
        }}
      />
      <Card
        {...adminCardProps}
        extra={
          canWrite ? (
            <Button type="primary" icon={<MdAdd />} onClick={openCreate}>
              新建用户
            </Button>
          ) : (
            <span className="text-sm text-gray-400">只读角色无写权限</span>
          )
        }
      >
        <Space wrap className="mb-4">
          <Input.Search
            placeholder="搜索用户名 / 邮箱 / 手机"
            allowClear
            className="w-64"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={handleSearch}
            onClear={() => {
              setSearchInput('');
              setKeyword('');
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="状态"
            className="w-32"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'active', label: '正常' },
              { value: 'disabled', label: '已禁用' },
            ]}
          />
        </Space>

        <AdminQueryAlert
          isError={isError}
          message="无法加载用户列表"
          onRetry={() => refetch()}
        />

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={users}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p) => setPage(p),
          }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 70 },
            { title: '用户名', dataIndex: 'username', width: 120 },
            { title: '邮箱', dataIndex: 'email', ellipsis: true },
            { title: '手机', dataIndex: 'phone', width: 130 },
            {
              title: '状态',
              dataIndex: 'account_status',
              width: 90,
              render: (status: AdminCloudUserResponse['account_status']) => (
                <Tag color={status === 'active' ? 'success' : 'error'}>
                  {status === 'active' ? '正常' : '已禁用'}
                </Tag>
              ),
            },
            {
              title: '简介',
              dataIndex: 'desc',
              ellipsis: true,
              render: (v: string) => v || '-',
            },
            {
              title: '操作',
              key: 'actions',
              width: 420,
              fixed: 'right',
              render: (_, record) => (
                <Space wrap>
                  <Button
                    size="small"
                    icon={<MdHistory />}
                    onClick={() => {
                      setLoginLogUser(record);
                      setLoginLogPage(1);
                    }}
                  >
                    登录历史
                  </Button>
                  {canWrite ? (
                    <>
                      <Button
                        size="small"
                        icon={<MdEdit />}
                        onClick={() => openEdit(record)}
                      >
                        编辑
                      </Button>
                    <Button
                      size="small"
                      icon={<MdStorage />}
                      onClick={() => {
                        setQuotaUserId(record.id);
                        setQuotaOpen(true);
                      }}
                    >
                      配额
                    </Button>
                    <Button
                      size="small"
                      icon={<MdLockReset />}
                      onClick={() => {
                        setResetUserId(record.id);
                        resetForm.resetFields();
                        setResetOpen(true);
                      }}
                    >
                      重置密码
                    </Button>
                    <Popconfirm
                      title={
                        record.account_status === 'active'
                          ? '确定禁用该账号？禁用后无法登录云盘。'
                          : '确定启用该账号？'
                      }
                      onConfirm={() => handleToggleStatus(record)}
                    >
                      <Button
                        size="small"
                        danger={record.account_status === 'active'}
                        icon={
                          record.account_status === 'active' ? (
                            <MdBlock />
                          ) : (
                            <MdCheckCircle />
                          )
                        }
                      >
                        {record.account_status === 'active' ? '禁用' : '启用'}
                      </Button>
                    </Popconfirm>
                    <Button
                      size="small"
                      danger
                      icon={<MdDelete />}
                      onClick={() =>
                        runWithChallenge('admin.delete_user', async (token) => {
                          try {
                            await deleteUser.mutateAsync({
                              id: record.id,
                              challengeToken: token,
                            });
                            feedback.success('已删除');
                          } catch (err) {
                            feedback.error(err, '删除失败');
                          }
                        })
                      }
                    >
                      删除
                    </Button>
                    </>
                  ) : null}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingId ? '编辑用户' : '新建用户'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createUser.isPending || updateUser.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="username"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }, usernameFormRule()]}
            extra={<span className="text-xs text-gray-400">{USERNAME_HINT}</span>}
          >
            <Input maxLength={USERNAME_MAX_LENGTH} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, len: 11 }]}
          >
            <Input />
          </Form.Item>
          {!editingId && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="desc" label="简介">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        onOk={handleResetPassword}
        confirmLoading={resetPassword.isPending}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical" className="mt-4">
          <Form.Item
            name="password"
            label="新密码"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <PasswordStrengthBar password={resetPasswordValue} className="mb-2" />
        </Form>
      </Modal>

      <Modal
        title={
          quotaDetail
            ? `存储配额 — ${quotaDetail.username}`
            : '存储配额'
        }
        open={quotaOpen}
        onCancel={() => {
          setQuotaOpen(false);
          setQuotaUserId(null);
        }}
        onOk={handleSaveQuota}
        confirmLoading={updateQuota.isPending}
        destroyOnClose
      >
        {quotaDetailLoading ? (
          <p className="py-4 text-center text-gray-400">加载中…</p>
        ) : (
          <Form form={quotaForm} layout="vertical" className="mt-4">
            {quotaDetail?.storage && (
              <p className="mb-3 text-sm text-gray-500">
                已用 {formatFileSize(quotaDetail.storage.usedBytes)} /{' '}
                {formatFileSize(quotaDetail.storage.quotaBytes)}（
                {quotaDetail.storage.totalFiles} 个文件）
              </p>
            )}
            {storagePool && (
              <p className="mb-3 text-sm text-gray-500">
                全站用户池 {formatFileSize(storagePool.userPoolBytes)}，当前动态人均{' '}
                {formatFileSize(storagePool.dynamicPerUserQuotaBytes)}（活跃用户{' '}
                {storagePool.activeUserCount} 人）。单用户上限不得超过用户池总量。
              </p>
            )}
            {storageAlerts.some((item) => item.code === 'PER_USER_QUOTA_LOW') && (
              <p className="mb-3 text-sm text-amber-600">
                警告：活跃用户较多，动态人均配额已低于告警阈值，建议在「存储分析」中调整总盘或用户池比例。
              </p>
            )}
            <Form.Item
              name="quotaGb"
              label="配额上限（GB）"
              rules={[{ required: true, type: 'number', min: 1 }]}
              extra="保存后仅影响该用户；执行「重新均分」会覆盖为动态人均值"
            >
              <InputNumber min={1} max={poolMaxGb} className="w-full" />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Drawer
        title={
          loginLogUser
            ? `登录历史 · ${loginLogUser.username}`
            : '登录历史'
        }
        open={!!loginLogUser}
        onClose={() => setLoginLogUser(null)}
        width={560}
      >
        <Table
          rowKey="id"
          loading={loginLogsLoading}
          dataSource={loginLogs}
          pagination={{
            current: loginLogPage,
            pageSize: loginLogLimit,
            total: loginLogsTotal,
            showSizeChanger: false,
            onChange: (p) => setLoginLogPage(p),
          }}
          columns={[
            {
              title: '时间',
              dataIndex: 'login_at',
              render: (v: string) => formatDateTime(new Date(v)),
            },
            {
              title: 'IP',
              dataIndex: 'ip',
              render: (v: string | null) => v || '-',
            },
            {
              title: 'User-Agent',
              dataIndex: 'user_agent',
              ellipsis: true,
              render: (v: string | null) => v || '-',
            },
          ]}
        />
      </Drawer>
    </AdminLayout>
  );
}
