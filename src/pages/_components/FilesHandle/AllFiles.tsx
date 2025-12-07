import Modal from '@/components/Modal';
import { useState } from 'react';

import {
  AiOutlineAppstore,
  AiOutlineCaretDown,
  AiOutlineMenu,
} from 'react-icons/ai';
import FileList from './FileList';

interface MenuItemNameProps {
  key: number;
  name: string;
  icon: unknown;
}

export default function AllFiles() {
  const [seleMenuItem, setSeleMenuItem] = useState(false);
  // 0: 列表模式, 1: 网格模式 (通常 0 代表 list, 1 代表 grid，根据你的图标逻辑调整)
  const [seleRadioItem, setSeleRadioItem] = useState(1);

  const [MenuItemName, setMenuItemName] = useState<MenuItemNameProps>({
    key: 1,
    name: '最新添加',
    icon: <AiOutlineAppstore />,
  });

  const MenuItemsName: MenuItemNameProps[] = [
    { key: 1, name: '最新添加', icon: <AiOutlineAppstore /> },
    { key: 2, name: '最旧添加', icon: <AiOutlineAppstore /> },
    { key: 3, name: '名称', icon: <AiOutlineAppstore /> },
    { key: 4, name: '类型', icon: <AiOutlineAppstore /> },
  ];

  return (
    <div className="ml-4">
      {/* 头部 Header - 保持不变 */}
      <div className="mt-4 flex flex-row items-center justify-between">
        <div className="mb-4 flex flex-col">
          <p className="text-3xl font-semibold whitespace-nowrap text-[#2e2c34]">
            所有文件
          </p>
        </div>

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

            <Modal
              open={seleMenuItem}
              position={{ top: 'top-10' }}
              size={{ width: 'w-60' }}
              onClose={() => setSeleMenuItem(false)}
              className="animate-fadein"
            >
              {MenuItemsName.map((item) => (
                <li
                  key={item.key}
                  className="w-full list-none rounded-lg p-2 transition duration-150 hover:bg-gray-200"
                  onClick={() => setMenuItemName(item)}
                >
                  {item.name}
                </li>
              ))}
            </Modal>
          </div>
        </div>
      </div>
      <FileList />
    </div>
  );
}
