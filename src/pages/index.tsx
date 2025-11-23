import {
  AiFillCloud,
  AiFillFileText,
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineStar,
  AiTwotoneClockCircle,
} from 'react-icons/ai';
import Header from './_components/Header';
import { ConfigProvider, Menu, MenuProps } from 'antd';
import MyCloud from './_components/MyCloud';
import { JSX, useState } from 'react';
import AllFiles from './_components/FilesHandle/AllFiles';

export default function Home() {
  const [seleId, setSeleId] = useState('sub1');

  const menuItems = [
    { key: 'sub1', label: '我的云', icon: <AiFillCloud /> },
    { key: 'sub2', label: '所有文件', icon: <AiFillFileText /> },
    { key: 'sub3', label: '最近的', icon: <AiTwotoneClockCircle /> },
    { key: 'sub4', label: '收藏', icon: <AiOutlineStar /> },
    { key: 'sub5', label: '已删除文件', icon: <AiOutlineDelete /> },
  ];

  const onClick: MenuProps['onClick'] = (e) => setSeleId(e.key);

  const renderMap: Record<string, JSX.Element> = {
    sub1: <MyCloud />,
    sub2: <AllFiles />,
    sub3: <div>最近的</div>,
    sub4: <div>收藏</div>,
    sub5: <div>已删除文件</div>,
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体区域 */}
      <div className="grid flex-1 grid-cols-[240px_1fr]">
        {/* 左侧边栏 */}
        <aside className="flex flex-col items-center border-r border-gray-200 bg-white">
          <div className="mt-6 mb-6 flex h-12 w-[90%] cursor-pointer items-center justify-center rounded-sm border border-gray-200 text-[16px] text-[#5542f6]">
            <AiOutlineCloudUpload className="mr-2 ml-2 h-5 w-5" />
            <p>上传/下载</p>
          </div>

          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemSelectedBg: '#eeedff',
                  itemSelectedColor: '#5542f6',
                  itemHeight: 50,
                  itemColor: '#2e2c34',
                },
              },
            }}
          >
            <Menu
              onClick={onClick}
              selectedKeys={[seleId]} // 让选中状态与当前一致
              style={{ width: 240 }}
              items={menuItems}
            />
          </ConfigProvider>
        </aside>

        {/* 主内容区 */}
        <main className="bg-white">
          {renderMap[seleId] ?? <div>未知选项</div>}
        </main>
      </div>
    </div>
  );
}
