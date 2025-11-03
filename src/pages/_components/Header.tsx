import {
  AiFillCaretDown,
  AiFillSetting,
  AiOutlineSearch,
} from "react-icons/ai";

export default function Header() {
  return (
    <div className="w-full h-16 border-b border-gray-200 flex flex-row justify-between">
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
        <div className="flex items-center ">
          <img
            src="#"
            alt=""
            className="w-12 h-12 bg-gray-200 rounded-4xl mr-6 cursor-pointer"
          />
          <div className="flex items-center cursor-pointer">
            <p className="mr-2 ">管理员</p>
            <AiFillCaretDown className="text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
