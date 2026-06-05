import { useMemo, useState } from 'react';
import Link from 'next/link';
import { message } from 'antd';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  AiFillBell,
  AiFillCloud,
  AiFillCloseCircle,
  AiFillFileText,
  AiFillLock,
  AiFillSafetyCertificate,
} from 'react-icons/ai';
import {
  useChangeMyPassword,
  useGetMyLoginHistory,
  useGetMySettings,
  useGetMyStorage,
  useResetMyPermissions,
  useUpdateMySettings,
} from '@/network/hooks/user';
import { useGetShares, useRevokeShare } from '@/network/hooks/file';
import { UpdateUserSettingsRequest } from '@/network/types/Request/user';
import { formatFileSize } from '@/utils/format/formatters';
import { buildSharePageUrl } from '@/utils/shareUrl';

interface SettingsProps {
  onClose: () => void;
}

type SettingsTab =
  | 'general'
  | 'storage'
  | 'security'
  | 'notification'
  | 'permissions';

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
};

export default function Settings({ onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const tabs = [
    { id: 'general', label: '通用设置', icon: <AiFillFileText /> },
    { id: 'storage', label: '存储设置', icon: <AiFillCloud /> },
    { id: 'security', label: '安全设置', icon: <AiFillLock /> },
    { id: 'notification', label: '通知设置', icon: <AiFillBell /> },
    { id: 'permissions', label: '权限设置', icon: <AiFillSafetyCertificate /> },
  ] as const;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-400/50">
      <div className="relative flex h-[80vh] w-[90vw] max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">设置</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-gray-100"
          >
            <AiFillCloseCircle className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-48 border-r border-gray-200 bg-gray-50 p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center space-x-2 rounded-lg px-4 py-3 text-left transition ${
                      activeTab === tab.id
                        ? 'bg-white text-[#5542f6] shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'storage' && <StorageSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notification' && <NotificationSettings />}
            {activeTab === 'permissions' && <PermissionsSettings />}
          </main>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  const [messageApi, contextHolder] = message.useMessage();
  const { data } = useGetMySettings();
  const updateSettings = useUpdateMySettings();
  const settings = data?.data?.data;
  const [draft, setDraft] = useState<UpdateUserSettingsRequest>({});

  const currentDraft = {
    language: draft.language ?? settings?.language ?? 'zh-CN',
    theme: draft.theme ?? settings?.theme ?? 'system',
    auto_save: draft.auto_save ?? settings?.auto_save ?? true,
  };

  const save = async () => {
    await updateSettings.mutateAsync(currentDraft);
    messageApi.success('通用设置已保存');
  };

  return (
    <Section title="通用设置">
      {contextHolder}
      <SettingRow
        title="语言设置"
        desc="选择界面显示语言"
        control={
          <select
            value={currentDraft.language}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, language: e.target.value }))
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
          </select>
        }
      />
      <SettingRow
        title="主题设置"
        desc="选择界面主题"
        control={
          <select
            value={currentDraft.theme}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, theme: e.target.value }))
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          >
            <option value="light">浅色模式</option>
            <option value="dark">深色模式</option>
            <option value="system">跟随系统</option>
          </select>
        }
      />
      <SettingRow
        title="自动保存"
        desc="自动保存文件更改"
        control={
          <Toggle
            checked={Boolean(currentDraft.auto_save)}
            onChange={(checked) =>
              setDraft((prev) => ({ ...prev, auto_save: checked }))
            }
          />
        }
      />
      <SaveBar onSave={save} loading={updateSettings.isPending} />
    </Section>
  );
}

