# 伏羲文化数据云盘 · 前端

基于 **Next.js 16 + React 19 + Ant Design** 的文件存储 Web 端，包含 **云盘用户界面** 与 **管理后台**，对接 NestJS 后端（仓库 `TNStorage`）。

## 仓库关系

| 仓库 | 路径示例 | 说明 |
|------|----------|------|
| **前端（本仓库）** | `tn-storage-react/` | Next.js 页面、云盘与管理后台 UI |
| **后端** | `TNStorage/` | NestJS API、MySQL、MinIO、Docker Compose |

两个仓库需放在**同级目录**，一键部署由后端 `docker-compose.yml` 编排。

```
codefiles/
├── TNStorage/          # 后端 + docker-compose + nginx
└── tn-storage-react/   # 本仓库
```

完整 API 参数与后端环境变量见 **[TNStorage/README.md](../TNStorage/README.md)**。

---

## 功能概览

### 云盘用户端（`/`, `/login`）

| 模块 | 路由 / 入口 | 说明 |
|------|-------------|------|
| 我的云 | `/` | 存储概览、最近文件 |
| 所有文件 | `/`（文件 Tab） | 树形目录、面包屑、上传、移动/复制/重命名 |
| 最近 / 收藏 / 回收站 | 侧栏 | 快捷访问与回收站操作 |
| 多任务下载 | 传输面板 | 并发 1–5、全局限速（KB/s），设置 → 存储 Tab 可调 |
| 设置 | 设置面板 | 资料、密码、主题、下载并发/限速、权限（云盘 admin 角色可管用户） |
| 分享 | 文件菜单 | 创建/撤销分享链接 |
| 用户协议 | `/legal/agreement` | 读取后端 `GET /site-content` 中的协议正文 |
| 访客页 Footer | 登录 / 访客布局 | 备案号、企业信息、品牌文案（`useSiteContent`） |

### 管理后台（`/admin/*`）

独立登录与会话，与云盘用户 Token **分离**。

| 页面 | 路由 | 主要能力 |
|------|------|----------|
| 登录 | `/admin/login` | 管理员邮箱密码登录 |
| 仪表盘 | `/admin` | 系统指标、活动图表 |
| 云盘用户 | `/admin/users` | 列表/搜索/创建、权限、禁用、配额、详情抽屉 |
| 全局文件 | `/admin/files` | 跨用户文件列表；**下载、预览、移入回收站、永久删除** |
| 回收站 | `/admin/trash` | 恢复、永久删除 |
| 分享 | `/admin/shares` | 列表、撤销 |
| 存储概览 | `/admin/storage` | 全局与用户存储视图 |
| 存储大屏 | `/admin/storage-dashboard` | 用量趋势、磁盘探测、双写状态、维护模式 |
| 存储配置 | `/admin/storage-backends` | 本机/OSS 后端、连通性测试 |
| 数据迁移 | `/admin/storage-migration` | 一键迁移、checksum 对账、取消/重试/续跑 |
| 站点内容 | `/admin/site-content` | 备案、企业、Footer、用户协议正文 |
| 验证与安全 | `/admin/verification` | SMTP、验证策略、审计日志 |
| 备份 | `/admin/backup` | 定时配置、手动备份、下载 ZIP、取消、**恢复** |
| 运维 | `/admin/ops` | 缓存、MinIO、系统配置（脱敏展示） |
| 审计日志 | `/admin/audit-logs` | 管理员操作记录 |
| 员工 | `/admin/staff` | 后台账号 CRUD |
| 登录日志 | `/admin/login-logs` | 管理员登录审计 |

**写权限**：`super_admin` / `admin` 可执行删除、备份触发等；`operator` 只读（按钮隐藏或接口 403）。

默认超级管理员：`admin@fuxi.local` / `Admin@123456`（生产请修改，见后端 `sql/admin_user.sql`）。

---

## 环境要求

- Node.js >= 18
- pnpm >= 9（推荐）

环境变量模板：

| 文件 | 模式 |
|------|------|
| `.env.development.example` | 模式一：本地开发 |
| `.env.deployment.example` | 模式二：Docker（说明用，变量写在 TNStorage `.env`） |
| `.env.production.example` | 模式三：正式环境 |

---

## 三种运行模式

### 模式一：本地开发（Development）

前后端分别在本机运行；浏览器访问 Next（3000），API 经 Next 开发代理转发到 NestJS。

**启动顺序**：

