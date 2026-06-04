import Link from 'next/link';
import {
  AiFillCloud,
  AiFillFolder,
  AiFillSafetyCertificate,
  AiOutlineArrowRight,
  AiOutlineClockCircle,
  AiOutlineStar,
} from 'react-icons/ai';

const featureCards = [
  {
    title: '访客模式',
    desc: '先浏览界面和文件结构，再决定是否登录。',
    accent: 'from-[#8a7bff] to-[#d8d2ff]',
  },
  {
    title: '云端协作',
    desc: '上传、收藏、最近记录和回收站都在登录后解锁。',
    accent: 'from-[#5542f6] to-[#c9c1ff]',
  },
  {
    title: '安全控制',
    desc: '权限、设置和个人空间按账户身份分层开放。',
    accent: 'from-[#6d5dfc] to-[#e3deff]',
  },
] as const;

const quickHighlights = [
  { icon: <AiFillFolder className="h-5 w-5" />, label: '分层文件管理' },
  { icon: <AiOutlineStar className="h-5 w-5" />, label: '收藏与最近记录' },
  {
    icon: <AiFillSafetyCertificate className="h-5 w-5" />,
    label: '权限与安全设置',
  },
] as const;

export default function VisitorPanel() {
  return (
    <div className="bg-white">
      <section className="visitor-hero relative overflow-hidden px-6 pt-10 pb-16 md:px-10">
        <div className="absolute top-8 left-8 h-28 w-28 rounded-full bg-[#5542f6]/10 blur-3xl" />
        <div className="absolute right-8 bottom-8 h-36 w-36 rounded-full bg-[#8e81ff]/12 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-8 xl:grid-cols-[1.2fr_0.9fr]">
          <div className="rounded-[32px] border border-white/80 bg-white/78 p-8 shadow-[0_30px_80px_rgba(85,66,246,0.10)] backdrop-blur md:p-10">
            <div className="inline-flex items-center rounded-full border border-[#d8d2ff] bg-white/90 px-4 py-2 text-xs font-medium tracking-[0.24em] text-[#6a5ddd] uppercase">
              Visitor Access
            </div>

            <h1 className="mt-6 max-w-3xl font-['Georgia'] text-5xl leading-[1.05] font-semibold text-[#2e2c34] md:text-6xl">
              在登录前先看一眼
              <span className="block text-[#5542f6]">你的云存储工作台</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f5b6b] md:text-lg">
              伏羲文化数据云盘
              为您提供安全稳定的云端存储体验，支持多端同步与高效文件管理，让数据触手可及。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {quickHighlights.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e1dcff] bg-[#f7f5ff] px-4 py-2 text-sm text-[#4d4670]"
                >
                  <span className="text-[#5542f6]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login?tab=login"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#5542f6] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#4532e6]"
              >
                进入登录
                <AiOutlineArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?tab=register"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#ddd8ff] bg-white px-6 py-3 text-sm font-medium text-[#5542f6] transition hover:border-[#c7beff] hover:bg-[#f7f5ff]"
              >
                创建账户
                <AiOutlineArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-[#dcd6ff] bg-[linear-gradient(160deg,_#5542f6_0%,_#6d5dfc_55%,_#8d84ff_100%)] p-7 text-white shadow-[0_30px_80px_rgba(85,66,246,0.24)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm tracking-[0.24em] text-white/60 uppercase">
                    Workspace
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">伏羲文化数据云盘</h2>
                </div>
                <div className="rounded-2xl bg-white/12 p-3">
                  <AiFillCloud className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="mt-8 rounded-3xl bg-white/10 p-5">
                <div className="flex items-center justify-between text-sm text-white/75">
                  <span>存储空间预览</span>
                  <span>访客只读</span>
                </div>
                <div className="mt-4 h-3 rounded-full bg-white/10">
                  <div className="h-3 w-[58%] rounded-full bg-gradient-to-r from-white via-[#e7e1ff] to-[#c7beff]" />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-semibold">58%</p>
                    <p className="mt-1 text-sm text-white/65">示例工作区占用</p>
                  </div>
                  <p className="text-sm text-white/65">登录后查看个人容量</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <InfoCard
                icon={<AiOutlineClockCircle className="h-5 w-5" />}
                title="最近记录"
                desc="登录后查看最近上传、最近访问和最近修改文件。"
                value="时间线联动"
              />
              <InfoCard
                icon={<AiOutlineStar className="h-5 w-5" />}
                title="个性空间"
                desc="收藏、个人主页、设置项和权限都会跟账户一起保存。"
                value="数据持久化"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_14px_30px_rgba(31,41,55,0.06)]"
              >
                <div
                  className={`h-2 w-full rounded-full bg-gradient-to-r ${item.accent}`}
                />
                <p className="mt-4 text-lg font-semibold text-[#2e2c34]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-[#665f7a]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[32px] border border-gray-200 bg-[#f8f7ff] p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium tracking-[0.2em] text-[#7c74b8] uppercase">
                  Before You Sign In
                </p>
                <h3 className="mt-2 text-3xl font-semibold text-[#2e2c34]">
                  伏羲文化数据云盘，安全可用
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login?tab=login"
                  className="rounded-2xl bg-[#5542f6] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#4532e6]"
                >
                  登录使用完整功能
                </Link>
                <Link
                  href="/login?tab=register"
                  className="rounded-2xl border border-[#d9d3ff] bg-white px-5 py-3 text-sm font-medium text-[#5542f6] transition hover:bg-[#f4f2ff]"
                >
                  注册新账户
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1f2024] px-6 py-12 text-white md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.15fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <p className="text-sm font-medium tracking-[0.24em] text-white/45 uppercase">
              伏羲文化数据云盘
            </p>
            <h4 className="mt-4 text-3xl font-semibold">访客入口</h4>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
              这里是独立的访客页面。你可以先了解系统界面、存储能力和产品结构，真正需要上传、
              收藏、最近记录和个人空间时，再进入登录或注册流程。
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/55">
              <span className="rounded-full border border-white/10 px-3 py-1">
                Visitor Preview
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Cloud Workspace
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Account Access
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-white/45">快速入口</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/82">
              <Link
                href="/login?tab=login"
                className="transition hover:text-white"
              >
                登录账户
              </Link>
              <Link
                href="/login?tab=register"
                className="transition hover:text-white"
              >
                注册账户
              </Link>
              <Link href="/visitor" className="transition hover:text-white">
                访客首页
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-white/45">产品能力</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/68">
              <p>文件上传与分层管理</p>
              <p>收藏、最近记录与回收站</p>
              <p>个人主页、设置与权限控制</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-white/45">帮助信息</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/68">
              <p>首次使用建议先注册账户并进入个人工作台</p>
              <p>如需上传、收藏或查看个人数据，请先登录</p>
              <p>如遇权限限制，请联系系统管理员处理</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© 2026 伏羲文化数据云盘. All rights reserved.</p>
          <p>
            Cloud workspace for storage, organization and account-based access.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .visitor-hero {
          background: linear-gradient(
            135deg,
            #fdfcff 0%,
            #f3f1ff 28%,
            #ece8ff 48%,
            #ffffff 72%,
            #f8f6ff 100%
          );
          background-size: 220% 220%;
          animation: visitorGradientShift 12s ease-in-out infinite;
        }

        @keyframes visitorGradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  desc,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#e5e0ff] bg-white/82 p-6 shadow-[0_18px_50px_rgba(85,66,246,0.08)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-[#f3f1ff] p-3 text-[#5542f6]">
          {icon}
        </div>
        <span className="rounded-full bg-[#f4f1ff] px-3 py-1 text-xs font-medium text-[#675d92]">
          {value}
        </span>
      </div>
      <p className="mt-5 text-xl font-semibold text-[#2e2c34]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#665f7a]">{desc}</p>
    </div>
  );
}
