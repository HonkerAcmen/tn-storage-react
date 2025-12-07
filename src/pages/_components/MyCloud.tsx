import {
  AiFillCustomerService,
  AiFillFile,
  AiFillFileImage,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFolder,
  AiFillPicture,
  AiFillPlaySquare,
  AiFillStar,
  AiFillVideoCamera,
  AiOutlineEllipsis,
} from 'react-icons/ai';
import EChart from '@/components/Echart';
export default function MyCloud() {
  const saveData = [
    {
      key: '1',
      name: '文件',
      fileNumber: 120,
      fileSize: 1.2 * 1024 * 1024,
      iconBg: '#e5f6ff',
      icon: <AiFillFileText className="scale-125 text-[#00a5ff]" />,
    },
    {
      key: 2,
      name: '图片',
      fileNumber: 98,
      fileSize: 5.1 * 1024 * 1024,
      iconBg: '#eeecfe',
      icon: <AiFillPicture className="scale-125 text-[#5542f6]" />,
    },
    {
      key: 3,
      name: '视频',
      fileNumber: 19,
      fileSize: 3.4 * 1024 * 1024,
      iconBg: '#e8f9f6',
      icon: <AiFillPlaySquare className="scale-125 text-[#22c9ad]" />,
    },
    {
      key: 4,
      name: '音频',
      fileNumber: 32,
      fileSize: 0.98 * 1024 * 1024,
      iconBg: '#fef0f5',
      icon: <AiFillCustomerService className="scale-125 text-[#fa699d]" />,
    },
    {
      key: 5,
      name: '其他',
      fileNumber: 50,
      fileSize: 0.024 * 1024 * 1024,
      iconBg: '#fff5ec',
      icon: <AiFillFile className="scale-125 text-[#ffa043]" />,
    },
  ];

  return (
    <div className="grid w-full gap-6 p-6 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
      {/* ================= 左侧内容 ================= */}
      <div className="col-span-8 flex flex-col space-y-8">
        {/* 活动 */}
        <section>
          <h1 className="py-4 text-3xl font-semibold text-[#2e2c34]">我的云</h1>
          <p className="mb-4 text-sm text-[#2e2c34]">从你的活动来看</p>

          {/* 自适应网格卡片 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex h-32 cursor-pointer flex-col rounded-2xl border border-gray-100 p-4 transition duration-175 hover:bg-gray-100"
                >
                  <AiFillFolder className="my-2 h-10 w-10 text-amber-400" />
                  <h2 className="text-gray-800">设计{i + 1}</h2>
                  <span className="text-sm text-gray-600">23 Oct 2025</span>
                </div>
              ))}
          </div>
        </section>

        {/* 最近上传 */}
        <section>
          <p className="mb-4 text-sm text-[#2e2c34]">最近上传</p>

          <ul className="flex flex-col">
            {[
              { icon: <AiFillFileImage />, name: '图片' },
              { icon: <AiFillFilePdf />, name: 'PDF 文件' },
              { icon: <AiFillVideoCamera />, name: '视频' },
            ].map((item, i) => (
              <li
                key={i}
                className="hover:bg-graymask-b-to-blue-100 mb-2 flex h-20 items-center justify-between rounded-lg border border-gray-100 px-4 py-1 transition hover:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">{item.icon}</div>
                  <p className="text-gray-700">{item.name}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>添加于 2025-11-30</span>
                  <div className="flex items-center space-x-1">
                    <AiFillFolder className="text-amber-400" />
                    <span>参考文献</span>
                  </div>
                  <AiOutlineEllipsis className="h-5 w-5 cursor-pointer text-gray-600" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 已收藏 */}
        <section>
          <p className="mb-4 text-sm text-[#2e2c34]">已收藏</p>

          <ul className="flex flex-col divide-y divide-gray-200">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <li
                  key={i}
                  className="mb-2 flex h-16 cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-1 transition duration-150 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <AiFillFolder className="h-8 w-8 text-amber-400" />
                    <p className="text-gray-700">设计#{i + 1}</p>
                  </div>
                  <AiFillStar className="mr-6 h-6 w-6 text-amber-400" />
                </li>
              ))}
          </ul>
        </section>
      </div>

      {/* ================= 右侧图表 ================= */}
      <div className="col-span-4 rounded-2xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">存储大小</h2>
        <div
          className="flex h-[200px] items-center justify-center rounded-xl text-gray-400"
          style={{ boxShadow: '0px 0px 5px #eaeaea' }}
        >
          <EChart
            option={{
              tooltip: {
                trigger: 'item',
              },

              series: [
                {
                  name: 'Access From',
                  type: 'pie',
                  radius: ['40%', '50%'],
                  center: ['50%', '70%'],
                  startAngle: 180,
                  endAngle: 360,
                  data: saveData.map((item) => ({
                    value: item.fileNumber,
                    name: item.name,
                  })),
                },
              ],
            }}
          />
        </div>
        {saveData.map((item) => (
          <div
            key={item.key}
            className="mt-4 flex flex-row items-center justify-between"
          >
            <div className="flex">
              <div
                className={`mr-4 flex h-14 w-14 items-center justify-center rounded-lg`}
                style={{ backgroundColor: item.iconBg }}
              >
                {item.icon}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-gray-800">{item.name}</p>
                <span className="text-gray-500">{item.fileNumber} files</span>
              </div>
            </div>
            <span className="text-gray-600">
              {item.fileSize / 1024 / 1024} GB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