function StorageSettings() {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: settingsResponse } = useGetMySettings();
  const { data: storageResponse } = useGetMyStorage();
  const updateSettings = useUpdateMySettings();
  const settings = settingsResponse?.data?.data;
  const storage = storageResponse?.data?.data;
  const [draft, setDraft] = useState<UpdateUserSettingsRequest>({});

  const currentDraft = {
    default_upload_parent_id:
      draft.default_upload_parent_id ?? settings?.default_upload_parent_id ?? 1,
    auto_clean_temp:
      draft.auto_clean_temp ?? settings?.auto_clean_temp ?? false,
  };

  const usedBytes = storage?.usedBytes ?? 0;
  const totalBytes = storage?.totalBytes ?? 100 * 1024 * 1024 * 1024;
  const usedPercent =
    totalBytes === 0
      ? 0
      : Math.min(100, Math.round((usedBytes / totalBytes) * 100));

  const save = async () => {
    await updateSettings.mutateAsync(currentDraft);
    messageApi.success('存储设置已保存');
  };

  return (
    <Section title="存储设置">
      {contextHolder}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium text-gray-800">存储空间使用情况</p>
          <span className="text-sm text-gray-500">
            {formatFileSize(usedBytes)} / {formatFileSize(totalBytes)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-[#5542f6]"
            style={{ width: `${usedPercent}%` }}
          ></div>
        </div>
      </div>

      <SettingRow
        title="默认上传位置"
        desc="根目录固定为 1，上传组件可读取此默认父目录"
        control={
          <input
            type="number"
            min={1}
            value={currentDraft.default_upload_parent_id}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                default_upload_parent_id: Number(e.target.value) || 1,
              }))
            }
            className="w-28 rounded-lg border border-gray-200 px-4 py-2 text-sm"
          />
        }
      />

      <SettingRow
        title="自动清理临时文件"
        desc="仅保存用户偏好，供上传和缓存策略读取"
        control={
          <Toggle
            checked={Boolean(currentDraft.auto_clean_temp)}
            onChange={(checked) =>
              setDraft((prev) => ({ ...prev, auto_clean_temp: checked }))
            }
          />
        }
      />
      <SaveBar onSave={save} loading={updateSettings.isPending} />
    </Section>
  );
}

function SecuritySettings() {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: settingsResponse } = useGetMySettings();
  const { data: historyResponse } = useGetMyLoginHistory();
  const updateSettings = useUpdateMySettings();
  const changePassword = useChangeMyPassword();
  const settings = settingsResponse?.data?.data;
  const history = historyResponse?.data?.data ?? [];
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(
    null
  );
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '',
    newPassword: '',
  });

  const currentTwoFactorEnabled =
    twoFactorEnabled ?? Boolean(settings?.two_factor_enabled);

  const saveTwoFactor = async () => {
    try {
      await updateSettings.mutateAsync({
        two_factor_enabled: currentTwoFactorEnabled,
      });
      messageApi.success('安全设置已保存');
    } catch (err) {
      messageApi.error(getApiErrorMessage(err, '安全设置保存失败'));
    }
  };

  const submitPassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      messageApi.error('请填写完整密码信息');
      return;
    }
    try {
      await changePassword.mutateAsync(passwordForm);
      setPasswordForm({ oldPassword: '', newPassword: '' });
      messageApi.success('密码已更新');
    } catch (err) {
      messageApi.error(getApiErrorMessage(err, '密码修改失败'));
    }
  };

  return (
    <Section title="安全设置">
      {contextHolder}
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="font-medium text-gray-800">修改密码</p>
        <p className="mb-4 text-sm text-gray-500">定期更改密码以保护账户安全</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="password"
            placeholder="旧密码"
            value={passwordForm.oldPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                oldPassword: e.target.value,
              }))
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="新密码"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          />
        </div>
        <div className="mt-4">
          <ActionButton
            onClick={submitPassword}
            loading={changePassword.isPending}
          >
            修改密码
          </ActionButton>
        </div>
      </div>

      <SettingRow
        title="两步验证"
        desc="为账户添加额外的安全保护"
        control={
          <Toggle
            checked={currentTwoFactorEnabled}
            onChange={setTwoFactorEnabled}
          />
        }
      />

      <SaveBar onSave={saveTwoFactor} loading={updateSettings.isPending} />

      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-4">
          <p className="font-medium text-gray-800">登录历史</p>
          <p className="text-sm text-gray-500">最近 20 条登录记录</p>
        </div>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">暂无登录记录</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.ip || '未知 IP'}
                  </p>
                  <p className="max-w-[32rem] truncate text-xs text-gray-500">
                    {item.user_agent || '未知设备'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(item.loginAt).toLocaleString('zh-CN')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Section>
  );
}

