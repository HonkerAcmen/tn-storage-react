import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Input,
  Space,
  Tag,
  Typography,
} from 'antd';
import { MdBlock, MdSave } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import {
  useAdminForbiddenWords,
  useAdminUpdateForbiddenWords,
} from '@/network/hooks/admin';
import { formatDateTime } from '@/utils/format/formatters';

function parseWordsInput(raw: string): string[] {
  return raw
    .split(/[\n,，;；]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminForbiddenWordsPage() {
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const { data, isLoading, isError, refetch } = useAdminForbiddenWords();
  const updateWords = useAdminUpdateForbiddenWords();
  const config = data?.data?.data;
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (config?.words) {
      setDraft(config.words.join('\n'));
    }
  }, [config?.words]);

  const parsedPreview = useMemo(() => parseWordsInput(draft), [draft]);

  const handleSave = async () => {
    try {
      const res = await updateWords.mutateAsync(parsedPreview);
      const count = res.data?.data?.words?.length ?? parsedPreview.length;
      feedback.success(`已保存 ${count} 条违禁词`);
    } catch (err) {
      feedback.error(err, '保存违禁词失败');
    }
  };

  return (
    <AdminLayout title="违禁词配置">
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="昵称违禁词用于注册与资料修改时的子串匹配（忽略大小写）。配置文件会随「数据备份」中的 app-config 一并导出。"
      />

      <Card
        {...adminCardProps}
        loading={isLoading}
        title={
          <Space>
            <MdBlock className="text-[#5542f6]" />
            <span>违禁词列表</span>
          </Space>
        }
        extra={
          config?.updatedAt ? (
            <Typography.Text type="secondary" className="text-xs">
              更新于 {formatDateTime(new Date(config.updatedAt))}
            </Typography.Text>
          ) : null
        }
      >
        <AdminQueryAlert
          isError={isError}
          message="无法加载违禁词配置"
          onRetry={() => refetch()}
          className="mb-3"
        />

        <Input.TextArea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={14}
          placeholder="每行一个词，也可用逗号、分号分隔"
          disabled={!canWrite}
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Typography.Text type="secondary" className="text-sm">
            当前 {parsedPreview.length} 条
            {config?.configPath ? ` · ${config.configPath}` : ''}
          </Typography.Text>
          <Button
            type="primary"
            icon={<MdSave />}
            onClick={handleSave}
            loading={updateWords.isPending}
            disabled={!canWrite}
          >
            保存配置
          </Button>
        </div>

        {parsedPreview.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {parsedPreview.slice(0, 24).map((word) => (
              <Tag key={word}>{word}</Tag>
            ))}
            {parsedPreview.length > 24 && (
              <Tag>+{parsedPreview.length - 24} …</Tag>
            )}
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
