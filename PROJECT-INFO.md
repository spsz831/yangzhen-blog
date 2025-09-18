# YangZhen Blog - Complete Repository

这个仓库包含了YangZhen个人博客的完整代码和简化部署版本。

## 📁 仓库结构

```
yangzhen-blog-railway/
├── fullstack/           # 🏠 完整的前后端项目
│   ├── frontend/        # Next.js 前端应用
│   ├── backend/         # Express + Prisma 后端应用
│   └── README.md        # 完整项目文档
│
├── server-simple.js     # 🚀 Railway 简化部署版本
├── package.json         # Railway 部署配置
├── railway.json         # Railway 构建配置
└── README.md           # 本文件
```

## 🎯 双版本说明

### 🚀 Railway 部署版本 (当前运行)
- **文件**: `server-simple.js`, `package.json`, `railway.json`
- **特点**: 简化的 Express 服务器，使用内存存储
- **用途**: 快速部署到 Railway，无数据库依赖
- **状态**: ✅ 已部署运行
- **API URL**: https://yangzhen-blog-railway-production.up.railway.app

### 🏠 完整开发版本
- **路径**: `fullstack/` 目录
- **特点**: 完整的前后端项目，包含数据库、TypeScript等
- **用途**: 完整开发、本地调试、功能扩展
- **状态**: 📦 代码存档，可用于 Vercel 前端部署

## 🔄 Railway 部署安全性

Railway只会读取根目录的配置文件：
- `package.json` → 指向 `server-simple.js`
- `railway.json` → 配置构建和启动命令
- `server-simple.js` → 简化的API服务器

`fullstack/` 目录中的文件**不会影响Railway部署**，可以安全添加。

## 🚀 快速使用

### 测试API (Railway版本)
```bash
# 基础信息
curl https://yangzhen-blog-railway-production.up.railway.app/

# 获取文章
curl https://yangzhen-blog-railway-production.up.railway.app/api/posts

# 用户登录 (用户名: yangzhen, 密码: admin123456)
curl -X POST https://yangzhen-blog-railway-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"yangzhen","password":"admin123456"}'
```

### 部署前端 (Vercel)
```bash
# 进入前端目录
cd fullstack/frontend

# 安装依赖
npm install

# 配置环境变量
echo "NEXT_PUBLIC_API_URL=https://yangzhen-blog-railway-production.up.railway.app" > .env.local

# 部署到 Vercel
vercel --prod
```

## 📊 功能对比

| 功能 | Railway版本 | 完整版本 |
|------|-------------|----------|
| 用户认证 | ✅ | ✅ |
| 文章管理 | ✅ | ✅ |
| 分类标签 | ✅ | ✅ |
| 评论系统 | ❌ | ✅ |
| 数据持久化 | 内存存储 | PostgreSQL |
| TypeScript | ❌ | ✅ |
| 前端界面 | ❌ | ✅ Next.js |

---

**当前状态**: Railway API ✅ 运行正常，可以开始部署前端！