1. 本机 MySQL（3306）、MinIO（9000）
2. 后端：`cd ../TNStorage` → `cp .env.development.example .env.local` → `pnpm start:dev`
3. 前端：`cp .env.development.example .env.local` → `pnpm install` → `pnpm dev`

**访问**：

| 地址 | 说明 |
|------|------|
| http://localhost:3000 | 云盘 |
| http://localhost:3000/admin/login | 管理后台 |

**前端环境变量**（`.env.local`）：

| 变量 | 必填 | 示例值 | 说明 |
|------|------|--------|------|
| `NEXT_PUBLIC_API_URL` | 是 | `/api/v1` | axios 请求前缀；开发走 Next `rewrites` |
| `API_PROXY_TARGET` | 是 | `http://127.0.0.1:3002` | 仅 `pnpm dev` 生效，代理到 NestJS |

> **Windows**：`API_PROXY_TARGET` 请用 `127.0.0.1`，避免 `ECONNREFUSED ::1:3002`。

**可选：浏览器直连后端**（不经 Next 代理）：

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3002/api/v1
```

需与后端 `CORS_ORIGIN=http://localhost:3000` 一致。

**实现位置**：`next.config.ts`（开发 `rewrites`）、`src/network/http.ts`（云盘）、`src/network/adminHttp.ts`（管理后台）。

---

### 模式二：Docker 部署 / 验收

在后端仓库执行 `docker compose up -d --build`，本仓库无需单独 `pnpm dev`。

```bash
cd ../TNStorage
cp .env.example .env
docker compose up -d --build
```

访问 http://localhost（云盘与管理后台同域）。

构建时注入（写在 `TNStorage/.env`）：

| 变量 | 示例 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_API_URL` | `/api/v1` | 浏览器同域访问 API |
| `HTTP_PORT` | `80` | Nginx 端口 |
| `CORS_ORIGIN` | `http://localhost` | 与浏览器 origin 一致 |

---

### 模式三：正式环境

`NEXT_PUBLIC_API_URL=/api/v1`（同域反代），`CORS_ORIGIN=https://你的域名`。详见 `TNStorage/.env.production.example`。

---

## API 与认证

| 客户端 | HTTP 实例 | Token 存储 | 请求头 |
|--------|-----------|------------|--------|
| 云盘 | `src/network/http.ts` | `localStorage.token` | `Authorization: Bearer <token>` |
| 管理后台 | `src/network/adminHttp.ts` | `localStorage.adminToken` | 同上 |

响应格式：`{ code, message, data, timestamp }`，`code === 0` 为成功。  
流式接口（文件下载、备份 ZIP、管理端文件 preview/download）返回二进制，无 JSON 包装。

401 时：云盘跳转 `/login`；管理后台跳转 `/admin/login`（见 `src/utils/auth/adminSession.ts`）。

---

## 云盘接口与 Hooks

路径均相对于 `{NEXT_PUBLIC_API_URL}`。

### 认证（无需 Token）

| 方法 | 路径 | Hook |
|------|------|------|
| POST | `/auth/login` | `useLogin` |
| POST | `/auth/register` | `useRegister` |
| GET | `/auth/salt/:email` | （预留） |

> `useForgotPassword` 调用 `/auth/forgot-password`，**后端未实现**。

### 用户

| 方法 | 路径 | Hook |
|------|------|------|
| GET | `/user/profile/me` | `useGetMyProfile` |
| POST | `/user/update/me` | `useUpdateMyUserData` |
| PUT | `/user/changePassword/me` | `useChangeMyPassword` |
| GET | `/user/storage/me` | `useGetMyStorage` |
| GET/POST | `/user/settings/me` | `useGetMySettings` / `useUpdateMySettings` |
| POST | `/user/settings/me/reset-permissions` | `useResetMyPermissions` |
| GET | `/user/security/login-history` | `useGetMyLoginHistory` |
| POST | `/user/avatar/upload/me` | `useAvatarUploadMe`（字段 `avatar`，≤1MB） |
| GET | `/user/admin/users` | `useGetAdminUsers`（云盘 admin 角色） |

**用户设置 body 可选字段**：`language`, `theme`, `auto_save`, `default_upload_parent_id`, `auto_clean_temp`, 各类 notification、`allow_file_upload/download/delete`, `allow_favorite`, `allow_share`、`download_concurrency`（1–5）、`download_rate_limit_kbps`（0 不限速）。

### 站点内容（公开，无需 Token）

