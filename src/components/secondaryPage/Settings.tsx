import { useMemo, useState } from 'react';
import { message } from 'antd';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  AiFillBell,
  AiFillCloud,
  AiFillCloseCircle,
  AiFillFileText,
  AiFillLock,
  AiOutlineShareAlt,
} from 'react-icons/ai';
import {
  useChangeMyPassword,
  useGetMyLoginHistory,
  useGetMySettings,
  useGetMyStorage,
  useUpdateMySettings,
} from '@/network/hooks/user';
import { useGetShares, useRevokeShare } from '@/network/hooks/file';
import { UpdateUserSettingsRequest } from '@/network/types/Request/user';
import { formatFileSize } from '@/utils/format/formatters';
import { buildSharePageUrl } from '@/utils/shareUrl';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import { validatePasswordConfirm } from '@/utils/passwordConfirm';
import {
  formatDateTimeByLanguage,
  useLocale,
} from '@/contexts/LocaleContext';
import { normalizeLanguage } from '@/i18n/types';
import { normalizeThemeSetting } from '@/utils/theme';

interface SettingsProps {
  onClose: () => void;
}

type SettingsTab =
  | 'general'
  | 'storage'
  | 'security'
  | 'notification'
  | 'shares';

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function Settings({ onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { t } = useLocale();
  const tabs = [
    { id: 'general', label: t('settings.tab.general'), icon: <AiFillFileText /> },
    { id: 'storage', label: t('settings.tab.storage'), icon: <AiFillCloud /> },
    { id: 'security', label: t('settings.tab.security'), icon: <AiFillLock /> },
    {
      id: 'notification',
      label: t('settings.tab.notification'),
      icon: <AiFillBell />,
    },
    {
      id: 'shares',
      label: t('settings.tab.shares'),
      icon: <AiOutlineShareAlt />,
    },
  ] as const;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-400/50">
      <div className="relative flex h-[80vh] w-[90vw] max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">{t('settings.title')}</h2>
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
            {activeTab === 'shares' && <ShareSettings />}
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
  const { t, setLanguage } = useLocale();
  const settings = data?.data?.data;
  const [draft, setDraft] = useState<UpdateUserSettingsRequest>({});

  const currentDraft = {
    language: draft.language ?? settings?.language ?? 'zh-CN',
    theme: normalizeThemeSetting(draft.theme ?? settings?.theme),
    auto_save: draft.auto_save ?? settings?.auto_save ?? true,
  };

  const save = async () => {
    await updateSettings.mutateAsync(currentDraft);
    if (currentDraft.language) {
      setLanguage(normalizeLanguage(currentDraft.language));
    }
    messageApi.success(t('settings.general.saved'));
  };

  return (
    <Section title={t('settings.tab.general')}>
      {contextHolder}
      <SettingRow
        title={t('settings.general.language.title')}
        desc={t('settings.general.language.desc')}
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
        title={t('settings.general.theme.title')}
        desc={t('settings.general.theme.desc')}
        control={
          <select
            value={currentDraft.theme}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, theme: e.target.value }))
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          >
            <option value="light">{t('theme.light')}</option>
            <option value="dark">{t('theme.dark')}</option>
          </select>
        }
      />
      <SettingRow
        title={t('settings.general.autoSave.title')}
        desc={t('settings.general.autoSave.desc')}
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
  const { t } = useLocale();
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
    messageApi.success(t('settings.storage.saved'));
  };

  return (
    <Section title={t('settings.tab.storage')}>
      {contextHolder}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium text-gray-800">{t('settings.storage.usage')}</p>
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
        title={t('settings.storage.defaultUpload.title')}
        desc={t('settings.storage.defaultUpload.desc')}
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
        title={t('settings.storage.autoClean.title')}
        desc={t('settings.storage.autoClean.desc')}
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
  const { t, language } = useLocale();
  const settings = settingsResponse?.data?.data;
  const history = historyResponse?.data?.data ?? [];
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(
    null
  );
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const currentTwoFactorEnabled =
    twoFactorEnabled ?? Boolean(settings?.two_factor_enabled);

  const saveTwoFactor = async () => {
    try {
      await updateSettings.mutateAsync({
        two_factor_enabled: currentTwoFactorEnabled,
      });
      messageApi.success(t('settings.security.saved'));
    } catch (err) {
      messageApi.error(getApiErrorMessage(err, t('settings.security.saveFailed')));
    }
  };

  const submitPassword = async () => {
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmNewPassword
    ) {
      messageApi.error(t('settings.security.password.fillAll'));
      return;
    }
    const confirmError = validatePasswordConfirm(
      passwordForm.newPassword,
      passwordForm.confirmNewPassword,
    );
    if (confirmError) {
      setConfirmPasswordError(confirmError);
      messageApi.error(confirmError);
      return;
    }
    setConfirmPasswordError('');
    try {
      await changePassword.mutateAsync(passwordForm);
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      messageApi.success(t('settings.security.password.updated'));
    } catch (err) {
      messageApi.error(getApiErrorMessage(err, t('settings.security.password.failed')));
    }
  };

  return (
    <Section title={t('settings.tab.security')}>
      {contextHolder}
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="font-medium text-gray-800">{t('settings.security.password.title')}</p>
        <p className="mb-4 text-sm text-gray-500">{t('settings.security.password.desc')}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="password"
            placeholder={t('settings.security.password.old')}
            value={passwordForm.oldPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                oldPassword: e.target.value,
              }))
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm md:col-span-2"
          />
          <input
            type="password"
            placeholder={t('settings.security.password.new')}
            value={passwordForm.newPassword}
            onChange={(e) => {
              const newPassword = e.target.value;
              setPasswordForm((prev) => ({
                ...prev,
                newPassword,
              }));
              if (passwordForm.confirmNewPassword) {
                setConfirmPasswordError(
                  validatePasswordConfirm(
                    newPassword,
                    passwordForm.confirmNewPassword,
                  ) ?? '',
                );
              }
            }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          />
          <input
            type="password"
            placeholder={t('settings.security.password.confirm')}
            value={passwordForm.confirmNewPassword}
            onChange={(e) => {
              const confirmNewPassword = e.target.value;
              setPasswordForm((prev) => ({
                ...prev,
                confirmNewPassword,
              }));
              setConfirmPasswordError(
                validatePasswordConfirm(
                  passwordForm.newPassword,
                  confirmNewPassword,
                ) ?? '',
              );
            }}
            className={`rounded-lg border px-4 py-2 text-sm ${
              confirmPasswordError
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200'
            }`}
          />
        </div>
        {confirmPasswordError ? (
          <p className="mt-2 text-sm text-red-500">{confirmPasswordError}</p>
        ) : null}
        <PasswordStrengthBar
          password={passwordForm.newPassword}
          className="mt-3"
        />
        <div className="mt-4">
          <ActionButton
            onClick={submitPassword}
            loading={changePassword.isPending}
          >
            {t('settings.security.password.submit')}
          </ActionButton>
        </div>
      </div>

      <SettingRow
        title={t('settings.security.twoFactor.title')}
        desc={t('settings.security.twoFactor.desc')}
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
          <p className="font-medium text-gray-800">{t('settings.security.loginHistory.title')}</p>
          <p className="text-sm text-gray-500">{t('settings.security.loginHistory.desc')}</p>
        </div>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">{t('settings.security.loginHistory.empty')}</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.ip || t('settings.security.unknownIp')}
                  </p>
                  <p className="max-w-[32rem] truncate text-xs text-gray-500">
                    {item.user_agent || t('settings.security.unknownDevice')}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDateTimeByLanguage(item.loginAt, language)}
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
  const { t } = useLocale();
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
    messageApi.success(t('settings.notification.saved'));
  };

  return (
    <Section title={t('settings.tab.notification')}>
      {contextHolder}
      <SettingRow
        title={t('settings.notification.email.title')}
        desc={t('settings.notification.email.desc')}
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
        title={t('settings.notification.upload.title')}
        desc={t('settings.notification.upload.desc')}
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
        title={t('settings.notification.share.title')}
        desc={t('settings.notification.share.desc')}
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

function ShareSettings() {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: sharesResponse } = useGetShares();
  const revokeShare = useRevokeShare();
  const { t, language } = useLocale();
  const shares = sharesResponse?.data?.data ?? [];

  return (
    <Section title={t('settings.tab.shares')}>
      {contextHolder}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4">
          <p className="font-medium text-gray-800">{t('settings.share.title')}</p>
          <p className="text-sm text-gray-500">{t('settings.share.desc')}</p>
        </div>
        <div className="space-y-3">
          {shares.length === 0 ? (
            <p className="text-sm text-gray-500">{t('settings.share.empty')}</p>
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
                      {t('settings.share.downloadCount', {
                        count: share.downloadCount,
                        createdAt: formatDateTimeByLanguage(
                          share.createdAt,
                          language,
                        ),
                      })}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {share.revokedAt
                        ? t('settings.share.revokedAt', {
                            time: formatDateTimeByLanguage(
                              share.revokedAt,
                              language,
                            ),
                          })
                        : share.expiresAt
                          ? t('settings.share.expiresAt', {
                              time: formatDateTimeByLanguage(
                                share.expiresAt,
                                language,
                              ),
                            })
                          : t('settings.share.permanent')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('settings.share.lastAccess')}
                      {share.lastAccessAt
                        ? formatDateTimeByLanguage(share.lastAccessAt, language)
                        : t('settings.share.noAccess')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={async () => {
                        const shareUrl = buildSharePageUrl(share.token);
                        await navigator.clipboard.writeText(shareUrl);
                        messageApi.success(t('settings.share.linkCopied'));
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      {t('settings.share.copyLink')}
                    </button>
                    {!share.revokedAt && (
                      <button
                        onClick={async () => {
                          await revokeShare.mutateAsync({ token: share.token });
                          messageApi.success(t('settings.share.revoked'));
                        }}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        {t('settings.share.revoke')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
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
  const { t } = useLocale();
  return (
    <div className="flex justify-end">
      <ActionButton onClick={() => void onSave()} loading={loading}>
        {t('common.saveSettings')}
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
  const { t } = useLocale();
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg bg-[#5542f6] px-4 py-2 text-sm text-white transition hover:bg-[#4532e6] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? t('common.processing') : children}
    </button>
  );
}
