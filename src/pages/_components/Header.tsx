import Modal from '@/components/Modal';
import { useState } from 'react';
import {
  AiFillCaretDown,
  AiFillSetting,
  AiOutlineSearch,
} from 'react-icons/ai';
import Settings from './Settings';
import Profile from './Profile';

export default function Header() {
  const [clickProfile, setClickProfile] = useState(false);
  const [clickSearch, setClickSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex h-16 w-full flex-row justify-between border-b border-gray-200 bg-white">
      {/* 左侧：LOGO + 搜索 */}
      <div className="flex items-center justify-center">
        <h2 className="animate-gradient mr-16 ml-4 cursor-pointer bg-linear-to-r from-red-500 via-yellow-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-[24px] font-bold text-transparent">
          TNStorage
        </h2>

        {/* 搜索框 */}
        <div
          className="relative z-10 flex h-8 w-72 flex-row items-center rounded-2xl border border-gray-200"
          onBlur={() => setClickSearch(false)}
        >
          <AiOutlineSearch className="mr-2 ml-2" />
          <input
            type="text"
            className="h-8 w-72 text-sm focus:outline-none"
            placeholder="搜索"
            onFocus={() => setClickSearch(!clickSearch)}
          />

          <Modal
            open={clickSearch}
            onClose={() => setClickSearch(false)}
            position={{ top: 'top-8', left: 'left-4' }}
            size={{ height: 'h-64', width: 'w-64' }}
          >
            <span className="text-[12px] text-gray-400">最近使用</span>
            <ul className="mt-2 flex h-full w-full flex-col">
              {[1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="flex w-full cursor-pointer flex-row items-center rounded-lg py-2 transition hover:bg-gray-100"
                >
                  <img
                    src="#"
                    alt=""
                    className="mr-2 ml-2 h-8 w-8 rounded-lg bg-gray-200"
                  />
                  <div className="ml-2">
                    <h2>新文件{i}.jpg</h2>
                    <span className="text-[12px] text-gray-400">
                      22分钟之前
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Modal>
        </div>
      </div>

      <div className="mr-4 flex items-center">
        <AiFillSetting
          onClick={() => setShowSettings(true)}
          className="mr-6 h-6 w-6 cursor-pointer transition-transform duration-500 hover:rotate-360 hover:text-[#5542f6] hover:drop-shadow-md"
        />

        <div className="relative flex items-center">
          <img
            src="#"
            alt=""
            className="mr-6 h-12 w-12 cursor-pointer rounded-full bg-gray-200"
          />
          <div
            className="flex cursor-pointer items-center"
            tabIndex={0}
            onFocus={() => setClickProfile(!clickProfile)}
            onBlur={(e) => {
              // 延迟关闭，确保点击事件能正确触发
              const currentTarget = e.currentTarget;
              setTimeout(() => {
                if (!currentTarget.contains(document.activeElement)) {
                  setClickProfile(false);
                }
              }, 200);
            }}
          >
            <p className="mr-2 whitespace-nowrap">管理员</p>
            <AiFillCaretDown className="h-3 w-3 text-gray-500" />
          </div>

          <Modal
            open={clickProfile}
            onClose={() => setClickProfile(false)}
            position={{ top: 'top-16', right: 'right-2' }}
            size={{ width: 'w-40' }}
          >
            <li
              onClick={(e) => {
                e.stopPropagation();
                setClickProfile(false);
                setShowProfile(true);
              }}
              className="flex cursor-pointer items-center justify-center rounded-lg px-1 py-2 transition hover:bg-gray-100"
            >
              个人主页
            </li>
            <li className="flex cursor-pointer items-center justify-center rounded-lg px-1 py-2 transition hover:bg-gray-100">
              退出系统
            </li>
          </Modal>
        </div>
      </div>

      {/* 设置页面 */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* 个人主页 */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </div>
  );
}