| 方法 | 路径 | Hook |
|------|------|------|
| GET | `/site-content` | `useSiteContent`（`siteContent.ts`） |

### 文件

**分片上传**（实际上传入口，`src/features/files/services/chunkUpload.ts`，默认分片 5MB）：

1. `POST /file/upload/init/:bucket/:parentId` — body: `{ filename, mimetype, size, totalChunks }`
2. `POST /file/upload/chunk/:taskId/:chunkIndex` — multipart 字段 `chunk`
3. `GET /file/upload/status/:taskId` — 轮询至 `completed`

| 方法 | 路径 | Hook / 位置 |
|------|------|-------------|
| GET | `/file/tree` | `useGetFileSystemTree` |
| GET | `/file/data/:bucket/:UUID` | `useGetFile`（blob） |
| POST | `/file/folder/create/:foldername/:parent` | `useCreateFolder` |
| PUT | `/file/rename/:UUID` | `FileDataContext` |
| POST | `/file/move/:UUID` | `{ targetParentId }` |
| GET | `/file/trash` | `useGetDelListInTrash` |
| POST | `/file/trash/move/:srcBucket/:UUID/:type` | `usePushFileDataTrash` |
| DELETE | `/file/:bucket/:UUID/:type` | `useDeleteFile`（永久删除） |
| POST | `/file/share/:UUID` | `useCreateShare` |
| GET | `/file/share/download/:token` | 公开直链 |

> 旧封装 `useUploadFile`（`POST /file/upload/...`）**无对应后端路由**，请勿使用。

---

## 管理后台接口与 Hooks

路径相对于 `{NEXT_PUBLIC_API_URL}`，Token 为管理后台 JWT。

### 认证 · `src/network/hooks/adminAuth.ts`

| 方法 | 路径 | Hook / 函数 |
|------|------|-------------|
| POST | `/admin/auth/login` | `useAdminLogin` |
| GET | `/admin/auth/me` | `useAdminProfile` / `useAdminCanWrite` |
| POST | `/admin/auth/logout` | `useAdminLogout` |
| PUT | `/admin/auth/password` | `useAdminChangePassword` |

### 仪表盘 · 用户 · `src/network/hooks/admin.ts`

| 方法 | 路径 | Hook |
|------|------|------|
| GET | `/admin/metrics` | `useAdminMetrics` |
| GET | `/admin/metrics/activity` | `useAdminActivity` |
| GET | `/admin/storage/overview` | `useAdminStorageOverview` |
| GET | `/admin/storage/users` | `useAdminStorageUsers` |
| GET | `/admin/users` | `useAdminUsers`（`page`, `limit`, `keyword`, `role`, `status`） |
| POST | `/admin/users` | `useAdminCreateUser` |
| PUT | `/admin/users/:id` | `useAdminUpdateUser`（含 `role`） |
| DELETE | `/admin/users/:id` | `useAdminDeleteUser` |
| GET | `/admin/users/:id` | `useAdminUser` |
| PUT | `/admin/users/:id/quota` | `useAdminUpdateUserQuota` |
| PUT | `/admin/users/:id/permissions` | `useAdminUpdateUserPermissions` |
| PUT | `/admin/users/:id/status` | `useAdminUpdateUserStatus` |
| POST | `/admin/users/:id/reset-password` | `useAdminResetPassword` |
| GET | `/admin/users/:id/login-logs` | `useAdminUserLoginLogs` |

### 文件 · 回收站 · 分享

| 方法 | 路径 | Hook / 函数 |
|------|------|-------------|
| GET | `/admin/files` | `useAdminFiles` |
| GET | `/admin/files/:id/download` | `downloadAdminFile(id, filename)` |
| GET | `/admin/files/:id/preview` | `previewAdminFile(id)` |
| DELETE | `/admin/files/:id?mode=trash\|purge` | `useAdminDeleteFile` |
| GET | `/admin/trash` | `useAdminTrash` |
| POST | `/admin/trash/:id/restore` | `useAdminRestoreTrash` |
| DELETE | `/admin/trash/:id` | `useAdminPurgeTrash` |
| GET | `/admin/shares` | `useAdminShares` |
| POST | `/admin/shares/:id/revoke` | `useAdminRevokeShare` |

### 备份 · `src/network/hooks/admin.ts`

