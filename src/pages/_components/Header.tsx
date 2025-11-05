import { useState } from "react";
import {
  AiFillCaretDown,
  AiFillSetting,
  AiOutlineSearch,
} from "react-icons/ai";

export default function Header() {
  const [clickProfile, setClickProfile] = useState(false);

  return (
    <div className="w-full h-16 border-b border-gray-200 flex flex-row justify-between bg-white">
      <div className="flex justify-center items-center ">
        <h2 className="ml-4 mr-16 font-bold text-[24px] cursor-pointer">
          TNStorage
        </h2>
        <div className="w-72 h-8 border border-gray-200 rounded-2xl flex flex-row items-center">
          <AiOutlineSearch className="ml-2 mr-2" />
          <input
            type="text"
            className=" w-72 h-8 focus:outline-none"
            placeholder="搜索"
          />
        </div>
      </div>
      <div className="flex mr-4 items-center">
        <AiFillSetting className="w-6 h-6 mr-6 cursor-pointer  hover:rotate-90 transition" />
        <div className="flex items-center relative">
          <img
            src="#"
            alt=""
            className="w-12 h-12 bg-gray-200 rounded-4xl mr-6 cursor-pointer"
          />
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setClickProfile(!clickProfile)}
          >
            <p className="mr-2 ">管理员</p>
            <AiFillCaretDown className="text-gray-500 w-3 h-3" />
          </div>
          {clickProfile === true ? (
            <div className=" absolute top-16 right-2 w-40 h-22 bg-white border border-gray-200 rounded-2xl">
              <ul className="flex flex-col w-full h-full ">
                <li className="h-[50%] flex justify-center items-center border-b border-gray-200 cursor-pointer transition hover:bg-gray-100 rounded-t-2xl">
                  个人主页
                </li>
                <li className="h-[50%] flex justify-center items-center cursor-pointer transition hover:bg-gray-100 rounded-b-2xl">
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
