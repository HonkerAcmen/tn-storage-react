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

export default function Home() {
  const menuItems = [
    {
      key: 'sub1',
      label: '我的云',
      icon: <AiFillCloud />,
    },
    {
      key: 'sub3',
      label: '所有文件',
      icon: <AiFillFileText />,
    },
    {
      key: 'sub4',
      label: '最近的',
      icon: <AiTwotoneClockCircle />,
    },
    {
      key: 'sub5',
      label: '收藏',
      icon: <AiOutlineStar />,
    },
    {
      key: 'sub6',
      label: '已删除文件',
      icon: <AiOutlineDelete />,
    },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e.key);
  };

  return (
    <div>
      <div className="flex min-h-screen flex-col bg-gray-50">
        {/* 顶部导航栏 */}
        <Header />

        {/* 主体区域 */}
        <div className="grid flex-1 grid-cols-[240px_1fr]">
          {/* 左侧边栏 */}
          <aside className="flex flex-col items-center border-r border-gray-200 bg-white">
            <div className="mt-2 flex h-12 w-[90%] cursor-pointer items-center justify-center rounded-sm border border-gray-200 text-[16px] text-[#5542f6]">
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
                  },
                },
              }}
            >
              <Menu
                onClick={onClick}
                defaultSelectedKeys={['sub1']}
                style={{ width: 240 }}
                items={menuItems}
              />
            </ConfigProvider>
          </aside>

          {/* 主内容区 */}
          <main className="bg-white">
            <h1 className="mb-4 text-xl font-semibold">Main Content</h1>

            {/* 自适应网格 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>
          </main>
        </div>
      </div>
    </div>
  );
}
