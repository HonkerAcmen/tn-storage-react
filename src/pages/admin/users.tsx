import { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { MdAdd, MdEdit, MdLockReset, MdDelete } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  useAdminCreateUser,
  useAdminDeleteUser,
  useAdminResetPassword,
  useAdminUpdateUser,
  useAdminUsers,
} from '@/network/hooks/admin';
import { AdminUserRoleResponse } from '@/network/types/Response/user';

const roleLabels: Record<AdminUserRoleResponse['role'], string> = {
  admin: '管理员',
  user: '普通用户',
  viewer: '只读用户',
};

const roleColors: Record<AdminUserRoleResponse['role'], string> = {
  admin: 'red',
  user: 'blue',
  viewer: 'default',
};

type UserFormValues = {
  username: string;
  email: string;
  phone: string;
  password?: string;
  desc?: string;
  role: AdminUserRoleResponse['role'];
};

export default function AdminUsersPage() {
  const { data, isLoading, refetch } = useAdminUsers();
  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const resetPassword = useAdminResetPassword();
  const feedback = useAdminFeedback();

  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const [resetForm] = Form.useForm<{ password: string }>();

  const users = data?.data?.data ?? [];

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user' });
    setFormOpen(true);
  };

  const openEdit = (record: AdminUserRoleResponse) => {
    setEditingId(record.id);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      desc: record.desc,
      role: record.role,
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
          role: values.role,
        });
        feedback.success('用户已更新');
      } else {
        await createUser.mutateAsync({
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password!,
          role: values.role,
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
    try {
      await resetPassword.mutateAsync({
        id: resetUserId,
        password: values.password,
      });
      feedback.success('密码已重置');
      setResetOpen(false);
      resetForm.resetFields();
    } catch (err) {
      feedback.error(err, '重置失败');
    }
  };

  return (
    <AdminLayout title="用户管理">
      <Card
        {...adminCardProps}
        extra={
          <Button type="primary" icon={<MdAdd />} onClick={openCreate}>
            新建用户
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={users}
          scroll={{ x: 900 }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 70 },
            { title: '用户名', dataIndex: 'username' },
            { title: '邮箱', dataIndex: 'email' },
            { title: '手机', dataIndex: 'phone', width: 130 },
            {
              title: '角色',
              dataIndex: 'role',
              width: 110,
              render: (role: AdminUserRoleResponse['role']) => (
                <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
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
              width: 220,
              fixed: 'right',
              render: (_, record) => (
                <Space>
                  <Button
                    size="small"
                    icon={<MdEdit />}
                    onClick={() => openEdit(record)}
                  >
                    编辑
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
                    title="确定删除该用户？"
                    onConfirm={async () => {
                      try {
                        await deleteUser.mutateAsync(record.id);
                        feedback.success('已删除');
                      } catch (err) {
                        feedback.error(err, '删除失败');
                      }
                    }}
                  >
                    <Button size="small" danger icon={<MdDelete />}>
                      删除
                    </Button>
                  </Popconfirm>
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
            label="用户名"
            rules={[{ required: true, min: 3 }]}
          >
            <Input />
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
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'admin', label: '管理员' },
                { value: 'user', label: '普通用户' },
                { value: 'viewer', label: '只读用户' },
              ]}
            />
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
        </Form>
      </Modal>
    </AdminLayout>
  );
}
