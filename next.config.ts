import type { NextConfig } from "next";

/** 开发模式：Next 把 /api/v1 代理到本地 NestJS，避免请求打到 Next 自身导致 404 */
/** 用 127.0.0.1 避免 Windows 上 localhost 走 ::1 而后端只监听 IPv4 */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3002";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/v1/:path*",
          destination: `${API_PROXY_TARGET}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
