import {
  useAvatarUpload,
  useGetAvatar,
  useGetUserWithName,
  useUpdateUserData,
} from '@/network/hooks/user';
import { GetUserWithNameApiResponse } from '@/network/types/Response/user';
import { GetUserNameWithLocalsStroger } from '@/utils/auth/user';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [username, setUsername] = useState(
    () => GetUserNameWithLocalsStroger() || ''
  );

  const { data: avatarResponse } = useGetAvatar(username);
  const { data: userdata } = useGetUserWithName(username);
  const updateUserData = useUpdateUserData();
  const avatarUpload = useAvatarUpload();
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

  const userinfo = useMemo((): GetUserWithNameApiResponse | undefined => {
    return userdata?.data;
  }, [userdata]);

  const [profile, setProfile] = useState<UserProfile>({
    nickname: '',
    email: '',
    phone: '',
    avatar: null,
    bio: '',
  });

  const [editForm, setEditForm] = useState<UserProfile>(profile);

  // 当头像数据加载成功后，更新 profile
  useEffect(() => {
    // 只在数据真正改变时才更新，避免无限循环
    if (!username) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile((prev) => ({
      nickname: userinfo?.data.username || username || '',
      email: userinfo?.data.email || prev.email || '',
      phone: userinfo?.data.phone || prev.phone || '',
      bio: userinfo?.data.desc || prev.bio || '',
      avatar: avatarUrl || prev.avatar || null,
    }));
  }, [username, avatarUrl, userinfo]);

  // 开始编辑
  const handleEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  // 保存编辑
  const handleSave = () => {
    setProfile({ ...editForm });
    setIsEditing(false);
    // 这里可以添加保存到后端的逻辑
    console.log('保存用户资料:', editForm);

    const userdata = {
      username: editForm.nickname,
      email: editForm.email,
      phone: editForm.phone,
      desc: editForm.bio,
    };

    updateUserData.mutateAsync(userdata);

    if (editForm.avatar) {
      // 如果是浏览器缓存则退出上传
      if (editForm.avatar.includes('blob:')) {
        return;
      } else if (editForm.avatar.includes('data:image')) {
        // 将 base64 数据 URL 转换为 File 对象
        const dataUrl = editForm.avatar;
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File(
          [u8arr],
          `avatar-${Date.now()}.${mimeType.split('/')[1]}`, // 文件名称
          {
            type: mimeType,
          }
        );

        avatarUpload.mutateAsync({
          username: editForm.nickname,
          file: file,
        });
      } else {
        messageApi.error('未知文件!');
        return;
      }
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

    // 安全地重命名文件：创建新的 File 对象
    // 保留原始文件的扩展名
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const newFileName = `${crypto.randomUUID()}.${fileExtension}`;

    // 创建新的 File 对象，使用新的文件名
    const renamedFile = new File([file], newFileName, {
      type: file.type,
      lastModified: file.lastModified,
    });

    // 验证通过后，创建预览URL（使用重命名后的文件）
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm({ ...editForm, avatar: reader.result as string });
    };
    reader.onerror = () => {
      messageApi.error('文件读取失败，请重试');
      e.target.value = '';
    };
    reader.readAsDataURL(renamedFile);
  };

  // 触发文件选择
  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  // 邮箱验证状态
  const isEmailVerified = true;
  // 手机号绑定状态
  const isPhoneBound = profile.phone.length > 0;

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
                    backgroundImage: profile.avatar
                      ? `url(${profile.avatar})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!profile.avatar && (
                    <span className="text-3xl font-bold">
                      {profile.nickname.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{profile.nickname}</h3>
                <p className="mt-1 text-sm text-white/80">{profile.email}</p>
                {profile.phone && (
                  <p className="mt-1 text-sm text-white/80">{profile.phone}</p>
                )}
                {profile.bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/70">
                    {profile.bio}
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
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 text-sm text-[#5542f6] transition hover:bg-gray-100"
              >
                <AiOutlineCheck className="h-4 w-4" />
                <span>保存</span>
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
              <p className="mt-1 text-2xl font-bold text-gray-800">1,234</p>
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
              <p className="mt-1 text-2xl font-bold text-gray-800">10.5 GB</p>
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
              <p className="mt-1 text-2xl font-bold text-gray-800">89</p>
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
          {[
            { action: '上传了文件', file: '项目文档.pdf', time: '2小时前' },
            { action: '创建了文件夹', file: '设计资源', time: '1天前' },
            { action: '收藏了文件', file: '重要资料.docx', time: '3天前' },
            { action: '分享了文件', file: '团队协作.xlsx', time: '5天前' },
          ].map((activity, index) => (
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
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">我的文件</h3>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-center text-gray-500">文件列表功能待实现</p>
      </div>
    </div>
  );
}

// 存储空间标签页
function StorageTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">存储空间</h3>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">已使用</span>
            <span className="text-sm text-gray-500">10.5 GB / 100 GB</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div className="h-3 w-[10.5%] rounded-full bg-linear-to-r from-[#5542f6] to-[#7c6cf5]"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">文档</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">2.3 GB</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">图片</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">5.1 GB</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">视频</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">2.8 GB</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">其他</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">0.3 GB</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 收藏标签页
function FavoritesTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">我的收藏</h3>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-center text-gray-500">收藏列表功能待实现</p>
      </div>
    </div>
  );
}
