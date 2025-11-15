import { useState } from 'react';
import {
  AiOutlineAppstore,
  AiOutlineCaretDown,
  AiOutlineMenu,
} from 'react-icons/ai';

interface MenuItemNameProps {
  key: number;
  name: string;
  icon: unknown;
}

export default function AllFiles() {
  const [seleMenuItem, setSeleMenuItem] = useState(false);
  const [seleRadioItem, setSeleRadioItem] = useState(0);
  const [MenuItemName, setMenuItemName] = useState<MenuItemNameProps>({
    key: 1,
    name: '最新添加',
    icon: <AiOutlineAppstore />,
  });
  const MenuItemsName: MenuItemNameProps[] = [
    {
      key: 1,
      name: '最新添加',
      icon: <AiOutlineAppstore />,
    },
    {
      key: 2,
      name: '最旧添加',
      icon: <AiOutlineAppstore />,
    },
    {
      key: 3,
      name: '名称',
      icon: <AiOutlineAppstore />,
    },
    {
      key: 4,
      name: '类型',
      icon: <AiOutlineAppstore />,
    },
  ];

  return (
    <div>
      <div className="mt-4 flex flex-row justify-between p-6">
        <p className="text-3xl font-semibold text-[#2e2c34]">所有文件</p>
        <div className="mr-8 flex flex-row gap-6">
          <div className="flex h-10 w-20 items-center justify-center">
            <div
              onClick={() => setSeleRadioItem(0)}
              className={`flex h-full w-[50%] cursor-pointer items-center justify-center rounded-l-lg border border-gray-200 transition duration-150 hover:bg-gray-200 ${seleRadioItem === 0 ? 'bg-gray-100' : ''}`}
            >
              <AiOutlineMenu />
            </div>
            <div
              onClick={() => setSeleRadioItem(1)}
              className={`${seleRadioItem === 1 ? 'bg-gray-100' : ''} flex h-full w-[50%] cursor-pointer items-center justify-center rounded-r-lg border border-gray-200 transition duration-150 hover:bg-gray-200`}
            >
              <AiOutlineAppstore />
            </div>
          </div>
          <div
            className="relative flex w-64 cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-2"
            tabIndex={0}
            onFocus={() => setSeleMenuItem(!seleMenuItem)}
            onBlur={() => setSeleMenuItem(false)}
          >
            <p className="text-xs text-gray-500">
              分组方式:{' '}
              <span className="ml-2 text-sm text-gray-800">
                {MenuItemName?.name}
              </span>
            </p>
            <AiOutlineCaretDown className="text-gray-500" />
            {seleMenuItem ? (
              <ul className="animate-fadein absolute top-10 w-60 rounded-lg border border-gray-200">
                {MenuItemsName.map((item) => (
                  <li
                    key={item.key}
                    className="p-2 transition duration-150 hover:bg-gray-200"
                    onClick={() => setMenuItemName(item)}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {/* 自定义动画样式 */}
      <style jsx>{`
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
        .animate-fadein {
          animation: fadein 0.3s ease;
        }
      `}</style>
    </div>
  );
}
