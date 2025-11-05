import Header from "./_components/Header";

export default function Home() {
  return (
    <div>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 顶部导航栏 */}
        <Header />

        {/* 主体区域 */}
        <div className="grid grid-cols-[240px_1fr]  flex-1 ">
          {/* 左侧边栏 */}
          <aside className="bg-white border-r border-gray-200">
            <nav className="space-y-3">
              <a href="#" className="block text-gray-700 hover:text-blue-500">
                Dashboard
              </a>
              <a href="#" className="block text-gray-700 hover:text-blue-500">
                Files
              </a>
              <a href="#" className="block text-gray-700 hover:text-blue-500">
                Settings
              </a>
            </nav>
          </aside>

          {/* 主内容区 */}
          <main className="bg-white ">
            <h1 className="text-xl font-semibold mb-4">Main Content</h1>

            {/* 自适应网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
          </main>
        </div>
      </div>
    </div>
  );
}
