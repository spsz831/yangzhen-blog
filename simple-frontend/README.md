# YangZhen Blog - Simple Frontend

这是YangZhen个人博客的简化前端版本，用于快速部署到Vercel。

## 🚀 特性

- ✅ Next.js 15 + TypeScript
- ✅ 连接Railway API
- ✅ 响应式设计
- ✅ 文章展示
- ✅ API状态监控

## 🔧 本地开发

```bash
cd simple-frontend
npm install
npm run dev
```

## 🌐 Vercel部署

1. 连接GitHub仓库
2. 设置项目根目录为: `simple-frontend`
3. 环境变量已在 `vercel.json` 中配置
4. 自动部署

## 📡 API连接

- **Production API**: https://yangzhen-blog-railway-production.up.railway.app/api
- **自动检测**: 页面会显示API连接状态
- **错误处理**: 连接失败时显示友好提示

## 📁 项目结构

```
simple-frontend/
├── src/
│   └── app/
│       ├── layout.tsx      # 根布局
│       ├── page.tsx        # 首页
│       └── globals.css     # 全局样式
├── package.json            # 依赖配置
├── next.config.js          # Next.js配置
├── tsconfig.json           # TypeScript配置
└── vercel.json             # Vercel部署配置
```