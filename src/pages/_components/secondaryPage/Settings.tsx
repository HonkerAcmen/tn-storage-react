import { useState } from 'react';
import {
  AiFillCloseCircle,
  AiFillBell,
  AiFillLock,
  AiFillCloud,
  AiFillFileText,
} from 'react-icons/ai';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: '通用设置', icon: <AiFillFileText /> },
    { id: 'storage', label: '存储设置', icon: <AiFillCloud /> },
    { id: 'security', label: '安全设置', icon: <AiFillLock /> },
    { id: 'notification', label: '通知设置', icon: <AiFillBell /> },
  ];

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-400/50">
      <div className="relative flex h-[80vh] w-[90vw] max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">设置</h2>
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
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'storage' && <StorageSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notification' && <NotificationSettings />}
          </main>
        </div>
      </div>
    </div>
  );
}

// 通用设置
function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">通用设置</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">语言设置</p>
            <p className="text-sm text-gray-500">选择界面显示语言</p>
          </div>
          <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
            <option>简体中文</option>
            <option>English</option>
            <option>日本語</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">主题设置</p>
            <p className="text-sm text-gray-500">选择界面主题</p>
          </div>
          <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
            <option>浅色模式</option>
            <option>深色模式</option>
            <option>跟随系统</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">自动保存</p>
            <p className="text-sm text-gray-500">自动保存文件更改</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#5542f6] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

// 存储设置
function StorageSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">存储设置</h3>

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium text-gray-800">存储空间使用情况</p>
            <span className="text-sm text-gray-500">10.5 GB / 100 GB</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 w-[10.5%] rounded-full bg-[#5542f6]"></div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">默认上传位置</p>
            <p className="text-sm text-gray-500">设置文件上传的默认文件夹</p>
          </div>
          <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200">
            选择文件夹
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">自动清理临时文件</p>
            <p className="text-sm text-gray-500">定期清理临时和缓存文件</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#5542f6] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

// 安全设置
function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">安全设置</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">修改密码</p>
            <p className="text-sm text-gray-500">定期更改密码以保护账户安全</p>
          </div>
          <button className="rounded-lg bg-[#5542f6] px-4 py-2 text-sm text-white transition hover:bg-[#4532e6]">
            修改
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">两步验证</p>
            <p className="text-sm text-gray-500">为账户添加额外的安全保护</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#5542f6] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">登录历史</p>
            <p className="text-sm text-gray-500">查看最近的登录记录</p>
          </div>
          <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200">
            查看
          </button>
        </div>
      </div>
    </div>
  );
}

// 通知设置
function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">通知设置</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">邮件通知</p>
            <p className="text-sm text-gray-500">接收重要更新和通知邮件</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#5542f6] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">文件上传完成通知</p>
            <p className="text-sm text-gray-500">文件上传完成后发送通知</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#5542f6] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">共享文件通知</p>
            <p className="text-sm text-gray-500">当有人共享文件时通知你</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#5542f6] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
