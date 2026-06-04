# 伏羲文化数据云盘 · 前端

基于 Next.js 16 + React 19 的文件存储管理 Web 端，对接 NestJS 后端 API（仓库 `TNStorage`）。

## 仓库关系

| 仓库 | 路径示例 | 说明 |
|------|----------|------|
| **前端（本仓库）** | `tn-storage-react/` | Next.js 页面与 API 调用 |
| **后端** | `TNStorage/` | NestJS API、MySQL、MinIO、Docker Compose |

两个仓库需放在**同级目录**，一键部署由后端仓库的 `docker-compose.yml` 编排。

```
codefiles/
├── TNStorage/          # 后端 + docker-compose + nginx
└── tn-storage-react/   # 本仓库
```

---

## 环境要求

- Node.js >= 18
- pnpm（推荐）或 npm

环境变量模板（按模式选用）：

| 文件 | 模式 |
|------|------|
| `.env.development.example` | 模式一：本地开发 |
| `.env.deployment.example` | 模式二：Docker 部署 / 验收 |
| `.env.production.example` | 模式三：正式环境 |

---

## 三种运行模式

与后端 `TNStorage` 对齐，共三种模式。下表为**本仓库（前端）**需关注的变量；后端、MySQL、MinIO 参数见 **[TNStorage/README.md](../TNStorage/README.md)**。

### 模式一：本地开发（Development）

前后端分别在本机进程运行，浏览器只访问 Next（3000），API 经 Next 开发代理转发到 NestJS。

**适用**：日常改页面、联调接口。

**启动顺序**：

1. 本机启动 MySQL（3306）、MinIO（9000）
2. 后端：`cd ../TNStorage` → `cp .env.development.example .env.local` → `pnpm start:dev`（默认 `http://127.0.0.1:3002/api/v1`）
3. 前端：`cp .env.development.example .env.local` → `pnpm install` → `pnpm dev`