function NotificationSettings() {
  const [messageApi, contextHolder] = message.useMessage();
  const { data } = useGetMySettings();
  const updateSettings = useUpdateMySettings();
  const settings = data?.data?.data;
  const [draft, setDraft] = useState<UpdateUserSettingsRequest>({});

  const currentDraft = {
    email_notification:
      draft.email_notification ?? settings?.email_notification ?? true,
    upload_notification:
      draft.upload_notification ?? settings?.upload_notification ?? true,
    share_notification:
      draft.share_notification ?? settings?.share_notification ?? false,
  };

  const save = async () => {
    await updateSettings.mutateAsync(currentDraft);
    messageApi.success('通知设置已保存');
  };

  return (
    <Section title="通知设置">
      {contextHolder}
      <SettingRow
        title="邮件通知"
        desc="接收重要更新和通知邮件"
        control={
          <Toggle
            checked={Boolean(currentDraft.email_notification)}
            onChange={(checked) =>
              setDraft((prev) => ({ ...prev, email_notification: checked }))
            }
          />
        }
      />
      <SettingRow
        title="文件上传完成通知"
        desc="文件上传完成后发送通知"
        control={
          <Toggle
            checked={Boolean(currentDraft.upload_notification)}
            onChange={(checked) =>
              setDraft((prev) => ({ ...prev, upload_notification: checked }))
            }
          />
        }
      />
      <SettingRow
        title="共享文件通知"
        desc="当有人共享文件时通知你"
        control={
          <Toggle
            checked={Boolean(currentDraft.share_notification)}
            onChange={(checked) =>
              setDraft((prev) => ({ ...prev, share_notification: checked }))
            }
          />
        }
      />
      <SaveBar onSave={save} loading={updateSettings.isPending} />
    </Section>
  );
}

