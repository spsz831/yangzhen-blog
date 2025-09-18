# 🚀 Vercel 部署指南

## 📋 准备工作

✅ Railway API 已部署并运行正常
✅ 简化前端代码已创建在 `simple-frontend/` 目录
✅ 前端已配置连接Railway API

## 🌐 Vercel 部署步骤

### 方法1: 通过Vercel网站部署 (推荐)

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择GitHub仓库: `spsz831/yangzhen-blog-railway`
   - **重要**: 在"Root Directory"设置为: `simple-frontend`

3. **环境变量配置**
   - Vercel会自动读取 `vercel.json` 中的环境变量
   - API URL已预配置为: `https://yangzhen-blog-railway-production.up.railway.app/api`

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成(约2-3分钟)

### 方法2: 使用Vercel CLI

```bash
# 安装Vercel CLI
npm install -g vercel

# 进入前端目录
cd "E:\WorkSpace\yangzhen-blog-railway\simple-frontend"

# 部署
vercel --prod
```

## 📡 API 连接测试

部署完成后，访问前端URL，页面会显示:

✅ **成功连接**: 显示"✅ 连接成功"和文章列表
❌ **连接失败**: 显示"❌ 连接失败"和错误信息

## 🔧 前端特性

- **响应式设计**: 适配桌面和移动设备
- **API状态监控**: 实时显示连接状态
- **文章展示**: 显示标题、摘要、作者、日期
- **错误处理**: 友好的错误提示
- **TypeScript**: 类型安全
- **Next.js 15**: 最新框架版本

## 📁 项目结构

```
yangzhen-blog-railway/
├── simple-frontend/         # 🌐 Vercel前端 (轻量版)
│   ├── src/app/
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页
│   │   └── globals.css      # 样式
│   ├── package.json         # 依赖
│   ├── next.config.js       # Next.js配置
│   ├── vercel.json          # Vercel配置
│   └── README.md
├── fullstack/               # 🏠 完整项目存档
├── server-simple.js         # 🚀 Railway API (运行中)
└── package.json             # Railway配置
```

## 🎯 预期结果

部署成功后，您将拥有:

1. **前端**: `your-app.vercel.app` (Vercel托管)
2. **后端**: `yangzhen-blog-railway-production.up.railway.app` (Railway托管)
3. **完整连接**: 前端自动连接后端API

## 🛠️ 问题排查

### 前端显示"连接失败"
1. 检查Railway API是否正常: https://yangzhen-blog-railway-production.up.railway.app/
2. 检查浏览器控制台错误信息
3. 确认CORS设置允许Vercel域名访问

### 构建失败
1. 检查 `package.json` 依赖版本
2. 确认Node.js版本兼容(18+)
3. 查看Vercel构建日志

---

**下一步**: 推送代码到GitHub后，按照上述步骤部署到Vercel即可！