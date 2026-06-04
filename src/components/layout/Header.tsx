import Image from 'next/image';
import Modal from '@/components/Modal';
import { useEffect, useState, useMemo } from 'react';
import {
  AiFillCaretDown,
  AiFillSetting,
  AiOutlineSearch,
} from 'react-icons/ai';

import { logout, useAuthed } from '@/utils/auth';
import { useGetMyAvatar, useGetMyProfile } from '@/network/hooks/user';
import Profile from '../secondaryPage/Profile';
import SearchResults from '../secondaryPage/SearchResults';
import Settings from '../secondaryPage/Settings';
import Link from 'next/link';

export default function Header() {
  const [clickProfile, setClickProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const authed = useAuthed();
  const { data: avatarResponse } = useGetMyAvatar();
  const { data: profileResponse } = useGetMyProfile();
  const username = profileResponse?.data?.data?.username ?? '';

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

  // 清理对象 URL，避免内存泄漏
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  return (
    <div className="flex h-16 w-full flex-row justify-between border-b border-gray-200 bg-white">
      {/* 左侧：LOGO + 搜索 */}
      <div className="flex items-center justify-center">
        <h2 className="animate-gradient mr-16 ml-4 cursor-pointer bg-linear-to-r from-red-500 via-yellow-500 to-blue-500 bg-size-[200%_200%] bg-clip-text text-[24px] font-bold text-transparent">
          伏羲文化存储系统
        </h2>

        {authed && (
          <button
            onClick={() => setShowSearchResults(true)}
            className="relative z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 transition duration-300 hover:scale-120 hover:rotate-15 hover:border-[#5542f6] hover:bg-gray-50 hover:text-[#5542f6]"
          >
            <AiOutlineSearch className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>

      <div className="mr-4 flex items-center">
        {authed ? (
          <>
            <AiFillSetting
              onClick={() => setShowSettings(true)}
              className="mr-6 h-6 w-6 cursor-pointer transition-transform duration-500 hover:rotate-360 hover:text-[#5542f6] hover:drop-shadow-md"
            />

            <div className="relative flex items-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="mr-6 h-12 w-12 cursor-pointer rounded-full bg-gray-200 object-cover"
                />
              ) : (
                <div className="mr-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-gray-400">
                  {username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div
                className="flex cursor-pointer items-center"
                tabIndex={0}
                onFocus={() => setClickProfile(!clickProfile)}
                onBlur={(e) => {
                  const currentTarget = e.currentTarget;
                  setTimeout(() => {
                    if (!currentTarget.contains(document.activeElement)) {
                      setClickProfile(false);
                    }
                  }, 200);
                }}
              >
                <p className="mr-2 whitespace-nowrap">{username || '管理员'}</p>
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
                <li
                  onClick={() => logout()}
                  className="flex cursor-pointer items-center justify-center rounded-lg px-1 py-2 transition hover:bg-gray-100"
                >
                  退出系统
                </li>
              </Modal>
            </div>
          </>
        ) : (
          <Link
            href="/login?tab=login"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:border-[#5542f6] hover:text-[#5542f6]"
          >
            登录 / 注册
          </Link>
        )}
      </div>

      {/* 设置页面 */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* 个人主页 */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}

      {/* 搜索结果页面 */}
      {showSearchResults && (
        <SearchResults
          open={showSearchResults}
          searchKeyword={searchKeyword}
          onClose={() => {
            setShowSearchResults(false);
            setSearchKeyword('');
          }}
          onSearchChange={(keyword) => setSearchKeyword(keyword)}
        />
      )}

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