| 方法 | 路径 | Hook / 函数 |
|------|------|-------------|
| GET | `/admin/backup/jobs` | `useAdminBackupJobs` |
| GET | `/admin/backup/schedule` | `useAdminBackupSchedule` |
| PUT | `/admin/backup/schedule` | `useAdminUpdateBackupSchedule` |
| POST | `/admin/backup/trigger` | `useAdminTriggerBackup` |
| GET | `/admin/backup/jobs/:id/download` | `downloadAdminBackupJob(id)` |
| DELETE | `/admin/backup/jobs/:id` | `useAdminDeleteBackupJob` |
| POST | `/admin/backup/jobs/:id/cancel` | `useAdminCancelBackupJob` |
| POST | `/admin/backup/jobs/:id/restore` | `useAdminRestoreBackupJob`（body: `{ includeMinio? }`） |

### 存储运维 · `admin.ts` / 各 storage 页面

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/storage/dashboard` | 存储大屏聚合 |
| GET/PUT | `/admin/storage/policy` | 全站策略与维护模式 |
| GET/POST/PUT | `/admin/storage/backends` | 后端配置与测连 |
| GET/POST | `/admin/storage/disk-probe` | 磁盘探测 |
| GET/PUT/POST | `/admin/storage/dual-write` | 双写与切流 |
| GET/POST/PUT | `/admin/storage/migrations` | 迁移任务与 checksum 对账 |

### 站点内容 · `adminSiteContent.ts`

| 方法 | 路径 | Hook |
|------|------|------|
| GET/PUT | `/admin/site-content` | `useAdminSiteContent` / `useAdminUpdateSiteContent` |

### 运维 · 审计 · 员工

| 方法 | 路径 | Hook |
|------|------|------|
| GET | `/admin/ops/overview` | `useAdminOpsOverview` |
| GET | `/admin/ops/minio` | `useAdminOpsMinio` |
| GET | `/admin/ops/config` | `useAdminOpsConfig` |
| POST | `/admin/ops/cache/clear` | `useAdminClearCache` |
| GET | `/admin/audit/logs` | `useAdminAuditLogs` |
| GET | `/admin/staff` | `useAdminStaffList` |
| POST/PUT/DELETE | `/admin/staff` … | `useAdminCreateStaff` 等（`adminStaff.ts`） |
| GET | `/admin/login-logs` | `useAdminLoginLogs` |

---

## 项目结构

```
src/
├── pages/
│   ├── index.tsx, login.tsx …     # 云盘
│   └── admin/                     # 管理后台各页面
├── network/
│   ├── http.ts                    # 云盘 axios
│   ├── adminHttp.ts               # 管理后台 axios
│   └── hooks/                     # admin.ts, adminAuth.ts, adminOps.ts, adminStaff.ts, user.ts, file.ts
├── features/files/                # 分片上传、下载调度与限速
│   └── services/
│       ├── chunkUpload.ts
│       ├── download-queue.scheduler.ts
│       └── download-rate-limiter.ts
├── components/admin/              # AdminLayout, AdminUserSelect 等
├── contexts/                      # FileDataContext, DownloadQueueContext
├── pages/legal/agreement.tsx      # 用户协议展示页
└── utils/auth/                    # token / adminSession
```

---

## 常用命令

```bash
pnpm dev          # 开发（:3000）
pnpm build        # 生产构建（standalone，供 Docker web 镜像）
pnpm start        # 生产运行
pnpm lint         # ESLint
pnpm test:unit    # Vitest（下载调度、限速等单元测试）
```

**后端联调验收**（在 `TNStorage` 目录）：

```bash
pnpm test:smoke:dev    # 云盘核心链路
pnpm test:admin        # 管理后台 P0
pnpm test:admin:files  # 活跃区文件操作
```

---

## 故障排除

| 现象 | 处理 |
|------|------|
| API `ECONNREFUSED ::1:3002` | `API_PROXY_TARGET=http://127.0.0.1:3002` |
| 管理后台 401 循环 | 清 `localStorage.adminToken`，重新 `/admin/login` |
| 云盘与管理后台 Token 混用 | 两套会话独立，不可互换 |
| Compose 构建失败 | 确认 `tn-storage-react` 与 `TNStorage` 同级 |
| 下载无并发 / 不限速 | 设置 → 存储 Tab 检查 `download_concurrency`、`download_rate_limit_kbps` |
| Footer / 协议空白 | 管理后台 `/admin/site-content` 填写并保存；公开接口 `GET /site-content` |

---

## 许可证

UNLICENSED（与后端一致）
