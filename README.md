# 个人博客系统 📝

一个简洁的个人博客系统，支持文章发布、管理和展示。

## ✨ 功能特性

- 📝 文章发布与管理
- 👤 管理员认证系统
- 💾 PostgreSQL数据持久化
- 📱 响应式设计
- ⚡ 高性能架构

## 🏗️ 技术栈

**后端**: Node.js + Express + PostgreSQL
**前端**: Next.js + TypeScript + Tailwind CSS
**部署**: Railway + Vercel

## 🚀 在线访问

- **博客网站**: https://yangzhen-blog-railway.vercel.app
- **API服务**: https://yangzhen-blog-railway-production.up.railway.app

## 🛠️ 本地开发

```bash
# 克隆项目
git clone https://github.com/spsz831/yangzhen-blog-railway.git
cd yangzhen-blog-railway

# 后端开发
npm install
npm run dev

# 前端开发
cd fullstack/frontend
npm install
npm run dev
```

## 🌐 部署

### Railway (后端)
1. 连接GitHub仓库
2. 添加PostgreSQL服务
3. 自动部署完成

### Vercel (前端)
1. 连接GitHub仓库
2. 设置构建目录为 `fullstack/frontend`
3. 自动部署完成

## 📖 API接口

- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:slug` - 获取文章详情
- `POST /api/auth/login` - 管理员登录
- `POST /api/posts` - 发布文章 (需要认证)

## 📄 许可证

MIT License

---

*个人博客系统 - 简洁而强大*