import { useState } from 'react';
import {
  AiFillCaretDown,
  AiFillSetting,
  AiOutlineSearch,
} from 'react-icons/ai';

export default function Header() {
  const [clickProfile, setClickProfile] = useState(false);
  const [clickSearch, setClickSearch] = useState(false);

  return (
    <div className="flex h-16 w-full flex-row justify-between border-b border-gray-200 bg-white">
      <div className="flex items-center justify-center">
        <h2 className="mr-16 ml-4 cursor-pointer text-[24px] font-bold text-[#2e2c34]">
          TNStorage
        </h2>
        <div
          className="relative flex h-8 w-72 flex-row items-center rounded-2xl border border-gray-200"
          onBlur={() => setClickSearch(false)}
        >
          <AiOutlineSearch className="mr-2 ml-2" />
          <input
            type="text"
            className={`h-8 w-72 text-sm focus:outline-none`}
            placeholder="搜索"
            onFocus={() => setClickSearch(!clickSearch)}
          />
          {clickSearch ? (
            <div className="absolute top-8 left-4 h-64 w-64 rounded-2xl bg-white p-4 shadow-sm">
              <span className="text-[12px] text-gray-400">最近使用</span>
              <ul className="mt-2 flex h-full w-full flex-col">
                <li className="flex w-full cursor-pointer flex-row items-center rounded-lg py-2 transition hover:bg-gray-100">
                  <img
                    src="#"
                    alt=""
                    className="mr-2 ml-2 h-8 w-8 rounded-lg bg-gray-200"
                  />
                  <div className="ml-2">
                    <h2 className="">新文件.jpg</h2>
                    <span className="text-[12px] text-gray-400">
                      22分钟之前
                    </span>
                  </div>
                </li>
                <li className="flex w-full cursor-pointer flex-row items-center rounded-lg py-2 transition hover:bg-gray-100">
                  <img
                    src="#"
                    alt=""
                    className="mr-2 ml-2 h-8 w-8 rounded-lg bg-gray-200"
                  />
                  <div className="ml-2">
                    <h2 className="">新文件.jpg</h2>
                    <span className="text-[12px] text-gray-400">
                      22分钟之前
                    </span>
                  </div>
                </li>
                <li className="flex w-full cursor-pointer flex-row items-center rounded-lg py-2 transition hover:bg-gray-100">
                  <img
                    src="#"
                    alt=""
                    className="mr-2 ml-2 h-8 w-8 rounded-lg bg-gray-200"
                  />
                  <div className="ml-2">
                    <h2 className="">新文件.jpg</h2>
                    <span className="text-[12px] text-gray-400">
                      22分钟之前
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mr-4 flex items-center">
        <AiFillSetting className="mr-6 h-6 w-6 cursor-pointer transition hover:rotate-90" />
        <div className="relative flex items-center">
          <img
            src="#"
            alt=""
            className="mr-6 h-12 w-12 cursor-pointer rounded-4xl bg-gray-200"
          />
          <div
            className="flex cursor-pointer items-center"
            tabIndex={0}
            onFocus={() => setClickProfile(!clickProfile)}
            onBlur={() => setClickProfile(false)}
          >
            <p className="mr-2">管理员</p>
            <AiFillCaretDown className="h-3 w-3 text-gray-500" />
          </div>
          {clickProfile === true ? (
            <div className="absolute top-16 right-2 h-22 w-40 rounded-2xl border border-gray-200 bg-white">
              <ul className="flex h-full w-full flex-col">
                <li className="flex h-[50%] cursor-pointer items-center justify-center rounded-t-2xl border-b border-gray-200 transition hover:bg-gray-100">
                  个人主页
                </li>
                <li className="flex h-[50%] cursor-pointer items-center justify-center rounded-b-2xl transition hover:bg-gray-100">
                  退出系统
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
