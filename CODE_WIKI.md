# MYMUSIC — Code Wiki

> Apple Music 风格个人沉浸式音乐播放网站，集成网易云音乐 API

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈与依赖](#2-技术栈与依赖)
3. [项目结构](#3-项目结构)
4. [架构设计](#4-架构设计)
5. [前端模块详解](#5-前端模块详解)
   - 5.1 [入口与路由](#51-入口与路由)
   - 5.2 [全局类型定义](#52-全局类型定义)
   - 5.3 [状态管理（Zustand Stores）](#53-状态管理zustand-stores)
   - 5.4 [API 服务层](#54-api-服务层)
   - 5.5 [自定义 Hooks](#55-自定义-hooks)
   - 5.6 [布局组件](#56-布局组件)
   - 5.7 [播放器组件](#57-播放器组件)
   - 5.8 [卡片与通用组件](#58-卡片与通用组件)
   - 5.9 [页面组件](#59-页面组件)
   - 5.10 [工具函数](#510-工具函数)
   - 5.11 [全局样式](#511-全局样式)
6. [后端模块详解](#6-后端模块详解)
   - 6.1 [服务入口](#61-服务入口)
   - 6.2 [路由模块](#62-路由模块)
   - 6.3 [服务层](#63-服务层)
   - 6.4 [中间件](#64-中间件)
7. [API 端点参考](#7-api-端点参考)
8. [数据流与依赖关系](#8-数据流与依赖关系)
9. [配置文件参考](#9-配置文件参考)
10. [运行与部署](#10-运行与部署)

---

## 1. 项目概述

MYMUSIC 是一个深度复刻 Apple Music 视觉语言与交互灵魂的个人沉浸式音乐播放网站。前端使用 React + TypeScript + Vite 构建，后端使用 Express 代理网易云音乐 API。动画层集成 GSAP、anime.js 和 AMLL（Apple Music Like Lyrics）歌词渲染引擎。

核心特性：
- Apple Music 风格的全屏播放器，支持封面模式/歌词分栏模式切换
- AMLL 逐字歌词渲染，支持 YRC/LRC 格式
- 流体渐变背景，颜色从封面动态取色
- 网易云音乐 QR 码扫码登录
- 图片/音频跨域代理
- 可自定义的播放器设置面板（字体、效果、背景渲染等）

---

## 2. 技术栈与依赖

### 前端核心

| 技术 | 包名 | 版本 | 用途 |
|------|------|------|------|
| React | `react` / `react-dom` | ^18.3.1 | UI 框架 |
| TypeScript | `typescript` | ~5.8.3 | 类型安全 |
| Vite | `vite` | ^6.3.5 | 构建工具 |
| TailwindCSS | `tailwindcss` | ^3.4.17 | 原子化样式 |
| Zustand | `zustand` | ^5.0.3 | 状态管理 |
| Jotai | `jotai` | ^2.20.0 | AMLL 组件内部原子状态 |
| React Router | `react-router-dom` | ^7.3.0 | 客户端路由 |
| GSAP | `gsap` | ^3.12.5 | 封面呼吸/入场动画 |
| anime.js | `animejs` | ^3.2.2 | 模式切换过渡动画 |
| Axios | `axios` | ^1.7.0 | HTTP 客户端 |
| Lucide React | `lucide-react` | ^0.511.0 | 图标库 |

### AMLL 歌词引擎

| 包名 | 版本 | 用途 |
|------|------|------|
| `@applemusic-like-lyrics/react-full` | ^0.4.1 | React 封装的完整歌词播放器 |
| `@applemusic-like-lyrics/lyric` | ^1.0.1 | 歌词核心解析库 |
| `@applemusic-like-lyrics/core` | — | 底层渲染引擎（MeshGradient/Pixi） |

### PixiJS（背景渲染可选）

| 包名 | 版本 | 用途 |
|------|------|------|
| `@pixi/app` | ^7.4.3 | PixiJS 应用 |
| `@pixi/core` | ^7.4.3 | PixiJS 核心 |
| `@pixi/display` | ^7.4.3 | 显示对象 |
| `@pixi/sprite` | ^7.4.3 | 精灵图 |
| `@pixi/filter-blur` | ^7.4.3 | 模糊滤镜 |
| `@pixi/filter-bulge-pinch` | ^5.1.1 | 凸起/收缩滤镜 |
| `@pixi/filter-color-matrix` | ^7.4.3 | 颜色矩阵滤镜 |

### 后端核心

| 技术 | 包名 | 版本 | 用途 |
|------|------|------|------|
| Express | `express` | ^4.21.2 | HTTP 服务器 |
| NeteaseCloudMusicApi | `NeteaseCloudMusicApi` | ^4.32.0 | 网易云 API 封装 |
| CORS | `cors` | ^2.8.5 | 跨域中间件 |
| dotenv | `dotenv` | ^17.2.1 | 环境变量 |
| qrcode | `qrcode` | ^1.5.4 | QR 码生成 |

### 开发工具

| 包名 | 版本 | 用途 |
|------|------|------|
| `concurrently` | ^9.2.0 | 并行启动前后端 |
| `nodemon` | ^3.1.10 | 后端热重载 |
| `tsx` | ^4.20.3 | TS 直接执行 |
| `vite-tsconfig-paths` | ^5.1.4 | 路径别名解析 |

---

## 3. 项目结构

```
mymusic/
├── index.html                    # 入口 HTML
├── package.json                  # 依赖与脚本
├── vite.config.ts                # Vite 构建配置
├── tailwind.config.js            # Tailwind 主题配置
├── tsconfig.json                 # TypeScript 配置
├── postcss.config.js             # PostCSS 配置
├── nodemon.json                  # 后端热重载配置
├── .env                          # 环境变量
│
├── src/                          # ── 前端源码 ──
│   ├── main.tsx                  # React 入口
│   ├── App.tsx                   # 根路由组件
│   ├── index.css                 # 全局样式
│   ├── vite-env.d.ts             # Vite 类型声明
│   │
│   ├── types/
│   │   └── index.ts              # 全局类型定义
│   │
│   ├── stores/
│   │   ├── playerStore.ts        # 播放器状态
│   │   ├── uiStore.ts            # UI 状态
│   │   └── authStore.ts          # 认证状态
│   │
│   ├── services/
│   │   └── api.ts                # Axios API 封装
│   │
│   ├── hooks/
│   │   ├── useAlbumColors.ts     # 封面取色
│   │   ├── useLyricSync.ts       # 歌词同步
│   │   └── useTheme.ts           # 主题切换
│   │
│   ├── lib/
│   │   └── utils.ts              # Tailwind 类名合并
│   │
│   ├── utils/
│   │   └── format.ts             # 格式化工具
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── MainLayout.tsx    # 主布局框架
│   │   │   ├── Sidebar.tsx       # 左侧导航
│   │   │   └── BottomBar.tsx     # 底部播放栏
│   │   │
│   │   ├── Player/
│   │   │   ├── NowPlaying.tsx    # 全屏播放器（含 AMLLBridge）
│   │   │   ├── PlayerSettings.tsx # 播放器设置面板
│   │   │   ├── FluidBackground.tsx # 流体渐变背景
│   │   │   ├── VinylCover.tsx    # 封面组件
│   │   │   ├── LyricView.tsx     # 歌词滚动视图
│   │   │   ├── PlayerControls.tsx # 播放控制面板
│   │   │   └── AudioEngine.tsx   # 音频引擎
│   │   │
│   │   └── Cards/
│   │       ├── PlaylistCard.tsx  # 歌单/专辑卡片
│   │       └── SongList.tsx      # 歌曲列表
│   │
│   └── pages/
│       ├── Home.tsx              # 首页
│       ├── Browse.tsx            # 浏览页
│       ├── Search.tsx            # 搜索页
│       ├── PlaylistDetail.tsx    # 歌单详情
│       ├── AlbumDetail.tsx       # 专辑详情
│       ├── Profile.tsx           # 个人中心
│       └── Login.tsx             # 登录页
│
└── api/                          # ── 后端源码 ──
    ├── app.ts                    # Express 应用入口
    ├── server.ts                 # 本地开发服务器入口
    ├── index.ts                  # Vercel Serverless 入口
    │
    ├── routes/
    │   ├── auth.ts               # 认证路由
    │   ├── search.ts             # 搜索路由
    │   ├── playlist.ts           # 歌单路由
    │   ├── song.ts               # 歌曲路由
    │   ├── lyric.ts              # 歌词路由
    │   ├── recommend.ts          # 推荐路由
    │   ├── top.ts                # 排行路由
    │   └── user.ts               # 用户路由
    │
    ├── services/
    │   ├── ncm.ts                # NCM API 封装
    │   ├── mapper.ts             # 数据映射层
    │   └── netease.ts            # 网易云开放平台签名请求
    │
    └── middleware/
        ├── auth.ts               # Cookie 注入中间件
        └── lyricParser.ts        # 歌词解析中间件
```

---

## 4. 架构设计

### 4.1 整体架构

```
┌─────────────────────────────────────────────────┐
│                   浏览器                          │
│  ┌───────────────────────────────────────────┐  │
│  │           React SPA (Vite :5173)          │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐ │  │
│  │  │ Pages   │→ │Components│→ │ Stores  │ │  │
│  │  └────┬────┘  └────┬─────┘  └────┬────┘ │  │
│  │       │            │              │       │  │
│  │       └────────────┼──────────────┘       │  │
│  │                    ▼                       │  │
│  │              ┌──────────┐                  │  │
│  │              │ api.ts   │  Axios HTTP      │  │
│  │              └────┬─────┘                  │  │
│  └───────────────────┼───────────────────────┘  │
│                      │ /api/*                    │
│              Vite Proxy (dev)                    │
└──────────────────────┼──────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────┐
│           Express Server (:3001)                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ Routes   │→ │ Middleware│→ │ Services     │  │
│  │ /api/*   │  │ cookieInject│ │ ncm + mapper │  │
│  └──────────┘  └───────────┘  └──────┬───────┘  │
│                                       │          │
│  ┌──────────┐  ┌───────────┐          │          │
│  │ /image   │  │ /audio    │          │          │
│  │ 代理     │  │ 流式转发  │          │          │
│  └──────────┘  └───────────┘          │          │
└───────────────────────────────────────┼──────────┘
                                        ▼
                              网易云音乐 API 服务器
```

### 4.2 前端数据流

```
用户交互 → Zustand Store 更新 → React 组件重渲染
                ↓
         AudioEngine 监听 store 变化 → 控制 <audio> 元素
                ↓
         useLyricSync 监听 songId → 获取歌词 → AMLL 渲染
                ↓
         useAlbumColors 监听封面 URL → 提取颜色 → FluidBackground
```

### 4.3 播放器状态机

```
coverVisualState:  expanded ←→ collapsed
lyricLayoutMode:   centered-cover ←→ split-lyrics

封面模式 (centered-cover):
  ┌─────────────────────────┐
  │      封面（居中放大）     │
  │      歌曲信息            │
  │      紧凑歌词            │
  └─────────────────────────┘

歌词模式 (split-lyrics):
  ┌──────────┬──────────────┐
  │  封面    │   歌词滚动   │
  │  (40%)   │   (60%)      │
  │  垂直居中│   垂直居中    │
  └──────────┴──────────────┘
```

---

## 5. 前端模块详解

### 5.1 入口与路由

#### `src/main.tsx`

应用入口文件，将 `<App />` 挂载到 `#root` DOM 节点。

```ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

#### `src/App.tsx`

根路由组件，使用 React Router 定义所有页面路由。

| 路由 | 组件 | 布局 |
|------|------|------|
| `/` | `Home` | MainLayout |
| `/browse` | `Browse` | MainLayout |
| `/search` | `Search` | MainLayout |
| `/playlist/:id` | `PlaylistDetail` | MainLayout |
| `/album/:id` | `AlbumDetail` | MainLayout |
| `/profile` | `Profile` | MainLayout |
| `/login` | `Login` | 独立（无 MainLayout） |

**导出**: `export default function App(): JSX.Element`

**依赖**: `react-router-dom`, `MainLayout`, 各页面组件

---

### 5.2 全局类型定义

#### `src/types/index.ts`

定义项目所有核心数据结构。

| 类型 | 结构 | 说明 |
|------|------|------|
| `Song` | `{ id, name, artists: Artist[], album: Album, duration, url?, privilege? }` | 歌曲实体 |
| `Artist` | `{ id, name, picUrl?, alias? }` | 歌手实体 |
| `Album` | `{ id, name, picUrl, publishTime, company? }` | 专辑实体 |
| `Playlist` | `{ id, name, coverImgUrl, description, trackCount, playCount, tracks: Song[], creator, tags }` | 歌单实体 |
| `LyricData` | `{ lrc: LrcLine[], yrc?: YrcWord[], tlyric?: LrcLine[] }` | 歌词数据 |
| `LrcLine` | `{ time: number, text: string }` | LRC 歌词行 |
| `YrcWord` | `{ time: number, duration: number, text: string }` | YRC 逐字歌词 |
| `PlaybackMode` | `'sequence' \| 'shuffle' \| 'repeat-one' \| 'repeat-all'` | 播放模式 |
| `CoverVisualState` | `'expanded' \| 'collapsed'` | 封面视觉状态 |
| `LyricLayoutMode` | `'centered-cover' \| 'split-lyrics'` | 歌词布局模式 |
| `SearchResult` | `{ songs?, artists?, albums?, playlists?, songCount? }` | 搜索结果 |

---

### 5.3 状态管理（Zustand Stores）

#### `src/stores/playerStore.ts`

播放器核心状态管理。

**导出**: `const usePlayerStore: UseBoundStore<PlayerState>`

**状态字段**:

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `currentSong` | `Song \| null` | `null` | 当前播放歌曲 |
| `playlist` | `Song[]` | `[]` | 当前播放列表 |
| `queue` | `Song[]` | `[]` | 待播队列 |
| `isPlaying` | `boolean` | `false` | 播放状态 |
| `currentTime` | `number` | `0` | 当前播放时间（秒） |
| `duration` | `number` | `0` | 总时长（秒） |
| `volume` | `number` | `0.8` | 音量（0-1） |
| `playbackMode` | `PlaybackMode` | `'sequence'` | 播放模式 |
| `coverVisualState` | `CoverVisualState` | `'collapsed'` | 封面视觉状态 |
| `lyricLayoutMode` | `LyricLayoutMode` | `'centered-cover'` | 歌词布局模式 |

**方法**:

| 方法 | 签名 | 说明 |
|------|------|------|
| `playSong` | `(song: Song, list?: Song[]) => void` | 播放歌曲，可选设置播放列表 |
| `togglePlay` | `() => void` | 切换播放/暂停 |
| `next` | `() => void` | 下一首（根据播放模式） |
| `prev` | `() => void` | 上一首 |
| `seekTo` | `(time: number) => void` | 跳转到指定时间 |
| `setCurrentTime` | `(time: number) => void` | 更新当前时间 |
| `setDuration` | `(dur: number) => void` | 设置总时长 |
| `setVolume` | `(vol: number) => void` | 设置音量 |
| `cyclePlaybackMode` | `() => void` | 循环切换播放模式 |
| `addToQueue` | `(song: Song) => void` | 添加到待播队列 |
| `removeFromQueue` | `(index: number) => void` | 从队列移除 |
| `clearQueue` | `() => void` | 清空队列 |
| `setCoverVisualState` | `(state: CoverVisualState) => void` | 设置封面视觉状态 |
| `setLyricLayoutMode` | `(mode: LyricLayoutMode) => void` | 设置歌词布局模式 |
| `toggleLyricMode` | `() => void` | 切换封面/歌词模式 |

**依赖**: `zustand`, `../types`

---

#### `src/stores/uiStore.ts`

UI 全局状态管理。

**导出**: `const useUIStore: UseBoundStore<UIState>`

**状态字段**:

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `isNowPlayingOpen` | `boolean` | `false` | 全屏播放器是否打开 |
| `isSidebarCollapsed` | `boolean` | `false` | 侧边栏是否折叠 |
| `homeGreeting` | `string` | `getGreeting()` | 首页问候语 |

**方法**:

| 方法 | 签名 | 说明 |
|------|------|------|
| `openNowPlaying` | `() => void` | 打开全屏播放器 |
| `closeNowPlaying` | `() => void` | 关闭全屏播放器 |
| `toggleNowPlaying` | `() => void` | 切换全屏播放器 |
| `toggleSidebar` | `() => void` | 切换侧边栏折叠 |
| `setHomeGreeting` | `(greeting: string) => void` | 设置问候语 |

**内部函数**: `getGreeting()` — 根据当前小时返回中文问候语（早上好/下午好/晚上好）

**依赖**: `zustand`

---

#### `src/stores/authStore.ts`

用户认证状态管理，持久化到 localStorage。

**导出**: `const useAuthStore: UseBoundStore<AuthState>`

**状态字段**:

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `isLoggedIn` | `boolean` | `false` | 是否已登录 |
| `neteaseCookie` | `string` | `''` | 网易云 Cookie |
| `uid` | `number \| null` | `null` | 用户 ID |
| `nickname` | `string` | `''` | 昵称 |
| `avatarUrl` | `string` | `''` | 头像 URL |

**方法**:

| 方法 | 签名 | 说明 |
|------|------|------|
| `setLoggedIn` | `(cookie: string) => void` | 设置登录态，持久化 Cookie |
| `setUserInfo` | `(nickname: string, avatarUrl: string, uid?: number) => void` | 设置用户信息 |
| `logout` | `() => void` | 登出，清除 localStorage |
| `checkStatus` | `() => Promise<void>` | 检查登录状态 |
| `fetchAccount` | `() => Promise<void>` | 拉取账户信息 |

**内部函数**: `loadSavedAuth()` — 从 localStorage 恢复登录态

**依赖**: `zustand`

---

### 5.4 API 服务层

#### `src/services/api.ts`

Axios HTTP 客户端封装，提供所有后端 API 调用函数。请求拦截器自动从 localStorage 读取 Cookie 并注入到 `x-netease-cookie` 请求头。

**导出函数**:

| 函数 | 签名 | 说明 |
|------|------|------|
| `searchAll` | `(keyword: string, limit?: number) => Promise<SearchResult>` | 搜索歌曲/歌手/专辑/歌单 |
| `searchHot` | `() => Promise<{ hots: { searchWord, first? }[] }>` | 热门搜索关键词 |
| `searchSuggest` | `(keyword: string) => Promise<any>` | 搜索建议 |
| `getPlaylistDetail` | `(id: number) => Promise<{ playlist: Playlist }>` | 歌单详情 |
| `getAlbumDetail` | `(id: number) => Promise<{ album: Album; songs: Song[] }>` | 专辑详情 |
| `getSongDetail` | `(ids: number[]) => Promise<{ songs: Song[] }>` | 歌曲详情（批量） |
| `getSongUrl` | `(id: number) => Promise<{ data: { url }[] }>` | 歌曲播放地址 |
| `getLyric` | `(id: number) => Promise<LyricData>` | 歌词（LRC + YRC + 翻译） |
| `getRecommendPlaylist` | `() => Promise<{ playlists: Playlist[] }>` | 推荐歌单（需 Cookie） |
| `getRecommendSongs` | `() => Promise<{ songs: Song[] }>` | 每日推荐歌曲（需 Cookie） |
| `getTopPlaylists` | `(cat?: string, limit?: number) => Promise<{ playlists: Playlist[] }>` | 热门歌单 |
| `getTopAlbums` | `(limit?: number) => Promise<{ albums: Album[] }>` | 新碟上架 |
| `getUserPlaylists` | `(uid: number) => Promise<{ playlist: Playlist[] }>` | 用户歌单 |
| `getRecentPlays` | `() => Promise<{ list: Playlist[] }>` | 最近播放 |

**依赖**: `axios`, `../types`

---

### 5.5 自定义 Hooks

#### `src/hooks/useAlbumColors.ts`

从专辑封面图片动态提取主色调。

```ts
function useAlbumColors(imageUrl: string | undefined): string[]
```

- 返回 3 个 hex 颜色字符串，默认品牌色 `['#FA586A', '#C084FC', '#6366F1']`
- 内部使用 Canvas 绘制图片 → `getImageData` → 四象限平均采样 → 颜色距离去重
- 内部函数: `getDominantColors()`, `rgbToHex()`, `hexToRgb()`

**依赖**: `react`

---

#### `src/hooks/useLyricSync.ts`

歌词数据获取与格式转换，将后端 LRC/YRC 数据转为 AMLL 的 `LyricLine[]` 格式。

```ts
function useLyricSync(songId?: number): LyricLine[]
```

- 根据 `songId` 调用 `getLyric` API 获取歌词
- 将 LRC 行和 YRC 逐字数据转换为 `@applemusic-like-lyrics/core` 的 `LyricLine` 格式
- 支持逐字歌词（YRC）和行级歌词（LRC）两种模式

**依赖**: `react`, `../services/api`, `@applemusic-like-lyrics/core`

---

#### `src/hooks/useTheme.ts`

明暗主题管理。

```ts
function useTheme(): { theme: Theme; toggleTheme: () => void; isDark: boolean }
```

- `Theme = 'light' | 'dark'`
- 优先读 localStorage，其次跟随系统偏好
- 切换时更新 `document.documentElement` 的 class 并持久化

**依赖**: `react`

---

### 5.6 布局组件

#### `src/components/Layout/MainLayout.tsx`

应用根布局框架。

```ts
export default function MainLayout()
```

组合结构: `Sidebar` + 主内容区（`<Outlet />`）+ `BottomBar` + `NowPlaying` + `AudioEngine`

**依赖**: `react-router-dom`, `Sidebar`, `BottomBar`, `NowPlaying`, `AudioEngine`, `playerStore`, `uiStore`

---

#### `src/components/Layout/Sidebar.tsx`

左侧导航栏。

```ts
export default function Sidebar()
```

- Logo 区域
- 导航链接: 首页(`/`)、浏览(`/browse`)、搜索(`/search`)、个人中心(`/profile`)
- 底部用户登录状态区域（已登录显示头像+昵称，未登录显示登录入口）
- 内部常量 `navItems` 定义导航项

**依赖**: `react-router-dom`, `lucide-react`, `uiStore`, `authStore`

---

#### `src/components/Layout/BottomBar.tsx`

底部迷你播放控制栏。

```ts
export default function BottomBar()
```

- 左侧: 封面缩略图 + 歌曲信息
- 中间: 播放/暂停/上一首/下一首按钮
- 右侧: 循环模式切换 + 音量滑块 + 歌词按钮
- 底部: 进度条（GSAP 驱动平滑动画）
- 点击整栏打开全屏播放器

**依赖**: `react`, `gsap`, `lucide-react`, `playerStore`, `uiStore`, `format`, `PlaybackMode`

---

### 5.7 播放器组件

#### `src/components/Player/NowPlaying.tsx`

全屏播放器页面，项目最复杂的组件。

```ts
export default function NowPlaying()
```

- 集成 AMLL `PrebuiltLyricPlayer` 歌词渲染
- 内含 `AMLLBridge` 内部组件：将 Zustand store 状态同步到 Jotai atoms
- AMLLBridge 负责: 歌词数据注入、播放时间同步、FFT 音频分析数据提供
- 封面模式/歌词模式切换动画
- 右上角设置按钮 → 打开 `PlayerSettings`

**AMLLBridge 内部组件**（非导出）:

```ts
function AMLLBridge()
```

- 模块级变量: `audioAnalyzer`（Web Audio API AnalyserNode）、`sourceCreated`
- 连接 Zustand → Jotai atoms 的数据桥接
- 通过 `requestAnimationFrame` 高精度同步播放时间（16ms 精度）
- FFT 频谱数据提供

**依赖**: `@applemusic-like-lyrics/react-full`, `jotai`, `playerStore`, `uiStore`, `useLyricSync`, `PlayerSettings`, `lucide-react`

---

#### `src/components/Player/PlayerSettings.tsx`

播放器设置面板，右侧抽屉式弹出。

```ts
export default function PlayerSettings({ onClose }: { onClose: () => void })
```

设置分区:

| 分区 | 可配置项 |
|------|---------|
| 歌词字体 | 大小预设（7级）、字体家族（5种）、字重（5级）、字间距（5级） |
| 歌词行效果 | 渐变宽度滑块、模糊效果、缩放效果、弹簧动画 |
| 翻译与音译 | 翻译歌词、音译歌词、交换翻译/音译 |
| 显示选项 | 隐藏歌词视图、歌曲名、艺术家、专辑名、音量控制、底部控制、剩余时间 |
| 控件类型 | 标准/频谱/无 |
| 封面布局 | 自动/标准/沉浸 |
| 背景 | 渲染器（渐变/Pixi/CSS背景）、分辨率比率、帧率、静态模式 |

内部通用组件: `Section`, `Toggle`, `OptionGroup`, `Slider`

**依赖**: `jotai`, `@applemusic-like-lyrics/react-full`, `@applemusic-like-lyrics/core`, `lucide-react`

---

#### `src/components/Player/FluidBackground.tsx`

流体渐变背景，三层 radial-gradient 叠加 + CSS keyframes 漂移动画。

```ts
interface Props { colors: string[] }
export default function FluidBackground({ colors }: Props)
```

- 接收 3 个颜色字符串，生成三层渐变球
- 每层独立 CSS animation 漂移，不同速度和方向
- `useMemo` 缓存渐变样式

**依赖**: `react`

---

#### `src/components/Player/VinylCover.tsx`

专辑封面组件，AMLL 风格呼吸动画。

```ts
interface Props { song: Song; isPlaying: boolean }
export default function VinylCover({ song, isPlaying }: Props)
```

- 播放时: `scale(1)`，无动画
- 暂停时: GSAP 动画 `scale(0.75)`，过冲缓动 `power3.out`
- 专辑封面阴影: `0 20px 40px rgba(0,0,0,0.6)`

**依赖**: `react`, `gsap`, `../types`

---

#### `src/components/Player/LyricView.tsx`

歌词滚动视图（自实现版本，非 AMLL）。

```ts
export default function LyricView()
```

- AMLL 风格视觉层级: 当前行最亮，上下行渐隐 + 模糊 + 缩放
- 支持逐字 karaoke 高亮（内部组件 `KaraokeWord`）
- 自动滚动到当前行

**内部组件**:

```ts
function KaraokeWord({ word, currentMs, isActiveLine, baseFontSize })
```

- 逐字高亮: 已唱部分品牌红色，未唱部分白色
- 进度计算: `(currentMs - word.time) / word.duration`

**依赖**: `react`, `playerStore`, `api`, `../types`

---

#### `src/components/Player/PlayerControls.tsx`

播放控制面板。

```ts
interface Props { onProgressClick?: (e: React.MouseEvent) => void }
export default function PlayerControls({ onProgressClick }: Props)
```

- 进度条（可点击跳转）
- 播放/暂停、上一首、下一首按钮
- 循环模式切换: 顺序 → 随机 → 单曲循环 → 列表循环

**依赖**: `lucide-react`, `playerStore`, `format`

---

#### `src/components/Player/AudioEngine.tsx`

全局音频引擎，管理 `<audio>` 元素。

```ts
export default function AudioEngine()
```

- 开发环境直连 `http://localhost:3001`（绕过 Vite 代理超时）
- 监听 `playerStore` 变化控制播放/暂停/音量/seek
- `timeupdate` 事件更新 `currentTime`
- `ended` 事件触发自动下一首
- 请求 MP3 格式音频（level: `higher`）

**内部常量**: `API_BASE` — 开发环境 `http://localhost:3001`，生产环境空字符串

**依赖**: `react`, `playerStore`, `api`

---

### 5.8 卡片与通用组件

#### `src/components/Cards/PlaylistCard.tsx`

歌单/专辑卡片。

```ts
interface CardProps { item: Playlist | Album; type: 'playlist' | 'album' }
export default function PlaylistCard({ item, type }: CardProps)
```

- 点击导航到 `/playlist/:id` 或 `/album/:id`
- Hover 显示播放按钮
- 内部类型守卫: `isPlaylist(item: Playlist | Album): item is Playlist`

**依赖**: `react-router-dom`, `../types`, `lucide-react`

---

#### `src/components/Cards/SongList.tsx`

歌曲列表组件。

```ts
interface Props { songs: Song[]; onPlayAll?: () => void; showHeader?: boolean }
export default function SongList({ songs, onPlayAll, showHeader }: Props)
```

- 顶部"播放全部"按钮
- 逐行歌曲项: 序号、封面、歌名、歌手、时长
- 点击歌曲项播放

**依赖**: `react`, `lucide-react`, `../types`, `playerStore`, `format`

---

### 5.9 页面组件

#### `src/pages/Home.tsx`

首页，展示问候语 + 日期、推荐歌单、热门歌单。

```ts
export default function Home()
```

- 问候语来自 `uiStore.homeGreeting`
- 推荐歌单: 调用 `getRecommendPlaylist()`（需登录）
- 热门歌单: 调用 `getTopPlaylists()`
- 含骨架屏加载态和空状态处理

**依赖**: `react`, `uiStore`, `api`, `PlaylistCard`, `Playlist`

---

#### `src/pages/Browse.tsx`

浏览页，分类标签切换 + 热门歌单 + 新碟上架。

```ts
export default function Browse()
```

- 顶部分类标签栏（全部/华语/欧美/日语/韩语/粤语等）
- 热门歌单网格: `getTopPlaylists(cat)`
- 新碟上架网格: `getTopAlbums()`

**依赖**: `react`, `api`, `PlaylistCard`, `Playlist`, `Album`

---

#### `src/pages/Search.tsx`

搜索页。

```ts
export default function SearchPage()
```

- 搜索框 + 热门搜索标签（`searchHot()`）
- 输入关键词后调用 `searchAll(keyword)` 展示结果歌曲列表
- 点击歌曲直接播放

**依赖**: `react`, `lucide-react`, `api`, `playerStore`, `format`, `Song`

---

#### `src/pages/PlaylistDetail.tsx`

歌单详情页。

```ts
export default function PlaylistDetail()
```

- 渐变头部: 封面 + 歌单名称 + 描述 + 播放数
- 歌曲列表: `SongList` 组件
- 从 URL 参数获取 `id`，调用 `getPlaylistDetail(id)`

**依赖**: `react`, `react-router-dom`, `api`, `playerStore`, `SongList`, `Playlist`

---

#### `src/pages/AlbumDetail.tsx`

专辑详情页。

```ts
export default function AlbumDetail()
```

- 渐变头部: 封面 + 专辑名称 + 歌手 + 发行时间 + 厂牌
- 歌曲列表: `SongList` 组件
- 从 URL 参数获取 `id`，调用 `getAlbumDetail(id)`

**依赖**: `react`, `react-router-dom`, `api`, `playerStore`, `SongList`, `Album`, `Song`

---

#### `src/pages/Profile.tsx`

个人中心页。

```ts
export default function Profile()
```

- 未登录自动跳转 `/login`
- 展示用户头像 + 昵称
- "我喜欢的音乐"歌单入口
- 收藏的歌单网格: `getUserPlaylists(uid)`

**依赖**: `react`, `react-router-dom`, `lucide-react`, `authStore`, `api`, `Playlist`

---

#### `src/pages/Login.tsx`

登录页，网易云音乐 QR 码扫码登录。

```ts
export default function LoginPage()
```

- 内部类型: `QRStatus = 'loading' | 'waiting' | 'scanned' | 'success' | 'expired'`
- 登录流程: 获取 QR key → 生成 QR 图片 → 轮询检测扫码状态 → 登录成功跳转
- 扫码状态: 800(过期) / 801(等待) / 802(已扫待确认) / 803(成功)
- 过期自动刷新二维码

**依赖**: `react`, `react-router-dom`, `lucide-react`, `authStore`

---

### 5.10 工具函数

#### `src/utils/format.ts`

| 函数 | 签名 | 说明 |
|------|------|------|
| `formatTime` | `(seconds: number) => string` | 秒数转 `m:ss` 格式 |
| `formatCount` | `(count: number) => string` | 数字转中文简写（1.2万 / 3.5亿） |

#### `src/lib/utils.ts`

| 函数 | 签名 | 说明 |
|------|------|------|
| `cn` | `(...inputs: ClassValue[]) => string` | 合并 TailwindCSS 类名（clsx + twMerge） |

---

### 5.11 全局样式

#### `src/index.css`

| 类别 | 内容 |
|------|------|
| **字体** | `@font-face`: SF Pro Display (400/700)、SF Pro Text (400) |
| **CSS 变量** | 字体栈、播放器色彩系统（primary/surface/outline 等 10+ token）、缓动曲线 |
| **全局样式** | `html/body/#root` 高度 100%、overflow hidden、自定义滚动条 |
| **工具类** | `.mask-fade-y`（边缘消隐遮罩）、`.glass-panel`（毛玻璃）、`.glass-panel-heavy`（强调毛玻璃）、`.scroll-x`（横向滚动） |
| **关键帧** | `ripple-expand`（涟漪）、`apple-press`（按钮按压）、`amll-fade-in`（淡入）、`slideInRight`（右滑入） |
| **AMLL 覆写** | `.amll-lyric-player` 字体大小使用 `var(--amll-lp-font-size, 16px) !important` |
| **选中色** | `::selection` 品牌红 `#FA586A` |

---

## 6. 后端模块详解

### 6.1 服务入口

#### `api/app.ts`

Express 应用入口，注册全局中间件和路由。

**导出**: `export default app` — Express Application 实例

**职责**:
- 加载 `.env` 环境变量
- 注册 CORS、JSON 解析中间件
- 挂载 7 个路由模块
- 图片代理 `/api/image`（缓存 86400s）
- 音频代理 `/api/audio`（流式转发 + Range 支持 + 伪造 Referer）
- 健康检查 `/api/health`
- 404 兜底 + 全局错误处理

**依赖**: `express`, `cors`, `dotenv`, 全部路由模块, `ncm`, `mapper`

---

#### `api/server.ts`

本地开发服务器入口。

```ts
const PORT = process.env.PORT || 3001
app.listen(PORT)
```

- 监听 SIGTERM/SIGINT 信号优雅关闭

---

#### `api/index.ts`

Vercel Serverless 部署入口。

```ts
export default function handler(req: VercelRequest, res: VercelResponse)
```

---

### 6.2 路由模块

#### `api/routes/auth.ts`

认证路由，网易云二维码登录流程。

| 方法 | 路径 | 参数 | 返回值 |
|------|------|------|--------|
| GET | `/api/auth/qr/key` | 无 | `{ success, unikey }` |
| GET | `/api/auth/qr/create` | `key`(必填), `qrimg`(默认'true') | `{ success, qrurl, qrimg }` |
| GET | `/api/auth/qr/check` | `key`(必填) | `{ code: 800\|801\|802\|803, message, cookie? }` |
| GET | `/api/auth/status` | 无 | `{ loggedIn }` |
| GET | `/api/auth/account` | 无(依赖cookie) | `{ success, account?, profile? }` |

---

#### `api/routes/search.ts`

搜索路由。

| 方法 | 路径 | 参数 | 返回值 |
|------|------|------|--------|
| GET | `/api/search` | `keyword`, `type`(默认'1'), `limit`(默认'20') | `{ songs, artists, albums, playlists, songCount }` |
| GET | `/api/search/hot` | 无 | `{ hots }` |
| GET | `/api/search/suggest` | `keyword` | NCM 原始 result 对象 |

---

#### `api/routes/playlist.ts`

歌单路由。

| 方法 | 路径 | 参数 | 返回值 |
|------|------|------|--------|
| GET | `/api/playlist/detail` | `id` | `{ playlist }` |

核心逻辑: 若歌单 `tracks` 为空但 `trackIds` 有值，自动调用 `playlist_track_all` 补全歌曲列表。

---

#### `api/routes/song.ts`

歌曲路由。

| 方法 | 路径 | 参数 | 返回值 |
|------|------|------|--------|
| GET | `/api/song/detail` | `ids`(逗号分隔) | `{ songs }` |
| GET | `/api/song/url` | `id` | NCM 原始 body（音质 level='higher'，MP3 格式） |

---

#### `api/routes/lyric.ts`

歌词路由。

| 方法 | 路径 | 参数 | 返回值 |
|------|------|------|--------|
| GET | `/api/lyric` | `id` | `{ lrc: LrcLine[], yrc?: YrcWord[], tlyric?: LrcLine[] }` |

---

#### `api/routes/recommend.ts`

推荐路由（需 Cookie）。

| 方法 | 路径 | 参数 | 返回值 |
|------|------|------|--------|
| GET | `/api/recommend/playlist` | 无 | `{ playlists }` |
| GET | `/api/recommend/songs` | 无 | `{ songs }` |

---

#### `api/routes/top.ts`

排行榜路由。

| 方法 | 路径 | 参数 | 返回值 |
|------|------|------|--------|
| GET | `/api/top/playlist` | `cat`(默认'全部'), `limit`(默认'20') | `{ playlists }` |
| GET | `/api/top/album` | `limit`(默认'20') | `{ albums }` |
| GET | `/api/top/list` | 无 | `{ list }` |
| GET | `/api/top/songs` | `type`(默认'0') | `{ songs }` |

---

#### `api/routes/user.ts`

用户路由。

| 方法 | 路径 | 参数 | 返回值 |
|------|------|------|--------|
| GET | `/api/user/playlist` | `uid`(必填) | `{ playlist }` |
| GET | `/api/user/recent` | 无(依赖cookie) | `{ list }` |

---

### 6.3 服务层

#### `api/services/ncm.ts`

NCM API 封装层。

```ts
export default ncm  // NeteaseCloudMusicApi 整个包对象
```

- 使用 `createRequire` 在 ESM 环境中加载 CJS 包 `NeteaseCloudMusicApi`
- 导出为 ESM default，供路由模块直接调用 NCM 的各接口方法

**依赖**: `module`(createRequire), `NeteaseCloudMusicApi`

---

#### `api/services/mapper.ts`

数据映射层，将 NCM API 原始字段映射为前端统一类型。

| 函数 | 签名 | 说明 |
|------|------|------|
| `mapSong` | `(raw: any) => { id, name, artists, album, duration, url, privilege } \| null` | 映射单首歌曲 |
| `mapSongs` | `(raws: any[]) => mapped[]` | 批量映射歌曲，过滤 null |
| `mapPlaylist` | `(raw: any) => { id, name, coverImgUrl, description, trackCount, playCount, tracks, creator, tags } \| null` | 映射歌单 |
| `mapPlaylists` | `(raws: any[]) => mapped[]` | 批量映射歌单 |
| `mapAlbum` | `(raw: any) => { id, name, picUrl, publishTime, company } \| null` | 映射专辑 |

核心逻辑:
- 内部 `proxyUrl()` 函数将外部图片 URL 编码为 `/api/image?url=...` 代理地址
- 兼容 NCM 不同接口的字段命名差异（`ar`/`artists`、`al`/`album`）

**依赖**: 无外部依赖

---

#### `api/services/netease.ts`

网易云开放平台签名请求封装（当前项目实际未使用，路由均走 ncm 包）。

| 函数 | 签名 | 说明 |
|------|------|------|
| `buildSignedParams` | `(path, params, appId, appSecret, pubKey, privateKey) => signedParams` | 构建带签名的请求参数 |
| `neteaseRequest` | `(path, params?, cookie?) => response` | 发起网易云 API 请求 |

签名逻辑: RSA-SHA256 签名 + RSA 加密 appSecret + 降级到公共 API

**依赖**: `axios`, `crypto`

---

### 6.4 中间件

#### `api/middleware/auth.ts`

Cookie 注入中间件。

```ts
export function cookieInject(req: Request, _res: Response, next: NextFunction)
```

- 从请求头 `x-netease-cookie` 读取前端扫码登录后传递的 Cookie
- 降级到 `.env` 的 `NETEASE_COOKIE` 环境变量
- 将 Cookie 写入 `req.neteaseCookie`

**依赖**: `express`

---

#### `api/middleware/lyricParser.ts`

歌词解析中间件，处理 LRC 和 YRC 格式。

**导出**:

| 导出 | 类型 | 说明 |
|------|------|------|
| `LrcLine` | `interface` | `{ time: number; text: string }` |
| `YrcWord` | `interface` | `{ time: number; duration: number; text: string }` |
| `parseLrc` | `(lrcStr: string) => LrcLine[]` | 解析标准 LRC 歌词 |
| `parseYrc` | `(yrcStr: string) => YrcWord[]` | 解析 YRC 逐字歌词 |

**parseLrc 逻辑**:
- 时间格式 `[mm:ss.ms]`
- 清理混入的逐字时间码

**parseYrc 逻辑**:
- 行头格式 `[startTime,duration]`
- 逐字格式 `(offset,duration,flag)word`（3参数）或 `(offset,duration)word`（2参数）
- 逐字时间 = 行 startTime + wordOffset
- 无逐字匹配时整行 fallback

**依赖**: 无外部依赖

---

## 7. API 端点参考

### 认证

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/auth/qr/key` | 获取二维码 key | 否 |
| GET | `/api/auth/qr/create?key=&qrimg=true` | 生成二维码图片 | 否 |
| GET | `/api/auth/qr/check?key=` | 检查扫码状态 | 否 |
| GET | `/api/auth/status` | 检查登录状态 | 否 |
| GET | `/api/auth/account` | 获取账户信息 | Cookie |

### 搜索

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/search?keyword=&type=1&limit=20` | 综合搜索 | 否 |
| GET | `/api/search/hot` | 热门搜索 | 否 |
| GET | `/api/search/suggest?keyword=` | 搜索建议 | 否 |

### 歌单

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/playlist/detail?id=` | 歌单详情 | 否 |

### 歌曲

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/song/detail?ids=1,2,3` | 歌曲详情 | 否 |
| GET | `/api/song/url?id=` | 播放地址(MP3) | 否 |

### 歌词

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/lyric?id=` | 歌词(LRC+YRC+翻译) | 否 |

### 推荐

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/recommend/playlist` | 推荐歌单 | Cookie |
| GET | `/api/recommend/songs` | 每日推荐歌曲 | Cookie |

### 排行

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/top/playlist?cat=全部&limit=20` | 热门歌单 | 否 |
| GET | `/api/top/album?limit=20` | 新碟上架 | 否 |
| GET | `/api/top/list` | 排行榜 | 否 |
| GET | `/api/top/songs?type=0` | 飙升歌曲 | 否 |

### 用户

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/user/playlist?uid=` | 用户歌单 | Cookie |
| GET | `/api/user/recent` | 最近播放 | Cookie |

### 代理

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/image?url=` | 图片代理(缓存86400s) | 否 |
| GET | `/api/audio?url=` | 音频流式代理(Range支持) | 否 |

### 系统

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/health` | 健康检查 | 否 |

---

## 8. 数据流与依赖关系

### 8.1 前端模块依赖图

```
App.tsx
├── MainLayout.tsx
│   ├── Sidebar.tsx ← uiStore, authStore
│   ├── <Outlet /> → Pages
│   ├── BottomBar.tsx ← playerStore, uiStore, gsap
│   ├── NowPlaying.tsx ← playerStore, uiStore, jotai, AMLL
│   │   ├── AMLLBridge (内部) ← useLyricSync, Web Audio API
│   │   └── PlayerSettings.tsx ← jotai atoms
│   └── AudioEngine.tsx ← playerStore, api
│
├── Home.tsx ← uiStore, api
├── Browse.tsx ← api
├── Search.tsx ← api, playerStore
├── PlaylistDetail.tsx ← api, playerStore
├── AlbumDetail.tsx ← api, playerStore
├── Profile.tsx ← authStore, api
└── Login.tsx ← authStore
```

### 8.2 Store 依赖关系

```
playerStore (独立)
  ├── 被 AudioEngine 读写
  ├── 被 BottomBar 读写
  ├── 被 NowPlaying 读写
  ├── 被 PlayerControls 读写
  ├── 被 SongList 写入
  └── 被各页面写入

uiStore (独立)
  ├── 被 Sidebar 读写
  ├── 被 BottomBar 读写
  ├── 被 NowPlaying 读写
  └── 被 Home 读取

authStore (独立)
  ├── 被 Sidebar 读取
  ├── 被 Profile 读写
  └── 被 Login 写入
```

### 8.3 API 调用链

```
前端 api.ts → Vite Proxy → Express Routes → ncm.ts → NeteaseCloudMusicApi → 网易云服务器
                                          → mapper.ts → 数据转换 → 响应
                                          → auth.ts middleware → Cookie 注入
                                          → lyricParser.ts → 歌词解析
```

### 8.4 音频播放数据流

```
用户点击歌曲 → playerStore.playSong()
    → AudioEngine useEffect 监听 currentSong 变化
    → api.getSongUrl(id) → 获取 MP3 URL
    → <audio>.src = http://localhost:3001/api/audio?url=...
    → Express 流式代理 → 网易云 CDN
    → <audio>.play()
    → timeupdate → playerStore.setCurrentTime()
    → AMLLBridge rAF → 同步播放时间到 Jotai atom → AMLL 渲染歌词
```

### 8.5 歌词渲染数据流

```
NowPlaying 挂载 → useLyricSync(songId)
    → api.getLyric(id) → 后端 /api/lyric
    → ncm.lyric(id) + parseLrc + parseYrc
    → 返回 { lrc, yrc, tlyric }
    → useLyricSync 转换为 AMLL LyricLine[]
    → AMLLBridge 写入 Jotai atom
    → PrebuiltLyricPlayer 渲染
```

---

## 9. 配置文件参考

### `vite.config.ts`

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `plugins` | react, trae-solo-badge, tsconfig-paths | React 支持 + 路径别名 |
| `resolve.alias` | `react/compiler-runtime` → CJS runtime | React Compiler 兼容 |
| `resolve.dedupe` | `['react', 'react-dom']` | 防止多实例 |
| `optimizeDeps.exclude` | `['amll-reference']` | 排除 AMLL 预构建 |
| `server.proxy` | `/api` → `localhost:3001` | API 代理，30s 超时 |
| `server.watch.ignored` | `amll-reference` | 忽略 AMLL 变更 |

### `tailwind.config.js`

| 配置项 | 值 |
|--------|-----|
| `darkMode` | `'class'` |
| `colors.brand.red` | `#FA586A` |
| `colors.brand.purple` | `#C084FC` |
| `colors.brand.indigo` | `#6366F1` |
| `colors.surface.dark` | `#000000` |
| `colors.surface.base` | `#121212` |
| `colors.surface.card` | `rgba(255,255,255,0.06)` |
| `colors.surface.hover` | `rgba(255,255,255,0.10)` |
| `colors.text.primary` | `#FFFFFF` |
| `colors.text.secondary` | `#B3B3B3` |
| `colors.text.muted` | `rgba(255,255,255,0.4)` |
| `borderRadius.card` | `12px` |
| `borderRadius.lg-card` | `16px` |
| `borderRadius.pill` | `999px` |
| `backdropBlur.mica` | `30px` |
| `fontFamily.sans` | SF Pro Display, PingFang SC, ... |

### `tsconfig.json`

| 配置项 | 值 |
|--------|-----|
| `target` | `ES2020` |
| `module` | `ESNext` |
| `jsx` | `react-jsx` |
| `strict` | `false` |
| `baseUrl` | `./` |
| `paths` | `@/* → ./src/*` |
| `include` | `src`, `api` |

### `.env`

| 变量 | 说明 |
|------|------|
| `NETEASE_APP_ID` | 网易云开放平台 App ID |
| `NETEASE_APP_SECRET` | 网易云开放平台 App Secret |
| `NETEASE_PUB_KEY` | RSA 公钥 |
| `NETEASE_PRIVATE_KEY` | RSA 私钥 |
| `NETEASE_COOKIE` | 网易云账户 Cookie（私有接口必需） |
| `PORT` | 后端端口（默认 3001） |

### `nodemon.json`

| 配置项 | 值 |
|--------|-----|
| `watch` | `["api"]` |
| `ext` | `"ts,mts,js,json"` |
| `exec` | `tsx api/server.ts` |
| `delay` | `1000` |

---

## 10. 运行与部署

### 本地开发

```bash
# 安装依赖
npm install

# 同时启动前端(:5173) + 后端(:3001)
npm run dev

# 仅启动前端
npm run client:dev

# 仅启动后端
npm run server:dev

# TypeScript 类型检查
npm run check

# 生产构建
npm run build
```

### 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| Vite Dev Server | 5173 | 前端开发服务器 |
| Express | 3001 | 后端 API 服务器 |

### 开发环境特殊处理

1. **音频直连**: 开发环境 `<audio>` 直连 `http://localhost:3001` 绕过 Vite 代理超时
2. **图片代理**: 所有外部图片 URL 通过 `/api/image?url=...` 代理，绕开 CDN 跨域
3. **音频代理**: 通过 `/api/audio?url=...` 流式转发，伪造 `Referer: https://music.163.com/`

### Vercel 部署

后端提供 `api/index.ts` 作为 Vercel Serverless 入口:

```ts
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res)
}
```

### 环境变量配置

在项目根目录 `.env` 中配置网易云凭证，其中 `NETEASE_COOKIE` 是推荐方式（收藏、推荐等私有接口需要登录态）。
