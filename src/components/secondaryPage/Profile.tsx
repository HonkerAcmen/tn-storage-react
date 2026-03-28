import {
  useAvatarUploadMe,
  useGetMyAvatar,
  useGetMyProfile,
  useGetMyStorage,
  useUpdateMyUserData,
} from '@/network/hooks/user';
import { useGetRecents } from '@/network/hooks/file';
import { message } from 'antd';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  AiFillCloseCircle,
  AiFillEdit,
  AiFillCamera,
  AiFillFileText,
  AiFillCloud,
  AiFillStar,
  AiFillFolder,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineCheck,
} from 'react-icons/ai';
import { formatFileSize } from '@/utils/format/formatters';
import { useFileData } from '@/contexts/FileDataContext';
import { useFavorites } from '@/features/files/hooks';
import { FileSystemTreeNode } from '@/network/types/Response/file';

interface ProfileProps {
  onClose: () => void;
}

export default function Profile({ onClose }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: '概览', icon: <AiFillFileText /> },
    { id: 'files', label: '我的文件', icon: <AiFillFolder /> },
    { id: 'storage', label: '存储空间', icon: <AiFillCloud /> },
    { id: 'favorites', label: '收藏', icon: <AiFillStar /> },
  ];

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-400/50">
      <div className="relative flex h-[85vh] w-[90vw] max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">个人主页</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-gray-100"
          >
            <AiFillCloseCircle className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* 主体内容 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧标签栏 */}
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

          {/* 右侧内容区 */}
          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'files' && <FilesTab />}
            {activeTab === 'storage' && <StorageTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

// 用户资料接口
interface UserProfile {
  nickname: string;
  email: string;
  phone: string;
  avatar: string | null;
  bio: string;
}

// 概览标签页
function OverviewTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const previewUrlRef = useRef<string | null>(null);
  const { data: avatarResponse } = useGetMyAvatar();
  const { data: userdata } = useGetMyProfile();
  const { data: storageResponse } = useGetMyStorage();
  const { data: recentsResponse } = useGetRecents();
  const { allFiles } = useFileData();
  const { favoriteUUIDs } = useFavorites();
  const updateUserData = useUpdateMyUserData();
  const avatarUpload = useAvatarUploadMe();
  // 将 Buffer 数据转换为图片 URL
  const avatarUrl = useMemo(() => {
    if (!avatarResponse?.data?.data?.buffer?.data) {
      return undefined;
    }

    try {
      // 提取 buffer 数据（数字数组）
      const bufferData = avatarResponse.data.data.buffer.data;
      const mimeType = avatarResponse.data.data.mimetype || 'image/jpeg';

      // 将数字数组转换为 Uint8Array
      const uint8Array = new Uint8Array(bufferData);

      // 创建 Blob
      const blob = new Blob([uint8Array], { type: mimeType });

      // 创建对象 URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to convert avatar buffer to URL:', error);
      return undefined;
    }
  }, [avatarResponse]);

  const userinfo = useMemo(() => userdata?.data, [userdata]);
  const storage = storageResponse?.data?.data;
  const baseProfile = useMemo<UserProfile>(
    () => ({
      nickname: userinfo?.data.username || '',
      email: userinfo?.data.email || '',
      phone: userinfo?.data.phone || '',
      bio: userinfo?.data.desc || '',
      avatar: avatarUrl || null,
    }),
    [avatarUrl, userinfo]
  );
  const recentActivities = useMemo(() => {
    const recentItems = recentsResponse?.data?.data?.recent ?? [];
    const fileMap = new Map(allFiles.map((file) => [file.UUID, file]));

    return recentItems
      .slice(0, 5)
      .map((item) => {
        const file = fileMap.get(item.UUID);
        return file ? { file, time: item.time } : null;
      })
      .filter((item): item is { file: FileSystemTreeNode; time: string | null } => Boolean(item))
      .map(({ file, time }) => ({
        action: file.type === 'folder' ? '访问了文件夹' : '访问了文件',
        file: file.filename,
        time: new Date(time || file.updatedAt).toLocaleString('zh-CN'),
      }));
  }, [allFiles, recentsResponse]);
  const [editForm, setEditForm] = useState<UserProfile>({
    nickname: '',
    email: '',
    phone: '',
    avatar: null,
    bio: '',
  });
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const displayAvatar = isEditing ? editForm.avatar : baseProfile.avatar;

  useEffect(() => {
    if (!isEditing && avatarUrl && previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, [avatarUrl, isEditing]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  // 开始编辑
  const handleEdit = () => {
    setEditForm({ ...baseProfile });
    setPendingAvatarFile(null);
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancel = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setEditForm({ ...baseProfile });
    setPendingAvatarFile(null);
    setIsEditing(false);
  };

  // 保存编辑
  const handleSave = async () => {
    const normalizedForm = {
      nickname: editForm.nickname.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      bio: editForm.bio.trim(),
    };

    if (!normalizedForm.nickname) {
      messageApi.error('昵称不能为空');
      return;
    }

    if (!normalizedForm.email) {
      messageApi.error('邮箱不能为空');
      return;
    }

    if (!normalizedForm.phone) {
      messageApi.error('手机号不能为空');
      return;
    }

    const userdata = {
      username: normalizedForm.nickname,
      email: normalizedForm.email,
      phone: normalizedForm.phone,
      desc: normalizedForm.bio,
    };

    setIsSaving(true);
    try {
      await updateUserData.mutateAsync(userdata);
    } catch {
      setIsSaving(false);
      messageApi.error('资料保存失败，请重试');
      return;
    }

    try {
      if (pendingAvatarFile) {
        await avatarUpload.mutateAsync({ file: pendingAvatarFile });
      }

      setPendingAvatarFile(null);
      setIsEditing(false);
      messageApi.success('资料已更新');
    } catch (error) {
      const messageText =
        (error as { message?: string })?.message ||
        '资料已保存，但头像上传失败，请重试头像上传';
      messageApi.warning(messageText);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // 先进行文件验证（必须在读取文件之前）
    const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const upSize = 1 * 1024 * 1024; // 1MB

    // 验证文件大小
    if (file.size > upSize) {
      messageApi.error('头像文件太大，请选择小于 1MB 的图片');
      e.target.value = '';
      return;
    }

    // 验证文件类型
    if (!allowedFileTypes.includes(file.type)) {
      messageApi.error('文件类型不支持，请选择 PNG 或 JPEG 格式的图片');
      // 清空 input，允许重新选择
      e.target.value = '';
      return;
    }

    const fileExtension = file.name.split('.').pop() || 'jpg';
    const newFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const renamedFile = new File([file], newFileName, {
      type: file.type,
      lastModified: file.lastModified,
    });

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(renamedFile);
    previewUrlRef.current = previewUrl;
    setPendingAvatarFile(renamedFile);

    // 传入表单数据对象中，当点击上传按钮后自动上传图片数据
    setEditForm((prev) => ({ ...prev, avatar: previewUrl }));

    e.target.value = '';
  };

  // 触发文件选择
  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  // 邮箱验证状态
  const isEmailVerified = true;
  // 手机号绑定状态
  const isPhoneBound = baseProfile.phone.length > 0;

  return (
    <div className="space-y-6">
      {contextHolder}
      {/* 用户信息卡片 */}
      <div className="rounded-xl border border-gray-200 bg-linear-to-br from-[#5542f6] to-[#7c6cf5] p-6 text-white">
        {!isEditing ? (
          // 显示模式
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div
                  className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/20 backdrop-blur-sm"
                  style={{
                    backgroundImage: displayAvatar
                      ? `url(${displayAvatar})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!displayAvatar && (
                    <span className="text-3xl font-bold">
                      {baseProfile.nickname.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{baseProfile.nickname}</h3>
                <p className="mt-1 text-sm text-white/80">{baseProfile.email}</p>
                {baseProfile.phone && (
                  <p className="mt-1 text-sm text-white/80">{baseProfile.phone}</p>
                )}
                {baseProfile.bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/70">
                    {baseProfile.bio}
                  </p>
                )}
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <AiOutlineMail className="h-4 w-4" />
                    <span>{isEmailVerified ? '已验证' : '未验证'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <AiOutlinePhone className="h-4 w-4" />
                    <span>{isPhoneBound ? '已绑定' : '未绑定'}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 rounded-lg bg-white/20 px-4 py-2 text-sm backdrop-blur-sm transition hover:bg-white/30"
            >
              <AiFillEdit className="h-4 w-4" />
              <span>编辑资料</span>
            </button>
          </div>
        ) : (
          // 编辑模式
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div
                    className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/20 backdrop-blur-sm"
                    onClick={triggerAvatarUpload}
                    style={{
                      backgroundImage: editForm.avatar
                        ? `url(${editForm.avatar})`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!editForm.avatar && (
                      <span className="text-3xl font-bold">
                        {editForm.nickname.charAt(0)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={triggerAvatarUpload}
                    className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 transition hover:bg-gray-100"
                  >
                    <AiFillCamera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      昵称
                    </label>
                    <input
                      type="text"
                      value={editForm.nickname}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nickname: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      placeholder="请输入昵称"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      placeholder="请输入邮箱"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      手机号
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      placeholder="请输入手机号"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/90">
                个人简介
              </label>
              <textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                placeholder="介绍一下自己..."
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                取消
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 text-sm text-[#5542f6] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AiOutlineCheck className="h-4 w-4" />
                <span>{isSaving ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总文件数</p>
              <p className="mt-1 text-2xl font-bold text-gray-800">
                {storage?.totalFiles ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <AiFillFileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">存储使用</p>
              <p className="mt-1 text-2xl font-bold text-gray-800">
                {formatFileSize(storage?.usedBytes ?? 0)}
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <AiFillCloud className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">收藏数</p>
              <p className="mt-1 text-2xl font-bold text-gray-800">
                {favoriteUUIDs.length || storage?.favoriteCount || 0}
              </p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3">
              <AiFillStar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-4 text-lg font-semibold text-gray-800">最近活动</h4>
        <div className="space-y-3">
          {(recentActivities.length > 0
            ? recentActivities
            : [
                {
                  action: '暂无最近活动',
                  file: '开始上传或访问文件后会出现在这里',
                  time: '刚刚',
                },
              ]
          ).map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <AiFillFileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.file}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 我的文件标签页
function FilesTab() {
  const { allFiles, openPreviewDialog } = useFileData();
  const files = useMemo(
    () =>
      allFiles
        .filter((item) => item.id !== '1')
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [allFiles]
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">我的文件</h3>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 grid grid-cols-3 gap-4">
          <SummaryCard
            title="文件总数"
            value={String(files.filter((item) => item.type === 'file').length)}
          />
          <SummaryCard
            title="文件夹总数"
            value={String(
              files.filter((item) => item.type === 'folder').length
            )}
          />
          <SummaryCard
            title="最近更新"
            value={
              files[0]
                ? new Date(files[0].updatedAt).toLocaleDateString('zh-CN')
                : '暂无'
            }
          />
        </div>
        <div className="space-y-3">
          {files.length === 0 ? (
            <p className="py-8 text-center text-gray-500">当前还没有文件</p>
          ) : (
            files.slice(0, 10).map((file) => (
              <div
                key={file.UUID}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
                onClick={() => {
                  if (file.type === 'file') {
                    openPreviewDialog(file);
                  }
                }}
              >
                <div>
                  <p className="font-medium text-gray-800">{file.filename}</p>
                  <p className="text-sm text-gray-500">
                    {file.type === 'folder' ? '文件夹' : file.ext || '文件'} ·
                    更新时间 {new Date(file.updatedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {file.type === 'folder'
                    ? '--'
                    : formatFileSize(Number(file.size))}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 存储空间标签页
function StorageTab() {
  const { data: storageResponse } = useGetMyStorage();
  const storage = storageResponse?.data?.data;
  const usedBytes = storage?.usedBytes ?? 0;
  const totalBytes = storage?.totalBytes ?? 100 * 1024 * 1024 * 1024;
  const usedPercent =
    totalBytes === 0
      ? 0
      : Math.min(100, Math.round((usedBytes / totalBytes) * 100));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">存储空间</h3>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">已使用</span>
            <span className="text-sm text-gray-500">
              {formatFileSize(usedBytes)} / {formatFileSize(totalBytes)}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-linear-to-r from-[#5542f6] to-[#7c6cf5]"
              style={{ width: `${usedPercent}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">文档</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              {formatFileSize(storage?.categories.document ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">图片</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              {formatFileSize(storage?.categories.image ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">视频</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              {formatFileSize(storage?.categories.video ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">其他</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              {formatFileSize(
                (storage?.categories.audio ?? 0) +
                  (storage?.categories.other ?? 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 收藏标签页
function FavoritesTab() {
  const { favoriteUUIDs } = useFavorites();
  const { allFiles, openPreviewDialog } = useFileData();
  const favorites = useMemo(() => {
    const favoriteSet = new Set(favoriteUUIDs);
    return allFiles.filter((file) => favoriteSet.has(file.UUID));
  }, [allFiles, favoriteUUIDs]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">我的收藏</h3>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <SummaryCard title="收藏数量" value={String(favorites.length)} />
          <SummaryCard
            title="最近收藏项"
            value={favorites[0]?.filename ?? '暂无'}
          />
        </div>
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <p className="py-8 text-center text-gray-500">当前还没有收藏项</p>
          ) : (
            favorites.map((file) => (
              <div
                key={file.UUID}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
                onClick={() => {
                  if (file.type === 'file') {
                    openPreviewDialog(file);
                  }
                }}
              >
                <div>
                  <p className="font-medium text-gray-800">{file.filename}</p>
                  <p className="text-sm text-gray-500">
                    {file.type === 'folder' ? '文件夹' : file.ext || '文件'} ·
                    创建于 {new Date(file.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <AiFillStar className="h-5 w-5 text-amber-400" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}
