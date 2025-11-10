import {
  AiFillCloud,
  AiFillFileText,
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineEllipsis,
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
                defaultSelectedKeys={['sub1']}
                style={{ width: 240 }}
                items={menuItems}
              />
            </ConfigProvider>
          </aside>

          {/* 主内容区 */}
          <main className="flex w-[70%] flex-col bg-white">
            {/* 活动 */}
            <div className="w-full pl-4">
              <h1 className="py-8 text-3xl font-semibold text-[#2e2c34]">
                我的云
              </h1>
              <span className="text-sm text-[#2e2c34]">从你的活动来看</span>
              <div className="mt-4 h-0 w-full border border-gray-200"></div>
              {/* 自适应网格 */}
              <div className="mt-4 ml-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex h-32 max-w-56 cursor-pointer flex-col rounded-2xl bg-[#fbfafc] p-4 transition duration-175 hover:bg-gray-100">
                  <img src="#" alt="" className="my-2 h-10 w-10 bg-gray-200" />
                  <h2 className="text-gray-800">设计21</h2>
                  <span className="text-sm text-gray-600">23 Oct 2025</span>
                </div>
                <div className="flex h-32 max-w-56 cursor-pointer flex-col rounded-2xl bg-[#fbfafc] p-4 transition duration-175 hover:bg-gray-100">
                  <img src="#" alt="" className="my-2 h-10 w-10 bg-gray-200" />
                  <h2 className="text-gray-800">设计21</h2>
                  <span className="text-sm text-gray-600">23 Oct 2025</span>
                </div>
                <div className="flex h-32 max-w-56 cursor-pointer flex-col rounded-2xl bg-[#fbfafc] p-4 transition duration-175 hover:bg-gray-100">
                  <img src="#" alt="" className="my-2 h-10 w-10 bg-gray-200" />
                  <h2 className="text-gray-800">设计21</h2>
                  <span className="text-sm text-gray-600">23 Oct 2025</span>
                </div>
                <div className="flex h-32 max-w-56 cursor-pointer flex-col rounded-2xl bg-[#fbfafc] p-4 transition duration-175 hover:bg-gray-100">
                  <img src="#" alt="" className="my-2 h-10 w-10 bg-gray-200" />
                  <h2 className="text-gray-800">设计21</h2>
                  <span className="text-sm text-gray-600">23 Oct 2025</span>
                </div>
              </div>
            </div>
            {/* 最近上传 */}
            <div className="mt-4 w-full pl-4">
              <p className="text-sm text-[#2e2c34]">最近上传</p>
              <div className="mt-4 h-0 w-full border border-gray-200"></div>

              <ul className="flex w-full cursor-pointer transition duration-300 hover:bg-gray-100">
                <li className="flex h-24 w-full flex-row border-b border-gray-200">
                  <div className="flex flex-1 items-center">
                    <img
                      src="#"
                      alt=""
                      className="mx-4 h-8 w-8 rounded-lg bg-gray-200"
                    />
                    <p className="text-gray-700">4张图片</p>
                  </div>
                  <div className="flex w-full flex-1 flex-row items-center">
                    <span className="mr-8 text-sm text-gray-500">
                      添加于2025年11月30日
                    </span>
                    <div className="flex flex-4">
                      <img
                        src="#"
                        alt=""
                        className="mx-2 h-4 w-4 rounded-lg bg-gray-200"
                      />
                      <span className="text-sm text-gray-500">参考文献</span>
                    </div>
                    <div className="flex flex-1 transition duration-150 hover:scale-120">
                      <AiOutlineEllipsis className="h-8 w-8" />
                    </div>
                  </div>
                </li>
              </ul>
              <ul className="flex w-full cursor-pointer transition duration-300 hover:bg-gray-100">
                <li className="flex h-24 w-full flex-row border-b border-gray-200">
                  <div className="flex flex-1 items-center">
                    <img
                      src="#"
                      alt=""
                      className="mx-4 h-8 w-8 rounded-lg bg-gray-200"
                    />
                    <p className="text-gray-700">4张图片</p>
                  </div>
                  <div className="flex w-full flex-1 flex-row items-center">
                    <span className="mr-8 text-sm text-gray-500">
                      添加于2025年11月30日
                    </span>
                    <div className="flex flex-4">
                      <img
                        src="#"
                        alt=""
                        className="mx-2 h-4 w-4 rounded-lg bg-gray-200"
                      />
                      <span className="text-sm text-gray-500">参考文献</span>
                    </div>
                    <div className="flex flex-1 transition duration-150 hover:scale-120">
                      <AiOutlineEllipsis className="h-8 w-8" />
                    </div>
                  </div>
                </li>
              </ul>
              <ul className="flex w-full cursor-pointer transition duration-300 hover:bg-gray-100">
                <li className="flex h-24 w-full flex-row border-b border-gray-200">
                  <div className="flex flex-1 items-center">
                    <img
                      src="#"
                      alt=""
                      className="mx-4 h-8 w-8 rounded-lg bg-gray-200"
                    />
                    <p className="text-gray-700">4张图片</p>
                  </div>
                  <div className="flex w-full flex-1 flex-row items-center">
                    <span className="mr-8 text-sm text-gray-500">
                      添加于2025年11月30日
                    </span>
                    <div className="flex flex-4">
                      <img
                        src="#"
                        alt=""
                        className="mx-2 h-4 w-4 rounded-lg bg-gray-200"
                      />
                      <span className="text-sm text-gray-500">参考文献</span>
                    </div>
                    <div className="flex flex-1 transition duration-150 hover:scale-120">
                      <AiOutlineEllipsis className="h-8 w-8" />
                    </div>
                  </div>
                </li>
              </ul>
              <ul className="flex w-full cursor-pointer transition duration-300 hover:bg-gray-100">
                <li className="flex h-24 w-full flex-row border-b border-gray-200">
                  <div className="flex flex-1 items-center">
                    <img
                      src="#"
                      alt=""
                      className="mx-4 h-8 w-8 rounded-lg bg-gray-200"
                    />
                    <p className="text-gray-700">4张图片</p>
                  </div>
                  <div className="flex w-full flex-1 flex-row items-center">
                    <span className="mr-8 text-sm text-gray-500">
                      添加于2025年11月30日
                    </span>
                    <div className="flex flex-4">
                      <img
                        src="#"
                        alt=""
                        className="mx-2 h-4 w-4 rounded-lg bg-gray-200"
                      />
                      <span className="text-sm text-gray-500">参考文献</span>
                    </div>
                    <div className="flex flex-1 transition duration-150 hover:scale-120">
                      <AiOutlineEllipsis className="h-8 w-8" />
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
