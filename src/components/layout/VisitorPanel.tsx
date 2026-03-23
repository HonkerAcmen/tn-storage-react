import Link from 'next/link';

export default function VisitorPanel() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <h1 className="text-4xl font-semibold text-[#2e2c34]">TNStorage</h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          当前为访客模式。你可以直接浏览首页和系统介绍，但上传文件、收藏、最近记录、
          个人主页和回收站等能力需要登录后使用。
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <VisitorCard title="访客" desc="无需登录即可进入页面" />
          <VisitorCard title="普通用户" desc="可上传、下载、收藏、分享和删除自己的文件" />
          <VisitorCard title="管理员" desc="可在权限页面调整其他用户身份" />
        </div>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login?tab=login"
            className="rounded-lg bg-[#5542f6] px-4 py-2 text-sm text-white"
          >
            登录
          </Link>
          <Link
            href="/login?tab=register"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700"
          >
            注册
          </Link>
        </div>
      </div>
    </div>
  );
}

function VisitorCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