function PermissionsSettings() {
  const [messageApi, contextHolder] = message.useMessage();
  const { data } = useGetMySettings();
  const { data: sharesResponse } = useGetShares();
  const updateSettings = useUpdateMySettings();
  const resetPermissions = useResetMyPermissions();
  const revokeShare = useRevokeShare();
  const settings = data?.data?.data;
  const shares = sharesResponse?.data?.data ?? [];
  const [draft, setDraft] = useState<UpdateUserSettingsRequest>({});

  const currentDraft = {
    allow_file_upload:
      draft.allow_file_upload ?? settings?.allow_file_upload ?? true,
    allow_file_download:
      draft.allow_file_download ?? settings?.allow_file_download ?? true,
    allow_file_delete:
      draft.allow_file_delete ?? settings?.allow_file_delete ?? true,
    allow_favorite: draft.allow_favorite ?? settings?.allow_favorite ?? true,
    allow_share: draft.allow_share ?? settings?.allow_share ?? true,
  };

  const save = async () => {
    await updateSettings.mutateAsync(currentDraft);
    messageApi.success('权限设置已保存');
  };

  const resetToRoleDefaults = async () => {
    await resetPermissions.mutateAsync();
    setDraft({});
    messageApi.success('已恢复为角色默认权限');
  };

  const roleLabel = useMemo(
    () =>
      settings?.role === 'admin'
        ? '管理员'
        : settings?.role === 'viewer'
          ? '访客'
          : '普通用户',
    [settings?.role]
  );

  return (
    <Section title="权限设置">
      {contextHolder}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-800">我的权限</p>
            <p className="text-sm text-gray-500">
              当前角色：{roleLabel}
              。你可以在角色模板基础上做个性化调整。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                settings?.permissions_customized
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {settings?.permissions_customized ? '已自定义权限' : '角色默认权限'}
            </span>
            <ActionButton
              onClick={() => void resetToRoleDefaults()}
              loading={resetPermissions.isPending}
            >
              恢复角色默认
            </ActionButton>
          </div>
        </div>
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          下列权限会直接影响上传、下载、删除、收藏和分享接口是否可用。
        </div>
        <div className="space-y-4">
          <SettingRow
            title="允许上传"
            desc="控制初始化上传、上传分片和新建文件夹"
            control={
              <Toggle
                checked={Boolean(currentDraft.allow_file_upload)}
                onChange={(checked) =>
                  setDraft((prev) => ({ ...prev, allow_file_upload: checked }))
                }
              />
            }
          />
          <SettingRow
            title="允许下载"
            desc="控制文件下载和分片读取"
            control={
              <Toggle
                checked={Boolean(currentDraft.allow_file_download)}
                onChange={(checked) =>
                  setDraft((prev) => ({
                    ...prev,
                    allow_file_download: checked,
                  }))
                }
              />
            }
          />
          <SettingRow
            title="允许删除"
            desc="控制移入回收站、彻底删除和清空回收站"
            control={
              <Toggle
                checked={Boolean(currentDraft.allow_file_delete)}
                onChange={(checked) =>
                  setDraft((prev) => ({ ...prev, allow_file_delete: checked }))
                }
              />
            }
          />
          <SettingRow
            title="允许收藏"
            desc="控制收藏和取消收藏接口"
            control={
              <Toggle
                checked={Boolean(currentDraft.allow_favorite)}
                onChange={(checked) =>
                  setDraft((prev) => ({ ...prev, allow_favorite: checked }))
                }
              />
            }
          />
          <SettingRow
            title="允许共享"
            desc="普通用户默认可分享文件"
            control={
              <Toggle
                checked={Boolean(currentDraft.allow_share)}
                onChange={(checked) =>
                  setDraft((prev) => ({ ...prev, allow_share: checked }))
                }
              />
            }
          />
        </div>
        <div className="mt-4">
          <SaveBar onSave={save} loading={updateSettings.isPending} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4">
          <p className="font-medium text-gray-800">分享管理</p>
          <p className="text-sm text-gray-500">
            查看已创建的分享链接，复制下载地址，或手动失效。
          </p>
        </div>
        <div className="space-y-3">
          {shares.length === 0 ? (
            <p className="text-sm text-gray-500">暂无分享记录</p>
          ) : (
            shares.map((share) => (
              <div
                key={share.token}
                className="rounded-lg border border-gray-100 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {share.file?.filename || share.file_uuid}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      下载次数 {share.downloadCount} · 创建于{' '}
                      {new Date(share.createdAt).toLocaleString('zh-CN')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {share.revokedAt
                        ? `已失效：${new Date(share.revokedAt).toLocaleString('zh-CN')}`
                        : share.expiresAt
                          ? `过期时间：${new Date(share.expiresAt).toLocaleString('zh-CN')}`
                          : '长期有效'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      最近访问：
                      {share.lastAccessAt
                        ? new Date(share.lastAccessAt).toLocaleString('zh-CN')
                        : '暂无'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={async () => {
                        const shareUrl = buildSharePageUrl(share.token);
                        await navigator.clipboard.writeText(shareUrl);
                        messageApi.success('链接已复制');
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      复制链接
                    </button>
                    {!share.revokedAt && (
                      <button
                        onClick={async () => {
                          await revokeShare.mutateAsync({ token: share.token });
                          messageApi.success('分享链接已失效');
                        }}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        设为失效
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {settings?.role === 'admin' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-gray-800">云盘用户管理已迁移</p>
          <p className="mt-1 text-sm text-gray-600">
            用户与权限管理请使用独立管理后台，与云盘账号体系分离。
          </p>
          <Link
            href="/admin/login"
            className="mt-3 inline-block rounded-lg bg-[#5542f6] px-4 py-2 text-sm text-white transition hover:bg-[#4535d4]"
          >
            前往管理后台
          </Link>
        </div>
      )}
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({
  title,
  desc,
  control,
}: {
  title: string;
  desc: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      {control}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#5542f6] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
    </label>
  );
}

function SaveBar({
  onSave,
  loading,
}: {
  onSave: () => void | Promise<void>;
  loading?: boolean;
}) {
  return (
    <div className="flex justify-end">
      <ActionButton onClick={() => void onSave()} loading={loading}>
        保存设置
      </ActionButton>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg bg-[#5542f6] px-4 py-2 text-sm text-white transition hover:bg-[#4532e6] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? '处理中...' : children}
    </button>
  );
}