**访问**： [http://localhost:3000](http://localhost:3000)

**前端环境变量**（`.env.local`，模板见 `.env.development.example`）：

| 变量 | 必填 | 示例值 | 说明 |
|------|------|--------|------|
| `NEXT_PUBLIC_API_URL` | 是 | `/api/v1` | axios 请求前缀；走 Next `rewrites` 代理 |
| `API_PROXY_TARGET` | 是 | `http://127.0.0.1:3002` | 仅 `pnpm dev` 时生效，代理到 NestJS |

> **Windows**：`API_PROXY_TARGET` 请用 `127.0.0.1`，不要用 `localhost`，否则易出现 `ECONNREFUSED ::1:3002`。

**可选：浏览器直连后端**（不用 Next 代理）：

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3002/api/v1
# 此时可不设 API_PROXY_TARGET
```

需与后端 `CORS_ORIGIN=http://localhost:3000` 一致。

**实现位置**：`next.config.ts`（开发模式 `rewrites`）、`src/network/http.ts`（`BASE_URL`）。

---

### 模式二：Docker 部署 / 验收（Deployment）

由 **TNStorage** 目录的 `docker compose` 一键拉起 MySQL、MinIO、API、本前端（`web`）、Nginx。本仓库**无需单独起 `pnpm dev`**。

**适用**：本机验收全栈、演示、与生产相近的集成环境。

**步骤**（在后端仓库执行）：

```bash
cd ../TNStorage
cp .env.example .env
# 编辑 .env：至少修改 MYSQL_ROOT_PASSWORD、DB_PASSWORD、MINIO_SECRET_KEY
docker compose up -d --build
docker compose ps
```

**目录要求**：`TNStorage/` 与 `tn-storage-react/` **同级**。

**访问**：

| 地址 | 说明 |
|------|------|
| http://localhost | Web（Nginx → `web`） |
| http://localhost/api/v1/health | 后端健康检查 |

**前端相关变量**（写在 `TNStorage/.env`，构建 `web` 镜像时注入）：

| 变量 | 示例值 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_API_URL` | `/api/v1` | Docker build-arg，浏览器同域访问 API |
| `HTTP_PORT` | `80` | Nginx 对外端口（在后端 `.env`） |
| `CORS_ORIGIN` | `http://localhost` | 须与浏览器地址栏一致（在后端 `.env`） |

本仓库模板：`.env.deployment.example`（仅说明；一般不必复制到本目录）。

**架构**：

```
浏览器 → Nginx :80
           ├─ /           → web（Next.js standalone）
           └─ /api/v1/*   → api（NestJS）→ mysql / minio
```

---

### 模式三：正式环境（Production）

生产服务器或云主机上使用 Docker Compose（或等价编排），Nginx 对外提供 HTTPS 域名，前后端同域。

**适用**：线上交付。

**前端构建**：在 `TNStorage` 构建 `web` 服务时传入：

| 变量 | 示例值 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_API_URL` | `/api/v1` | **不要**写死后端 IP/端口 |

模板见 `.env.production.example`；完整后端变量（数据库、MinIO、`CORS_ORIGIN=https://你的域名` 等）见 `TNStorage/.env.production.example`。

**注意**：

- `CORS_ORIGIN` 必须与用户浏览器访问的 origin 完全一致（含 `https`）
- 生产密码使用 `change-me-*` 占位符的项必须全部修改

---

## API 配置（三种模式通用）

| 项 | 说明 |
|----|------|
| 基础路径 | `process.env.NEXT_PUBLIC_API_URL`，默认 `/api/v1` |
| 定义位置 | `src/network/http.ts` |
| 认证 | 请求头 `Authorization: Bearer <token>`，token 存 `localStorage.token` |
| 响应格式 | `{ code, message, data, timestamp }`，`code === 0` 为成功 |

---

## 前端调用的后端接口一览

以下路径均相对于 `{NEXT_PUBLIC_API_URL}`（如 `/api/v1`）。

### 认证（无需 Token）

| 方法 | 路径 | 请求体 / 参数 | 前端调用 |
|------|------|---------------|----------|
| POST | `/auth/login` | `{ email, password }` | `useLogin` |
| POST | `/auth/register` | `{ username, password, email, phone, desc? }` | `useRegister` |
| GET | `/auth/salt/:email` | 路径参数 `email` | （预留，当前页面未用） |

> 前端 `useForgotPassword` 调用 `/auth/forgot-password`，**后端尚未实现**，请勿依赖。

### 用户（需 Token）

| 方法 | 路径 | 请求体 / 参数 | 前端调用 |
|------|------|---------------|----------|
| GET | `/user/profile/me` | — | `useGetMyProfile` |
| GET | `/user/username/:username` | 路径 `username` | `useGetUserWithName` |
| POST | `/user/update/me` | `{ username, email, phone, desc }` | `useUpdateMyUserData` |
| PUT | `/user/changePassword/me` | `{ oldPassword, newPassword }` | `useChangeMyPassword` |
| GET | `/user/storage/me` | — | `useGetMyStorage` |
| GET | `/user/settings/me` | — | `useGetMySettings` |
| POST | `/user/settings/me` | 见下方「用户设置字段」 | `useUpdateMySettings` |
| POST | `/user/settings/me/reset-permissions` | — | `useResetMyPermissions` |
| GET | `/user/security/login-history` | — | `useGetMyLoginHistory` |
| POST | `/user/avatar/upload/me` | `multipart/form-data`，字段名 `avatar`，≤1MB | `useAvatarUploadMe` |
| GET | `/user/avatar/me` | — | `useGetMyAvatar` |
| GET | `/user/admin/users` | —（需 admin） | `useGetAdminUsers` |
| PUT | `/user/admin/role/:id` | `{ role: 'admin' \| 'user' \| 'viewer' }` | `useUpdateUserRole` |

**用户设置字段**（`POST /user/settings/me` 可选 body）：

`language`, `theme`, `auto_save`, `default_upload_parent_id`, `auto_clean_temp`, `two_factor_enabled`, `email_notification`, `upload_notification`, `share_notification`, `allow_file_upload`, `allow_file_download`, `allow_file_delete`, `allow_favorite`, `allow_share`

### 文件（除分享下载外需 Token）

#### 分片上传（实际上传入口）

| 步骤 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 1 初始化 | POST | `/file/upload/init/:bucket/:parentId` | JSON body 见下 |
| 2 传分片 | POST | `/file/upload/chunk/:taskId/:chunkIndex` | `multipart`，字段名 `chunk` |
| 3 查进度 | GET | `/file/upload/status/:taskId` | 轮询至 `status === 'completed'` |

**初始化 body**：

```json
{
  "filename": "example.pdf",
  "mimetype": "application/pdf",
  "size": 1048576,
  "totalChunks": 1
}
```

**实现位置**：`src/features/files/services/chunkUpload.ts`（默认分片 5MB）。

> `useUploadFile`（`POST /file/upload/:bucket/:parentid`）为旧接口封装，**后端无此路由**，实际上传请走分片流程。

#### 浏览与操作

| 方法 | 路径 | Body / 参数 | 前端调用 |
|------|------|-------------|----------|
| GET | `/file/tree` | — | `useGetFileSystemTree` |
| GET | `/file/info/:UUID` | — | `useGetFileInfo` |
| GET | `/file/data/:bucket/:UUID` | —，`responseType: blob` | `useGetFile` |
| POST | `/file/folder/create/:foldername/:parent` | — | `useCreateFolder` |
| PUT | `/file/rename/:UUID` | `{ filename }` | `FileDataContext` |
| POST | `/file/move/:UUID` | `{ targetParentId }` | `FileDataContext` |
| POST | `/file/copy/:UUID` | `{ targetParentId }` | `FileDataContext` |

#### 回收站

| 方法 | 路径 | 参数 | 前端调用 |
|------|------|------|----------|
| GET | `/file/trash` | — | `useGetDelListInTrash` |
| POST | `/file/trash/move/:srcBucket/:UUID/:type` | `type`: `file` \| `folder` | `usePushFileDataTrash` |
| POST | `/file/trash/restore/:UUID/:type` | — | `useReStore` |
| DELETE | `/file/:bucket/:UUID/:type` | 永久删除 | `useDeleteFile` |
| DELETE | `/file/trash/empty/:bucket` | — | `useDeleteAllTrash` |

#### 收藏 / 最近 / 分享

| 方法 | 路径 | 前端调用 |
|------|------|----------|
| GET | `/file/favorite` | `useGetFavorites` |
| POST | `/file/favorite/:UUID` | `useAddFavorite` |
| DELETE | `/file/favorite/:UUID` | `useRemoveFavorite` |
| GET | `/file/recent` | `useGetRecents` |
| POST | `/file/recent/access/:UUID` | `useMarkRecentAccess` |
| POST | `/file/share/:UUID` | `useCreateShare` |
| GET | `/file/share` | `useGetShares` |
| DELETE | `/file/share/:token` | `useRevokeShare` |
| GET | `/file/share/download/:token` | 公开下载，浏览器直链 |

分享链接格式：`{origin}/api/v1/file/share/download/{token}`

#### 统计

| 方法 | 路径 | 前端调用 | 备注 |
|------|------|----------|------|
| GET | `/file/download/total` | `useGetDownloadTotal` | |
| GET | `/file/upload/total` | `useGetUploadTotal` | |
| GET | `/file/upload/typeTotal` | `useGetFilesTypeCount` | |
| PUT | `/file/download/set/total` | `useSetDownloadTotal` | 前端误用 GET，应改为 PUT |

---

## 功能模块

- **我的云** — 存储概览、最近文件
- **所有文件** — 树形目录、面包屑、文件夹导航
- **最近 / 收藏 / 回收站**
- **上传** — 分片上传、进度展示
- **设置** — 个人资料、密码、主题、权限（管理员可管用户角色）

---

## 项目结构

```
src/
├── network/           # axios 实例、React Query hooks、类型定义
│   ├── http.ts        # BASE_URL、拦截器
│   ├── hooks/         # login / user / file
│   └── types/         # Request / Response 类型
├── features/files/    # 文件业务（chunkUpload、fileOperations）
├── contexts/          # FileDataContext 等
├── components/        # UI 组件
├── pages/             # Next.js 页面
└── utils/             # auth、fileSystem 工具
```

---

## 常用命令

```bash
pnpm run dev      # 开发
pnpm run build    # 生产构建（standalone，供 Docker）
pnpm run start    # 生产运行
pnpm run lint     # ESLint
```

---

## 许可证

UNLICENSED（与后端 `package.json` 一致）
