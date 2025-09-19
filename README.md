# 杨振个人博客 🚀

一个使用现代技术栈构建的个人博客，支持企业级PostgreSQL数据存储。

## ✨ 功能特性

- 📝 **文章管理** - 发布、编辑、删除文章
- 🔍 **全文搜索** - 快速查找文章内容
- 👤 **用户认证** - 安全的管理员登录
- 💾 **数据持久化** - PostgreSQL企业级数据库
- 📱 **响应式设计** - 支持移动端和桌面端
- ⚡ **高性能** - 原生SQL查询，连接池优化

## 🏗️ 技术栈

### 后端
- **Runtime**: Node.js + Express.js
- **数据库**: PostgreSQL (原生pg驱动)
- **认证**: JWT + bcryptjs
- **部署**: Railway

### 前端
- **Framework**: Next.js 15 + TypeScript
- **样式**: Tailwind CSS
- **UI组件**: React + Lucide Icons
- **部署**: Vercel

## 🚀 在线访问

- **博客网站**: https://yangzhen-blog-railway.vercel.app
- **API服务**: https://yangzhen-blog-railway-production.up.railway.app

## 📁 项目结构

\`\`\`
yangzhen-blog-railway/
├── server-postgres-native.js     # 主服务器 (PostgreSQL)
├── fullstack/
│   ├── frontend/                  # Next.js前端项目
│   └── backend/                   # 备用后端配置
├── package.json                   # 后端依赖
├── railway.json                   # Railway配置
└── docs/                          # 项目文档
\`\`\`

## 🛠️ 本地开发

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 后端开发
\`\`\`bash
# 克隆项目
git clone https://github.com/spsz831/yangzhen-blog-railway.git
cd yangzhen-blog-railway

# 安装依赖
npm install

# 启动开发服务器 (需要PostgreSQL连接)
npm run dev
\`\`\`

### 前端开发
\`\`\`bash
# 进入前端目录
cd fullstack/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
\`\`\`

## 🌐 部署指南

### Railway (后端)
1. 连接GitHub仓库到Railway
2. 添加PostgreSQL服务
3. 设置环境变量
4. 自动部署完成

### Vercel (前端)
1. 连接GitHub仓库到Vercel
2. 设置构建目录为 \`fullstack/frontend\`
3. 配置环境变量
4. 自动部署完成

## 🔧 环境变量

### 后端 (Railway)
\`\`\`bash
DATABASE_URL=postgresql://...    # Railway自动生成
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=3005
\`\`\`

### 前端 (Vercel)
\`\`\`bash
NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app
\`\`\`

## 👤 管理员账户

- **用户名**: yangzhen
- **密码**: admin123456
- **访问方式**: 点击网站标题10次快速进入管理页面

## 🔄 版本历史

- **v3.0** - PostgreSQL原生驱动重构
- **v2.0** - 全栈分离部署
- **v1.0** - 初始MVP版本

## 📖 API文档

### 认证接口
- \`POST /api/auth/login\` - 用户登录

### 文章接口
- \`GET /api/posts\` - 获取文章列表
- \`GET /api/posts/:slug\` - 获取单篇文章
- \`POST /api/posts\` - 创建文章 (需要认证)
- \`PUT /api/posts/:id\` - 更新文章 (需要认证)

### 系统接口
- \`GET /api/status\` - 系统状态
- \`GET /health\` - 健康检查

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

- **作者**: 杨振
- **GitHub**: [@spsz831](https://github.com/spsz831)
- **博客**: [yangzhen-blog-railway.vercel.app](https://yangzhen-blog-railway.vercel.app)

---

*使用 [Claude Code](https://claude.ai/code) 构建 ⚡*