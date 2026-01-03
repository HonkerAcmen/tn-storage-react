import { useState, useRef } from 'react';
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
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '管理员',
    email: 'admin@tnstorage.com',
    phone: '',
    avatar: null,
    bio: '',
  });
  const [editForm, setEditForm] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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
      {/* 用户信息卡片 */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#5542f6] to-[#7c6cf5] p-6 text-white">
        {!isEditing ? (
          // 显示模式
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div
                  className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden"
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
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">
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
                    className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden cursor-pointer"
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
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 transition hover:bg-gray-100"
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
                    <label className="block text-sm font-medium text-white/90 mb-1">
                      昵称
                    </label>
                    <input
                      type="text"
                      value={editForm.nickname}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nickname: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="请输入昵称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="请输入邮箱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">
                      手机号
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="请输入手机号"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                个人简介
              </label>
              <textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
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
            <div className="h-3 w-[10.5%] rounded-full bg-gradient-to-r from-[#5542f6] to-[#7c6cf5]"></div>
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

